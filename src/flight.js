import * as THREE from 'three';

export class FlightController {
  constructor(shipRoot, camera) {
    this.ship = shipRoot;
    this.camera = camera;

    this.mode = 'arcade'; // 'arcade' | 'manual'
    this.cameraMode = 'chase'; // 'chase' | 'orbit'

    this.speed = 18;
    this.baseCruiseSpeed = 24;
    this.maxCruiseSpeed = 76;
    this.boostSpeed = 220;
    this.boostEnergy = 100;
    this.isBoosting = false;
    this.isStopped = false;

    this.keys = new Set();
    this.pointer = { x: 0, y: 0, active: false };
    this.orbit = { yaw: 0.45, pitch: 0.24, distance: 15, dragging: false, lastX: 0, lastY: 0 };

    this.autopilotTarget = null;
    this.onAutopilotArrive = null;

    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.initializedCam = false;

    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.cameraMode === 'orbit' && this.orbit.dragging) {
        const dx = e.clientX - this.orbit.lastX;
        const dy = e.clientY - this.orbit.lastY;
        this.orbit.yaw -= dx * 0.006;
        this.orbit.pitch = THREE.MathUtils.clamp(this.orbit.pitch + dy * 0.006, -1.1, 1.1);
        this.orbit.lastX = e.clientX;
        this.orbit.lastY = e.clientY;
        return;
      }
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      this.pointer.active = true;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('#hud')) return;
      if (this.cameraMode === 'orbit') {
        this.orbit.dragging = true;
        this.orbit.lastX = e.clientX;
        this.orbit.lastY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.orbit.dragging = false;
    });

    window.addEventListener('wheel', (e) => {
      if (e.target.closest('#hud')) return;
      if (this.cameraMode === 'orbit') {
        this.orbit.distance = THREE.MathUtils.clamp(this.orbit.distance + e.deltaY * 0.015, 7, 38);
      }
    });
  }

  setMode(mode) {
    this.mode = mode;
  }

  setCameraMode(camMode) {
    this.cameraMode = camMode;
  }

  setAutopilot(dest) {
    this.autopilotTarget = dest;
    if (dest) this.isStopped = false;
  }

  toggleStop() {
    this.isStopped = !this.isStopped;
    if (this.isStopped) {
      this.autopilotTarget = null;
      this.isBoosting = false;
    } else if (this.baseCruiseSpeed < 8) {
      this.baseCruiseSpeed = 24;
    }
    return this.isStopped;
  }

  warpTo(dest) {
    this.autopilotTarget = null;
    this.isStopped = true;
    const arrivePos = dest.worldPosition.clone().add(dest.approachOffset);
    this.ship.position.copy(arrivePos);
    this.ship.lookAt(dest.worldPosition);
    this.speed = 0;
  }

  update(dt) {
    const clampedDt = Math.min(dt, 0.05);

    const manualSteer =
      this.keys.has('KeyW') ||
      this.keys.has('KeyS') ||
      this.keys.has('KeyA') ||
      this.keys.has('KeyD') ||
      this.keys.has('ArrowUp') ||
      this.keys.has('ArrowDown') ||
      this.keys.has('ArrowLeft') ||
      this.keys.has('ArrowRight');

    if (manualSteer && this.autopilotTarget) {
      this.autopilotTarget = null;
    }

    let targetSpeed = this.baseCruiseSpeed;
    const wantBoost = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const wantBrake = this.keys.has('Space');

    if (this.autopilotTarget) {
      const targetPoint = this.autopilotTarget.worldPosition.clone().add(this.autopilotTarget.approachOffset);
      const toTarget = targetPoint.clone().sub(this.ship.position);
      const dist = toTarget.length();

      if (dist < 18) {
        const arrivedDest = this.autopilotTarget;
        this.autopilotTarget = null;
        this.isStopped = true;
        this.speed = 0;
        this.ship.lookAt(arrivedDest.worldPosition);
        if (this.onAutopilotArrive) this.onAutopilotArrive(arrivedDest);
      } else {
        const desiredMatrix = new THREE.Matrix4().lookAt(this.ship.position, targetPoint, new THREE.Vector3(0, 1, 0));
        const desiredQuat = new THREE.Quaternion().setFromRotationMatrix(desiredMatrix);
        this.ship.quaternion.slerp(desiredQuat, clampedDt * 2.5);
        targetSpeed = dist > 380 ? this.boostSpeed : THREE.MathUtils.lerp(18, 160, Math.min(1, dist / 380));
        this.isBoosting = dist > 240;
      }
    } else {
      if (wantBoost && this.boostEnergy > 4) {
        this.isStopped = false;
        targetSpeed = this.boostSpeed;
        this.isBoosting = true;
        this.boostEnergy = Math.max(0, this.boostEnergy - clampedDt * 20);
      } else if (wantBrake || this.isStopped) {
        targetSpeed = 0;
        this.isBoosting = false;
      } else {
        this.isBoosting = false;
        if (this.keys.has('KeyR')) {
          this.isStopped = false;
          this.baseCruiseSpeed = Math.min(this.maxCruiseSpeed, this.baseCruiseSpeed + clampedDt * 32);
        }
        if (this.keys.has('KeyF')) {
          this.baseCruiseSpeed = Math.max(0, this.baseCruiseSpeed - clampedDt * 32);
        }
        targetSpeed = this.baseCruiseSpeed;
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

    this.speed = THREE.MathUtils.lerp(this.speed, targetSpeed, clampedDt * 3.5);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.ship.quaternion);
    this.ship.position.addScaledVector(forward, this.speed * clampedDt);

    this._updateCamera(clampedDt);

    return {
      speed: this.speed,
      boostEnergy: this.boostEnergy,
      isBoosting: this.isBoosting,
      isStopped: this.isStopped,
      throttle: THREE.MathUtils.clamp(this.speed / this.maxCruiseSpeed, 0, 1)
    };
  }

  _updateArcadeRotation(dt) {
    let yawInput = 0;
    let pitchInput = 0;

    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) yawInput += 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) yawInput -= 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) pitchInput += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) pitchInput -= 1;

    if (this.pointer.active && this.cameraMode === 'chase' && !this.isStopped) {
      const deadzone = 0.08;
      if (Math.abs(this.pointer.x) > deadzone) yawInput -= (this.pointer.x - Math.sign(this.pointer.x) * deadzone) * 1.1;
      if (Math.abs(this.pointer.y) > deadzone) pitchInput -= (this.pointer.y - Math.sign(this.pointer.y) * deadzone) * 0.9;
    }

    yawInput = THREE.MathUtils.clamp(yawInput, -1.3, 1.3);
    pitchInput = THREE.MathUtils.clamp(pitchInput, -1.2, 1.2);

    const euler = new THREE.Euler().setFromQuaternion(this.ship.quaternion, 'YXZ');
    euler.y += yawInput * dt * 1.25;
    euler.x = THREE.MathUtils.clamp(euler.x + pitchInput * dt * 1.05, -1.25, 1.25);

    const targetRoll = THREE.MathUtils.clamp(yawInput * 0.48, -0.6, 0.6);
    euler.z = THREE.MathUtils.lerp(euler.z, targetRoll, dt * 4.5);

    this.ship.quaternion.setFromEuler(euler);
  }

  _updateManualRotation(dt) {
    let pitch = 0;
    let roll = 0;
    let yaw = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) pitch += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) pitch -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) roll += 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) roll -= 1;
    if (this.keys.has('KeyQ')) yaw += 1;
    if (this.keys.has('KeyE')) yaw -= 1;

    const q = new THREE.Quaternion();
    const rotEuler = new THREE.Euler(pitch * dt * 1.5, yaw * dt * 1.35, roll * dt * 2.1, 'YXZ');
    q.setFromEuler(rotEuler);
    this.ship.quaternion.multiply(q).normalize();
  }

  _updateCamera(dt) {
    if (this.cameraMode === 'chase') {
      const boostPull = this.isBoosting ? 4.2 : 0;
      const desiredPos = new THREE.Vector3(0, 3.2, 11.5 + boostPull)
        .applyQuaternion(this.ship.quaternion)
        .add(this.ship.position);
      const desiredLook = new THREE.Vector3(0, 0.5, -18)
        .applyQuaternion(this.ship.quaternion)
        .add(this.ship.position);

      if (!this.initializedCam) {
        this.camPos.copy(desiredPos);
        this.camLook.copy(desiredLook);
        this.initializedCam = true;
      } else {
        this.camPos.lerp(desiredPos, 1 - Math.exp(-dt * 8.5));
        this.camLook.lerp(desiredLook, 1 - Math.exp(-dt * 12));
      }

      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.camLook);

      const targetFov = this.isBoosting ? 78 : 60;
      if (Math.abs(this.camera.fov - targetFov) > 0.1) {
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 5);
        this.camera.updateProjectionMatrix();
      }
    } else {
      const offset = new THREE.Vector3(
        Math.sin(this.orbit.yaw) * Math.cos(this.orbit.pitch) * this.orbit.distance,
        Math.sin(this.orbit.pitch) * this.orbit.distance,
        Math.cos(this.orbit.yaw) * Math.cos(this.orbit.pitch) * this.orbit.distance
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
