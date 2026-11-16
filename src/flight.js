import * as THREE from 'three';

export class FlightController {
  constructor(shipRoot, camera) {
    this.ship = shipRoot;
    this.camera = camera;

    this.mode = 'arcade'; // 'arcade' | 'manual'
    this.cameraMode = 'chase'; // 'chase' | 'orbit'

    // Speed & Throttle: supports reverse (-35), stationary (0), forward cruise (0..80), and boost (220)
    this.speed = 24;
    this.targetThrottleSpeed = 24;
    this.minReverseSpeed = -35;
    this.maxCruiseSpeed = 80;
    this.boostSpeed = 220;
    this.boostEnergy = 100;
    this.fuel = 100;
    this.isBoosting = false;

    // Camera Zoom (distance in meters behind/around ship)
    this.zoomDistance = 12;
    this.minZoom = 5;
    this.maxZoom = 1400;

    this.keys = new Set();
    // On-screen button state held by user
    this.uiHeld = new Set();

    this.mouseSteerEnabled = true;
    this.pointer = { x: 0, y: 0, active: false };
    this.clickTracker = { downX: 0, downY: 0, startedOnCanvas: false };
    this.orbit = { yaw: 0.35, pitch: 0.22, dragging: false, lastX: 0, lastY: 0 };

    this.autopilotTarget = null;
    this.lockedOrbitTarget = null;
    this.lockedOrbitOffset = new THREE.Vector3();
    this.lastAutopilotTargetPos = new THREE.Vector3();
    this.onAutopilotArrive = null;
    this.onStateChange = null;
    this.onCanvasClick = null;

    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.initializedCam = false;

    // Pre-allocated scratch math objects to eliminate per-frame GC allocations
    this._upVec = new THREE.Vector3(0, 1, 0);
    this._tmpVec1 = new THREE.Vector3();
    this._tmpVec2 = new THREE.Vector3();
    this._tmpVec3 = new THREE.Vector3();
    this._tmpMat4 = new THREE.Matrix4();
    this._tmpQuat = new THREE.Quaternion();
    this._tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      this.keys.add(e.code);
      if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        this.stepZoom(-1);
      } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        this.stepZoom(1);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.uiHeld.clear();
      this.orbit.dragging = false;
      this.clickTracker.startedOnCanvas = false;
      this.pointer.active = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;

      if (this.orbit.dragging) {
        const dx = e.clientX - this.orbit.lastX;
        const dy = e.clientY - this.orbit.lastY;
        this.orbit.yaw -= dx * 0.006;
        this.orbit.pitch = THREE.MathUtils.clamp(this.orbit.pitch + dy * 0.006, -1.15, 1.15);
        this.orbit.lastX = e.clientX;
        this.orbit.lastY = e.clientY;
        return;
      }
      this.pointer.active = !Boolean(e.target.closest('.glass'));
    });

    window.addEventListener('mousedown', (e) => {
      const inUiCard = e.target.closest('.glass');
      if (inUiCard) {
        this.clickTracker.startedOnCanvas = false;
        return;
      }
      this.clickTracker.startedOnCanvas = e.button === 0;
      this.clickTracker.downX = e.clientX;
      this.clickTracker.downY = e.clientY;
      if (this.cameraMode === 'orbit' || e.button === 2) {
        this.orbit.dragging = true;
        this.orbit.lastX = e.clientX;
        this.orbit.lastY = e.clientY;
      }
    });

    window.addEventListener('mouseup', (e) => {
      this.orbit.dragging = false;
      if (this.clickTracker.startedOnCanvas && e.button === 0 && !e.target.closest('.glass')) {
        const moved = Math.hypot(e.clientX - this.clickTracker.downX, e.clientY - this.clickTracker.downY);
        if (moved < 6) {
          const handled = this.onCanvasClick ? this.onCanvasClick(e.clientX, e.clientY) : false;
          if (!handled) {
            this.toggleMouseSteer();
          }
        }
      }
      this.clickTracker.startedOnCanvas = false;
    });

    window.addEventListener(
      'wheel',
      (e) => {
        if (e.target.closest('.glass')) return;
        e.preventDefault();
        const dir = Math.sign(e.deltaY);
        if (dir !== 0) {
          this.setZoom(this.zoomDistance * (1 + dir * 0.14));
        }
      },
      { passive: false }
    );
  }

  setMode(mode) {
    this.mode = mode;
  }

  toggleMouseSteer() {
    this.mouseSteerEnabled = !this.mouseSteerEnabled;
    if (this.onStateChange) this.onStateChange();
    return this.mouseSteerEnabled;
  }

  setCameraMode(camMode) {
    this.cameraMode = camMode;
  }

  setZoom(dist) {
    this.zoomDistance = THREE.MathUtils.clamp(dist, this.minZoom, this.maxZoom);
    if (this.onStateChange) this.onStateChange();
  }

  stepZoom(direction) {
    this.setZoom(this.zoomDistance * (direction > 0 ? 1.16 : 1 / 1.16));
  }

  zoomToSliderValue(dist = this.zoomDistance) {
    const clamped = THREE.MathUtils.clamp(dist, this.minZoom, this.maxZoom);
    const ratio = Math.log(clamped / this.minZoom) / Math.log(this.maxZoom / this.minZoom);
    return Math.round(ratio * 100);
  }

  sliderValueToZoom(sliderVal) {
    const t = THREE.MathUtils.clamp(Number(sliderVal) / 100, 0, 1);
    return this.minZoom * Math.pow(this.maxZoom / this.minZoom, t);
  }

  resetCameraView() {
    this.orbit.yaw = 0.35;
    this.orbit.pitch = 0.22;
    this.setZoom(12);
  }

  setTargetSpeed(spd) {
    this.autopilotTarget = null;
    this.targetThrottleSpeed = THREE.MathUtils.clamp(spd, this.minReverseSpeed, this.maxCruiseSpeed);
    if (Math.abs(this.targetThrottleSpeed) > 0.5) {
      this.lockedOrbitTarget = null;
    }
    if (this.onStateChange) this.onStateChange();
  }

  toggleStop() {
    if (Math.abs(this.targetThrottleSpeed) > 0.5) {
      this.setTargetSpeed(0);
      return true;
    }
    this.setTargetSpeed(24);
    return false;
  }

  get isStopped() {
    return !this.autopilotTarget && Math.abs(this.targetThrottleSpeed) < 0.5 && Math.abs(this.speed) < 1.0;
  }

  setAutopilot(dest) {
    if (dest && this.lockedOrbitTarget === dest && this.isStopped) {
      return;
    }
    this.autopilotTarget = dest;
    if (dest) {
      this.lockedOrbitTarget = null;
      this.lastAutopilotTargetPos.copy(dest.worldPosition);
    }
    if (this.onStateChange) this.onStateChange();
  }

  _getForwardLookQuat(targetPos) {
    this._tmpMat4.lookAt(this.ship.position, targetPos, this._upVec);
    return this._tmpQuat.setFromRotationMatrix(this._tmpMat4);
  }

  refuel() {
    this.fuel = 100;
    this.boostEnergy = 100;
    if (this.onStateChange) this.onStateChange();
  }

  warpTo(dest) {
    this.autopilotTarget = null;
    this.targetThrottleSpeed = 0;
    const arrivePos = dest.worldPosition.clone().add(dest.approachOffset);
    this.ship.position.copy(arrivePos);
    this.ship.quaternion.copy(this._getForwardLookQuat(dest.worldPosition));
    this.speed = 0;
    this.fuel = 100;
    this.lockedOrbitTarget = dest;
    this.lockedOrbitOffset.copy(this.ship.position).sub(dest.worldPosition);
    this.initializedCam = false;
    if (this.onStateChange) this.onStateChange();
  }

  setUiHold(action, active) {
    if (active) {
      this.uiHeld.add(action);
    } else {
      this.uiHeld.delete(action);
    }
  }

  update(dt) {
    const clampedDt = Math.min(dt, 0.05);

    // Camera orbit rotation buttons
    if (this.uiHeld.has('camLeft')) this.orbit.yaw += clampedDt * 1.6;
    if (this.uiHeld.has('camRight')) this.orbit.yaw -= clampedDt * 1.6;
    if (this.uiHeld.has('camUp')) this.orbit.pitch = THREE.MathUtils.clamp(this.orbit.pitch + clampedDt * 1.2, -1.15, 1.15);
    if (this.uiHeld.has('camDown')) this.orbit.pitch = THREE.MathUtils.clamp(this.orbit.pitch - clampedDt * 1.2, -1.15, 1.15);
    if (this.uiHeld.has('zoomIn')) this.setZoom(this.zoomDistance * (1 - clampedDt * 0.85));
    if (this.uiHeld.has('zoomOut')) this.setZoom(this.zoomDistance * (1 + clampedDt * 0.85));

    const manualSteer =
      this.keys.has('KeyW') ||
      this.keys.has('KeyS') ||
      this.keys.has('KeyA') ||
      this.keys.has('KeyD') ||
      this.keys.has('KeyQ') ||
      this.keys.has('KeyE') ||
      this.keys.has('ArrowUp') ||
      this.keys.has('ArrowDown') ||
      this.keys.has('ArrowLeft') ||
      this.keys.has('ArrowRight') ||
      this.uiHeld.has('up') ||
      this.uiHeld.has('down') ||
      this.uiHeld.has('left') ||
      this.uiHeld.has('right') ||
      this.uiHeld.has('rollL') ||
      this.uiHeld.has('rollR');

    if (manualSteer && this.autopilotTarget) {
      this.autopilotTarget = null;
    }

    let desiredSpeed = this.targetThrottleSpeed;
    const wantBoost = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.uiHeld.has('boost');
    const wantBrake = this.keys.has('Space');

    if (this.autopilotTarget) {
      const targetDelta = this._tmpVec1.copy(this.autopilotTarget.worldPosition).sub(this.lastAutopilotTargetPos);
      this.lastAutopilotTargetPos.copy(this.autopilotTarget.worldPosition);

      const targetPoint = this._tmpVec2.copy(this.autopilotTarget.worldPosition).add(this.autopilotTarget.approachOffset);
      const toTarget = this._tmpVec3.copy(targetPoint).sub(this.ship.position);
      const dist = toTarget.length();
      const captureRadius = Math.max(24, this.autopilotTarget.radius * 0.8);

      if (dist < 140) {
        const leadFactor = 1 - Math.max(0, (dist - captureRadius) / (140 - captureRadius));
        this.ship.position.addScaledVector(targetDelta, leadFactor);
      }

      if (dist < captureRadius) {
        const arrivedDest = this.autopilotTarget;
        this.autopilotTarget = null;
        this.targetThrottleSpeed = 0;
        desiredSpeed = 0;
        this.speed = 0;
        this.fuel = 100;
        this.isBoosting = false;
        this.lockedOrbitTarget = arrivedDest;
        this.lockedOrbitOffset.copy(this.ship.position).sub(arrivedDest.worldPosition);
        this.ship.quaternion.copy(this._getForwardLookQuat(arrivedDest.worldPosition));
        if (this.onAutopilotArrive) this.onAutopilotArrive(arrivedDest);
      } else {
        // Smoothly blend look target toward destination center during final approach so arrival never snaps
        const blend = dist < 110 ? 1 - Math.max(0, (dist - captureRadius) / (110 - captureRadius)) : 0;
        const lookTarget = this._tmpVec3.copy(targetPoint).lerp(this.autopilotTarget.worldPosition, blend);
        const desiredQuat = this._getForwardLookQuat(lookTarget);
        const turnRate = 3.5 + (1 - Math.min(1, dist / 200)) * 6.0;
        this.ship.quaternion.slerp(desiredQuat, Math.min(1, clampedDt * turnRate));
        const baseApproach = dist > 380 ? this.boostSpeed : THREE.MathUtils.lerp(18, 160, Math.min(1, dist / 380));
        desiredSpeed = dist < 120 ? Math.min(baseApproach, dist * 1.2) : baseApproach;
        this.isBoosting = dist > 240;
      }
    } else {
      // Keyboard / UI button throttle adjustments
      if (this.keys.has('KeyR') || this.uiHeld.has('forward')) {
        this.setTargetSpeed(this.targetThrottleSpeed + clampedDt * 42);
      }
      if (this.keys.has('KeyF') || this.uiHeld.has('reverse')) {
        this.setTargetSpeed(this.targetThrottleSpeed - clampedDt * 42);
      }

      if (wantBrake) {
        this.setTargetSpeed(0);
        desiredSpeed = 0;
        this.isBoosting = false;
      } else if (wantBoost && this.boostEnergy > 4 && this.fuel > 1) {
        desiredSpeed = this.boostSpeed;
        this.isBoosting = true;
        this.lockedOrbitTarget = null;
        this.boostEnergy = Math.max(0, this.boostEnergy - clampedDt * 20);
        this.fuel = Math.max(0, this.fuel - clampedDt * 1.4);
      } else {
        this.isBoosting = false;
        const speedCap = this.fuel > 0.5 ? this.maxCruiseSpeed : 8;
        desiredSpeed = THREE.MathUtils.clamp(this.targetThrottleSpeed, this.minReverseSpeed, speedCap);
        if (Math.abs(desiredSpeed) > 1.0) {
          this.lockedOrbitTarget = null;
          if (this.fuel > 0) {
            this.fuel = Math.max(0, this.fuel - clampedDt * 0.25 * (Math.abs(desiredSpeed) / this.maxCruiseSpeed));
          }
        }
      }

      if (!this.isBoosting) {
        this.boostEnergy = Math.min(100, this.boostEnergy + clampedDt * 14);
      }

      if (this.mode === 'arcade') {
        this._updateArcadeRotation(clampedDt);
      } else {
        this._updateManualRotation(clampedDt);
      }
    }

    this.speed = THREE.MathUtils.lerp(this.speed, desiredSpeed, clampedDt * 4.0);

    if (this.isStopped && this.lockedOrbitTarget) {
      this.speed = 0;
      const prevPos = this._tmpVec1.copy(this.ship.position);
      this.ship.position.copy(this.lockedOrbitTarget.worldPosition).add(this.lockedOrbitOffset);
      const orbitDelta = this._tmpVec2.copy(this.ship.position).sub(prevPos);
      this.camPos.add(orbitDelta);
      this.camLook.add(orbitDelta);
    } else {
      const forward = this._tmpVec1.set(0, 0, -1).applyQuaternion(this.ship.quaternion);
      this.ship.position.addScaledVector(forward, this.speed * clampedDt);
    }

    this._updateCamera(clampedDt);

    return {
      speed: this.speed,
      targetThrottleSpeed: this.targetThrottleSpeed,
      zoomDistance: this.zoomDistance,
      boostEnergy: this.boostEnergy,
      fuel: this.fuel,
      isBoosting: this.isBoosting,
      isStopped: this.isStopped,
      throttle: THREE.MathUtils.clamp(Math.abs(this.speed) / this.maxCruiseSpeed, 0, 1)
    };
  }

  _updateArcadeRotation(dt) {
    let yawInput = 0;
    let pitchInput = 0;
    let manualRollOffset = 0;

    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft') || this.uiHeld.has('left')) yawInput += 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight') || this.uiHeld.has('right')) yawInput -= 1;
    if (this.keys.has('KeyQ') || this.uiHeld.has('rollL')) {
      yawInput += 0.65;
      manualRollOffset += 0.55;
    }
    if (this.keys.has('KeyE') || this.uiHeld.has('rollR')) {
      yawInput -= 0.65;
      manualRollOffset -= 0.55;
    }
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp') || this.uiHeld.has('up')) pitchInput += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown') || this.uiHeld.has('down')) pitchInput -= 1;

    if (this.mouseSteerEnabled && this.pointer.active && this.cameraMode === 'chase') {
      const deadzone = 0.12;
      if (Math.abs(this.pointer.x) > deadzone) yawInput -= (this.pointer.x - Math.sign(this.pointer.x) * deadzone) * 0.95;
      if (Math.abs(this.pointer.y) > deadzone) pitchInput -= (this.pointer.y - Math.sign(this.pointer.y) * deadzone) * 0.8;
    }

    yawInput = THREE.MathUtils.clamp(yawInput, -1.3, 1.3);
    pitchInput = THREE.MathUtils.clamp(pitchInput, -1.2, 1.2);

    const euler = this._tmpEuler.setFromQuaternion(this.ship.quaternion, 'YXZ');
    euler.y += yawInput * dt * 1.25;
    euler.x = THREE.MathUtils.clamp(euler.x + pitchInput * dt * 1.05, -1.25, 1.25);

    const targetRoll = THREE.MathUtils.clamp(yawInput * 0.48 + manualRollOffset, -0.85, 0.85);
    euler.z = THREE.MathUtils.lerp(euler.z, targetRoll, dt * 4.5);

    this.ship.quaternion.setFromEuler(euler);
  }

  _updateManualRotation(dt) {
    let pitch = 0;
    let roll = 0;
    let yaw = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp') || this.uiHeld.has('up')) pitch += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown') || this.uiHeld.has('down')) pitch -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft') || this.uiHeld.has('rollL')) roll += 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight') || this.uiHeld.has('rollR')) roll -= 1;
    if (this.keys.has('KeyQ') || this.uiHeld.has('left')) yaw += 1;
    if (this.keys.has('KeyE') || this.uiHeld.has('right')) yaw -= 1;

    if (this.mouseSteerEnabled && this.pointer.active && this.cameraMode === 'chase') {
      const deadzone = 0.12;
      if (Math.abs(this.pointer.x) > deadzone) yaw -= (this.pointer.x - Math.sign(this.pointer.x) * deadzone) * 0.95;
      if (Math.abs(this.pointer.y) > deadzone) pitch -= (this.pointer.y - Math.sign(this.pointer.y) * deadzone) * 0.8;
    }

    const rotEuler = this._tmpEuler.set(pitch * dt * 1.5, yaw * dt * 1.35, roll * dt * 2.1, 'YXZ');
    this._tmpQuat.setFromEuler(rotEuler);
    this.ship.quaternion.multiply(this._tmpQuat).normalize();
  }

  _updateCamera(dt) {
    if (this.cameraMode === 'chase') {
      const boostPull = this.isBoosting ? 3.8 : 0;
      const zDist = this.zoomDistance + boostPull;
      const yDist = Math.max(1.6, this.zoomDistance * 0.26);

      const desiredPos = this._tmpVec1
        .set(0, yDist, zDist)
        .applyQuaternion(this.ship.quaternion)
        .add(this.ship.position);
      const lookAhead = THREE.MathUtils.lerp(-18, 0, Math.min(1, Math.max(0, (this.zoomDistance - 25) / 120)));
      const desiredLook = this._tmpVec2
        .set(0, 0.4, lookAhead)
        .applyQuaternion(this.ship.quaternion)
        .add(this.ship.position);

      if (!this.initializedCam) {
        this.camPos.copy(desiredPos);
        this.camLook.copy(desiredLook);
        this.initializedCam = true;
      } else {
        this.camPos.lerp(desiredPos, 1 - Math.exp(-dt * 9.0));
        this.camLook.lerp(desiredLook, 1 - Math.exp(-dt * 12));
      }

      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.camLook);

      const targetFov = this.isBoosting ? 76 : 60;
      if (Math.abs(this.camera.fov - targetFov) > 0.1) {
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 5);
        this.camera.updateProjectionMatrix();
      }
    } else {
      const d = this.zoomDistance;
      const offset = this._tmpVec1.set(
        Math.sin(this.orbit.yaw) * Math.cos(this.orbit.pitch) * d,
        Math.sin(this.orbit.pitch) * d,
        Math.cos(this.orbit.yaw) * Math.cos(this.orbit.pitch) * d
      );
      this.camera.position.copy(this.ship.position).add(offset);
      this.camera.lookAt(this.ship.position);
      if (Math.abs(this.camera.fov - 55) > 0.1) {
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 55, dt * 5);
        this.camera.updateProjectionMatrix();
      }
    }
  }
}
