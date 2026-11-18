import * as THREE from 'three';

export class FlightController {
  constructor(shipRoot, camera) {
    this.ship = shipRoot;
    this.camera = camera;

    this.mode = 'arcade'; // 'arcade' | 'manual'
    this.cameraMode = 'chase'; // 'chase' | 'orbit'

    // Speed & Velocity: 3D inertial velocity vector supporting reverse (-35), coast/hover (0), cruise (80), and boost (220)
    this.velocity = new THREE.Vector3();
    this.speed = 0;
    this.targetThrottleSpeed = 0;
    this.cruiseHoldActive = false;
    this.dampenersEnabled = true;
    this.minReverseSpeed = -35;
    this.maxCruiseSpeed = 80;
    this.boostSpeed = 280;
    this.boostEnergy = 100;
    this.fuel = 100;
    this.isBoosting = false;
    this._forwardThrust = 0;
    this._retroThrust = 0;
    this._fwdHoldTime = 0;
    this._revHoldTime = 0;
    this.autoOrbitLockArmed = false;
    this.angularVel = { pitch: 0, yaw: 0, roll: 0 };

    // Camera Zoom (distance in meters behind/around ship)
    this.zoomDistance = 3.8;
    this.minZoom = 1.8;
    this.maxZoom = 3200;

    this.keys = new Set();
    // On-screen button state held by user
    this.uiHeld = new Set();

    this.mouseSteerEnabled = false;
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
    this.onCanvasDoubleClick = null;

    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.initializedCam = false;

    // Pre-allocated scratch math objects to eliminate per-frame GC allocations
    this._upVec = new THREE.Vector3(0, 1, 0);
    this._tmpVec1 = new THREE.Vector3();
    this._tmpVec2 = new THREE.Vector3();
    this._tmpVec3 = new THREE.Vector3();
    this._tmpVec4 = new THREE.Vector3();
    this._velDir = new THREE.Vector3(0, 0, -1);
    this._tmpMat4 = new THREE.Matrix4();
    this._tmpQuat = new THREE.Quaternion();
    this._tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    this._bindEvents();
  }

  _bindEvents() {
    const FLIGHT_KEYS = new Set([
      'KeyW',
      'KeyS',
      'KeyA',
      'KeyD',
      'KeyQ',
      'KeyE',
      'KeyF',
      'KeyR',
      'KeyX',
      'Space',
      'Digit0',
      'Numpad0',
      'ShiftLeft',
      'ShiftRight',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Equal',
      'Minus',
      'NumpadAdd',
      'NumpadSubtract'
    ]);

    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'TEXTAREA' || e.target?.isContentEditable || (tag === 'INPUT' && e.target.type !== 'range')) {
        return;
      }
      if (FLIGHT_KEYS.has(e.code)) {
        e.preventDefault();
        if (document.activeElement && (document.activeElement.tagName === 'BUTTON' || document.activeElement.tagName === 'INPUT')) {
          document.activeElement.blur();
        }
      }
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

    window.addEventListener('dblclick', (e) => {
      if (e.target.closest('.glass')) return;
      if (this.onCanvasDoubleClick) {
        this.onCanvasDoubleClick(e.clientX, e.clientY);
      }
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
    this.setZoom(3.8);
  }

  toggleDampeners() {
    this.dampenersEnabled = !this.dampenersEnabled;
    if (this.onStateChange) this.onStateChange();
    return this.dampenersEnabled;
  }

  setTargetSpeed(spd) {
    this.autopilotTarget = null;
    this.targetThrottleSpeed = THREE.MathUtils.clamp(spd, this.minReverseSpeed, this.maxCruiseSpeed);
    this.cruiseHoldActive = Math.abs(this.targetThrottleSpeed) > 0.5;
    if (this.cruiseHoldActive) {
      this.lockedOrbitTarget = null;
      this.autoOrbitLockArmed = true;
    }
    if (this.onStateChange) this.onStateChange();
  }

  stopShip() {
    this.autopilotTarget = null;
    this.cruiseHoldActive = false;
    this.targetThrottleSpeed = 0;
    this.velocity.set(0, 0, 0);
    this.speed = 0;
    this.isBoosting = false;
    this._forwardThrust = 0;
    this._retroThrust = 0;
    this._fwdHoldTime = 0;
    this._revHoldTime = 0;
    if (this.onStateChange) this.onStateChange();
  }

  toggleStop() {
    if (this.velocity.length() > 0.5 || this.cruiseHoldActive) {
      this.stopShip();
      return true;
    }
    this.setTargetSpeed(24);
    return false;
  }

  get isThrusting() {
    return (
      this.keys.has('KeyF') ||
      this.keys.has('KeyR') ||
      this.keys.has('ShiftLeft') ||
      this.keys.has('ShiftRight') ||
      this.uiHeld.has('forward') ||
      this.uiHeld.has('reverse') ||
      this.uiHeld.has('boost')
    );
  }

  get isStopped() {
    return (
      !this.autopilotTarget &&
      !this.cruiseHoldActive &&
      !this.isThrusting &&
      this.velocity.length() < 0.8
    );
  }

  setAutopilot(dest) {
    if (dest && this.lockedOrbitTarget === dest && this.isStopped) {
      return;
    }
    this.autopilotTarget = dest;
    if (dest) {
      this.cruiseHoldActive = false;
      this.targetThrottleSpeed = 0;
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

  _getMoonOutwardOffset(dest) {
    if (!dest.parentObj) return dest.approachOffset.clone();
    const outDir = this._tmpVec3
      .copy(dest.worldPosition)
      .sub(dest.parentObj.worldPosition);
    outDir.y = 0;
    if (outDir.lengthSq() < 1e-4) {
      return dest.approachOffset.clone();
    }
    outDir.normalize().applyAxisAngle(this._upVec, 0.38);
    const horizDist = dest.approachOffset.z || Math.max(12, dest.radius * 2.8);
    return new THREE.Vector3(outDir.x * horizDist, dest.approachOffset.y, outDir.z * horizDist);
  }

  warpTo(dest, { lockOrbit = true } = {}) {
    this.autopilotTarget = null;
    this.cruiseHoldActive = false;
    this.targetThrottleSpeed = 0;
    const offset = dest.parentObj ? this._getMoonOutwardOffset(dest) : dest.approachOffset;
    const arrivePos = dest.worldPosition.clone().add(offset);
    this.ship.position.copy(arrivePos);
    this.ship.quaternion.copy(this._getForwardLookQuat(dest.worldPosition));
    this.velocity.set(0, 0, 0);
    this.speed = 0;
    this._fwdHoldTime = 0;
    this._revHoldTime = 0;
    this.angularVel.pitch = 0;
    this.angularVel.yaw = 0;
    this.angularVel.roll = 0;
    this.fuel = 100;
    this.lockedOrbitTarget = lockOrbit ? dest : null;
    this.autoOrbitLockArmed = lockOrbit;
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

  update(dt, zoneObjects = []) {
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

    const wantForward = this.keys.has('KeyF') || this.uiHeld.has('forward');
    const wantReverse = this.keys.has('KeyR') || this.uiHeld.has('reverse');
    const wantBoost = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.uiHeld.has('boost');
    const wantBrake =
      this.keys.has('Space') || this.keys.has('KeyX') || this.keys.has('Digit0') || this.keys.has('Numpad0');
    const manualThrottle = wantBrake || wantBoost || wantForward || wantReverse;

    if ((manualSteer || manualThrottle) && this.autopilotTarget) {
      this.autopilotTarget = null;
    }

    const forward = this._tmpVec4.set(0, 0, -1).applyQuaternion(this.ship.quaternion).normalize();
    this._forwardThrust = 0;
    this._retroThrust = 0;

    if (this.autopilotTarget) {
      const targetDelta = this._tmpVec1.copy(this.autopilotTarget.worldPosition).sub(this.lastAutopilotTargetPos);
      this.lastAutopilotTargetPos.copy(this.autopilotTarget.worldPosition);

      const standoffDist = this.autopilotTarget.approachOffset
        ? this.autopilotTarget.approachOffset.length()
        : Math.max(42, this.autopilotTarget.radius * 2.8);
      const distToCenter = this.ship.position.distanceTo(this.autopilotTarget.worldPosition);
      const remDist = Math.max(0, distToCenter - standoffDist);

      // Match moving target velocity during approach so fast-moving planets never drift away
      if (remDist < 220) {
        const leadFactor = 1 - Math.min(1, remDist / 220);
        this.ship.position.addScaledVector(targetDelta, leadFactor);
      }

      if (remDist <= 4.0) {
        const arrivedDest = this.autopilotTarget;
        this.autopilotTarget = null;
        this.cruiseHoldActive = false;
        this.targetThrottleSpeed = 0;
        this.velocity.set(0, 0, 0);
        this.speed = 0;
        this.fuel = 100;
        this.isBoosting = false;
        this.lockedOrbitTarget = arrivedDest;
        this.lockedOrbitOffset.copy(this.ship.position).sub(arrivedDest.worldPosition);
        this.ship.quaternion.copy(this._getForwardLookQuat(arrivedDest.worldPosition));
        if (this.onAutopilotArrive) this.onAutopilotArrive(arrivedDest);
      } else {
        const desiredQuat = this._getForwardLookQuat(this.autopilotTarget.worldPosition);
        const turnRate = 4.2 + (1 - Math.min(1, remDist / 260)) * 7.5;
        this.ship.quaternion.slerp(desiredQuat, Math.min(1, clampedDt * turnRate));
        const baseApproach = remDist > 520 ? this.boostSpeed : THREE.MathUtils.lerp(24, 215, Math.min(1, remDist / 520));
        const desiredSpeed = remDist < 140 ? Math.min(baseApproach, Math.max(14, remDist * 1.25)) : baseApproach;
        this.isBoosting = remDist > 300;
        const desiredVel = this._tmpVec2.copy(forward).multiplyScalar(desiredSpeed);
        this.velocity.lerp(desiredVel, 1 - Math.exp(-clampedDt * 5.0));
        this._forwardThrust = THREE.MathUtils.clamp(desiredSpeed / this.maxCruiseSpeed, 0.25, 1.0);
      }
    } else {
      if (wantBrake) {
        this.stopShip();
      } else {
        if (wantForward || wantReverse || wantBoost) {
          this.cruiseHoldActive = false;
          this.lockedOrbitTarget = null;
          this.autoOrbitLockArmed = true;
        }
        if (!wantForward) this._fwdHoldTime = 0;
        if (!wantReverse) this._revHoldTime = 0;

        const speedCap = this.fuel > 0.5 ? this.maxCruiseSpeed : 8;
        const forwardSpeed = this.velocity.dot(forward);

        if (wantBoost && this.boostEnergy > 4 && this.fuel > 1) {
          this.isBoosting = true;
          this._forwardThrust = 1.0;
          // Boost accelerates strongly along nose and aligns lateral drift
          const targetBoostVel = this._tmpVec1.copy(forward).multiplyScalar(this.boostSpeed);
          this.velocity.lerp(targetBoostVel, 1 - Math.exp(-clampedDt * 2.1));
          this.boostEnergy = Math.max(0, this.boostEnergy - clampedDt * 20);
          this.fuel = Math.max(0, this.fuel - clampedDt * 1.4);
        } else {
          this.isBoosting = false;
          this.boostEnergy = Math.min(100, this.boostEnergy + clampedDt * 14);

          if (wantForward && !wantReverse) {
            this._fwdHoldTime = Math.min(2.5, this._fwdHoldTime + clampedDt);
            const spool = THREE.MathUtils.smoothstep(this._fwdHoldTime, 0.0, 1.35);
            this._forwardThrust = 0.35 + 0.65 * spool;
            const speedFactor = 1 - 0.35 * THREE.MathUtils.clamp(forwardSpeed / speedCap, 0, 1);
            const accel = forwardSpeed < 0 ? 28 : (8.0 + 20.0 * spool) * speedFactor;
            this.velocity.addScaledVector(forward, accel * clampedDt);
            if (this.dampenersEnabled) {
              // Lateral RCS coupling gently trims sideways drift during turns
              const newFwd = this.velocity.dot(forward);
              const coupledVel = this._tmpVec1.copy(forward).multiplyScalar(newFwd);
              this.velocity.lerp(coupledVel, 1 - Math.exp(-clampedDt * 4.2));
            }
            const curMag = this.velocity.length();
            if (curMag > speedCap) {
              const targetMag = THREE.MathUtils.lerp(curMag, speedCap, 1 - Math.exp(-clampedDt * 2.5));
              this.velocity.multiplyScalar(targetMag / curMag);
            }
            if (this.fuel > 0) {
              this.fuel = Math.max(0, this.fuel - clampedDt * 0.28);
            }
          } else if (wantReverse && !wantForward) {
            this._revHoldTime = Math.min(2.0, this._revHoldTime + clampedDt);
            const revSpool = THREE.MathUtils.smoothstep(this._revHoldTime, 0.0, 1.1);
            if (forwardSpeed > 1.0) {
              // Active retro-braking from forward motion fires front wing retro-thrusters immediately
              this._retroThrust = 0.55 + 0.45 * revSpool;
              const brakeDecel = 22 + 20 * revSpool;
              this.velocity.addScaledVector(forward, -brakeDecel * clampedDt);
              if (this.dampenersEnabled) {
                const newFwd = this.velocity.dot(forward);
                const coupledVel = this._tmpVec1.copy(forward).multiplyScalar(newFwd);
                this.velocity.lerp(coupledVel, 1 - Math.exp(-clampedDt * 4.5));
              }
            } else {
              this._retroThrust = 0.4 + 0.45 * revSpool;
              const revAccel = 7.0 + 13.0 * revSpool;
              if (forwardSpeed > this.minReverseSpeed) {
                this.velocity.addScaledVector(forward, -revAccel * clampedDt);
              }
              const clampedFwd = Math.max(this.minReverseSpeed, this.velocity.dot(forward));
              const revTarget = this._tmpVec1.copy(forward).multiplyScalar(clampedFwd);
              this.velocity.lerp(revTarget, 1 - Math.exp(-clampedDt * 4.5));
            }
            if (this.fuel > 0) {
              this.fuel = Math.max(0, this.fuel - clampedDt * 0.22);
            }
          } else if (this.cruiseHoldActive) {
            const clampedTarget = THREE.MathUtils.clamp(this.targetThrottleSpeed, this.minReverseSpeed, speedCap);
            const targetVel = this._tmpVec1.copy(forward).multiplyScalar(clampedTarget);
            const dv = clampedTarget - forwardSpeed;
            if (dv > 1.5) this._forwardThrust = THREE.MathUtils.clamp(dv / 30, 0.25, 0.85);
            else if (dv < -1.5) this._retroThrust = THREE.MathUtils.clamp(-dv / 30, 0.25, 0.85);
            else if (clampedTarget > 1.0) this._forwardThrust = 0.22;
            else if (clampedTarget < -1.0) this._retroThrust = 0.22;
            this.velocity.lerp(targetVel, 1 - Math.exp(-clampedDt * 3.8));
            if (this.fuel > 0 && Math.abs(clampedTarget) > 1.0) {
              this.fuel = Math.max(0, this.fuel - clampedDt * 0.22 * (Math.abs(clampedTarget) / this.maxCruiseSpeed));
            }
          } else {
            // No thrust key held: either gentle RCS Inertial Damper coast-down, or pure Newtonian vacuum coast
            const speedMag = this.velocity.length();
            if (this.dampenersEnabled) {
              if (speedMag <= 0.12) {
                this.velocity.set(0, 0, 0);
              } else {
                const decel = (speedMag * 0.88 + 6.0) * clampedDt;
                const nextMag = Math.max(0, speedMag - decel);
                this.velocity.multiplyScalar(nextMag / speedMag);
                // Subtle lateral RCS trim keeps turns graceful even while coasting down
                const newFwd = this.velocity.dot(forward);
                const coupledVel = this._tmpVec1.copy(forward).multiplyScalar(newFwd);
                this.velocity.lerp(coupledVel, 1 - Math.exp(-clampedDt * 3.6));
                if (newFwd > 1.2) {
                  this._retroThrust = THREE.MathUtils.clamp(speedMag / 65, 0.14, 0.32);
                } else if (newFwd < -1.2) {
                  this._forwardThrust = THREE.MathUtils.clamp(speedMag / 45, 0.14, 0.28);
                }
              }
            } else {
              // Newtonian Coast (DAMPERS: OFF): preserve momentum with zero fuel burn; bleed only boost overdrive > speedCap
              if (speedMag > speedCap) {
                const settledMag = THREE.MathUtils.lerp(speedMag, speedCap, 1 - Math.exp(-clampedDt * 1.4));
                this.velocity.multiplyScalar(settledMag / speedMag);
              }
            }
          }
        }
      }

      if (this.mode === 'arcade') {
        this._updateArcadeRotation(clampedDt);
      } else {
        this._updateManualRotation(clampedDt);
      }
    }

    const speedMag = this.velocity.length();
    const forwardSpeed = this.velocity.dot(forward);
    this.speed =
      forwardSpeed < -0.5 && Math.abs(forwardSpeed) > speedMag * 0.65 ? -speedMag : speedMag;
    this.targetThrottleSpeed = this.cruiseHoldActive
      ? this.targetThrottleSpeed
      : THREE.MathUtils.clamp(forwardSpeed, this.minReverseSpeed, this.maxCruiseSpeed);

    // Automatically engage station-keeping orbit lock if stopped near a planet after flying
    if (this.autoOrbitLockArmed && this.isStopped && !this.lockedOrbitTarget && zoneObjects.length > 0) {
      let nearest = null;
      let nearestDist = Infinity;
      for (let i = 0; i < zoneObjects.length; i++) {
        const obj = zoneObjects[i];
        const d = this.ship.position.distanceTo(obj.worldPosition);
        if (d < obj.radius * 4.5 + 65 && d < nearestDist) {
          nearest = obj;
          nearestDist = d;
        }
      }
      if (nearest) {
        this.lockedOrbitTarget = nearest;
        this.lockedOrbitOffset.copy(this.ship.position).sub(nearest.worldPosition);
      }
    }

    if (this.isStopped && this.lockedOrbitTarget) {
      this.velocity.set(0, 0, 0);
      this.speed = 0;
      const prevPos = this._tmpVec1.copy(this.ship.position);
      const dAngle = this.lockedOrbitTarget.parentObj ? this.lockedOrbitTarget.deltaOrbitalAngle || 0 : 0;
      if (Math.abs(dAngle) > 1e-7) {
        this.lockedOrbitOffset.applyAxisAngle(this._upVec, -dAngle);
        this._tmpQuat.setFromAxisAngle(this._upVec, -dAngle);
        this.ship.quaternion.premultiply(this._tmpQuat).normalize();
      }
      this.ship.position.copy(this.lockedOrbitTarget.worldPosition).add(this.lockedOrbitOffset);
      const orbitDelta = this._tmpVec2.copy(this.ship.position).sub(prevPos);
      this.camPos.add(orbitDelta);
      this.camLook.add(orbitDelta);
    } else {
      this.ship.position.addScaledVector(this.velocity, clampedDt);
    }

    // Soft planetary surface collision shield so the ship never clips inside solid spheres
    let shieldBump = false;
    for (let i = 0; i < zoneObjects.length; i++) {
      const obj = zoneObjects[i];
      if (obj.visualType === 'nebula' || obj.visualType === 'galaxy') continue;
      const minSafeDist = obj.radius + 1.8;
      const toShip = this._tmpVec2.copy(this.ship.position).sub(obj.worldPosition);
      const d = toShip.length();
      if (d > 0.001 && d < minSafeDist) {
        const normal = toShip.normalize();
        this.ship.position.copy(obj.worldPosition).addScaledVector(normal, minSafeDist);
        const inwardVel = this.velocity.dot(normal);
        if (inwardVel < 0) {
          if (inwardVel < -2.0) shieldBump = true;
          this.velocity.addScaledVector(normal, -inwardVel);
        }
        if (this.isStopped && this.lockedOrbitTarget) {
          this.lockedOrbitOffset.copy(this.ship.position).sub(this.lockedOrbitTarget.worldPosition);
        }
      }
    }

    this._updateCamera(clampedDt);

    if (speedMag > 0.05) {
      this._velDir.copy(this.velocity).multiplyScalar(1 / speedMag);
    } else {
      this._velDir.copy(forward);
    }

    const steerRate =
      Math.abs(this.angularVel.yaw) + Math.abs(this.angularVel.pitch) + Math.abs(this.angularVel.roll);
    const steerActive = manualSteer || (this.mouseSteerEnabled && steerRate > 0.14);
    const steerPan = THREE.MathUtils.clamp(-(this.angularVel.yaw + this.angularVel.roll * 0.5) / 1.4, -0.85, 0.85);

    return {
      speed: this.speed,
      speedMag,
      forwardSpeed,
      velocityDirection: this._velDir,
      forwardThrust: this._forwardThrust,
      retroThrust: this._retroThrust,
      steerActive,
      steerPan,
      shieldBump,
      dampenersEnabled: this.dampenersEnabled,
      cruiseHoldActive: this.cruiseHoldActive,
      targetThrottleSpeed: this.targetThrottleSpeed,
      zoomDistance: this.zoomDistance,
      boostEnergy: this.boostEnergy,
      fuel: this.fuel,
      isBoosting: this.isBoosting,
      isStopped: this.isStopped,
      throttle: THREE.MathUtils.clamp(
        Math.max(this._forwardThrust, this._retroThrust, (speedMag / this.maxCruiseSpeed) * 0.45),
        0,
        1
      )
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

    const rotAlpha = 1 - Math.exp(-dt * 9.5);
    this.angularVel.yaw = THREE.MathUtils.lerp(this.angularVel.yaw, yawInput * 1.25, rotAlpha);
    this.angularVel.pitch = THREE.MathUtils.lerp(this.angularVel.pitch, pitchInput * 1.05, rotAlpha);

    const euler = this._tmpEuler.setFromQuaternion(this.ship.quaternion, 'YXZ');
    euler.y += this.angularVel.yaw * dt;
    euler.x = THREE.MathUtils.clamp(euler.x + this.angularVel.pitch * dt, -1.25, 1.25);

    const targetRoll = THREE.MathUtils.clamp((this.angularVel.yaw / 1.25) * 0.48 + manualRollOffset, -0.85, 0.85);
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

    const dampRate = this.dampenersEnabled ? 8.0 : 4.2;
    const rotAlpha = 1 - Math.exp(-dt * dampRate);
    this.angularVel.pitch = THREE.MathUtils.lerp(this.angularVel.pitch, pitch * 1.5, rotAlpha);
    this.angularVel.yaw = THREE.MathUtils.lerp(this.angularVel.yaw, yaw * 1.35, rotAlpha);
    this.angularVel.roll = THREE.MathUtils.lerp(this.angularVel.roll, roll * 2.1, rotAlpha);

    const rotEuler = this._tmpEuler.set(
      this.angularVel.pitch * dt,
      this.angularVel.yaw * dt,
      this.angularVel.roll * dt,
      'YXZ'
    );
    this._tmpQuat.setFromEuler(rotEuler);
    this.ship.quaternion.multiply(this._tmpQuat).normalize();
  }

  _updateCamera(dt) {
    if (this.cameraMode === 'chase') {
      const boostPull = this.isBoosting ? 1.4 : 0;
      const zDist = this.zoomDistance + boostPull;
      const yDist = Math.max(0.55, this.zoomDistance * 0.25);

      const desiredPos = this._tmpVec1
        .set(0, yDist, zDist)
        .applyQuaternion(this.ship.quaternion)
        .add(this.ship.position);
      const lookAhead = THREE.MathUtils.lerp(-6, 0, Math.min(1, Math.max(0, (this.zoomDistance - 8) / 60)));
      const desiredLook = this._tmpVec2
        .set(0, 0.15, lookAhead)
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
