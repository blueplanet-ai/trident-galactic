import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

function createDiscGlowTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(165,243,252,0.95)', outer = 'rgba(56,189,248,0.45)') {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, inner);
  grad.addColorStop(0.28, mid);
  grad.addColorStop(0.62, outer);
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPlasmaPlumeMaterial(coreHex = 0xe0f2fe, edgeHex = 0x38bdf8, boostHex = 0x5eead4) {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uPower: { value: 0.5 },
      uBoost: { value: 0.0 },
      uCoreColor: { value: new THREE.Color(coreHex) },
      uEdgeColor: { value: new THREE.Color(edgeHex) },
      uBoostColor: { value: new THREE.Color(boostHex) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uPower;
      uniform float uBoost;
      uniform vec3 uCoreColor;
      uniform vec3 uEdgeColor;
      uniform vec3 uBoostColor;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        float t = clamp(vUv.y, 0.0, 1.0);
        float axialFade = pow(1.0 - t, 1.35);
        float nozzleHotspot = smoothstep(0.0, 0.08, t);

        float shockWave = sin(t * 28.0 - uTime * 38.0) * 0.5 + 0.5;
        float diamonds = mix(0.72, 1.25, pow(shockWave, 2.2) * (1.0 - t * 0.7));

        float radial = abs(dot(normalize(vNormal), normalize(vViewDir)));
        float edgeSoftness = pow(radial, 1.35);

        vec3 outerTint = mix(uEdgeColor, uBoostColor, uBoost);
        vec3 col = mix(outerTint, uCoreColor, pow(1.0 - t, 1.8) * 0.85 + radial * 0.35);

        float alpha = axialFade * nozzleHotspot * edgeSoftness * diamonds * clamp(uPower, 0.0, 1.0);
        gl_FragColor = vec4(col * (1.3 + uBoost * 0.7), alpha);
      }
    `
  });
}

export async function loadTridentShip(renderer, onProgress) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  const gltf = await loader.loadAsync('./models/trident-galactic.glb', (evt) => {
    if (evt.lengthComputable && onProgress) {
      onProgress(evt.loaded / evt.total);
    }
  });

  const shipRoot = new THREE.Group();
  const model = gltf.scene;

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  model.traverse((child) => {
    if (child.isMesh && child.material) {
      const mat = child.material;
      ['map', 'normalMap', 'metalnessMap', 'roughnessMap'].forEach((mapKey) => {
        if (mat[mapKey]) {
          mat[mapKey].anisotropy = maxAniso;
          mat[mapKey].needsUpdate = true;
        }
      });
      mat.envMapIntensity = 1.25;
      mat.needsUpdate = true;
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const targetLength = 7.5;
  const scale = targetLength / maxDim;

  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  // visualHolder is rotated 180 deg around Y so +Z in raw glTF (nose) faces -Z in shipRoot (forward)
  const visualHolder = new THREE.Group();
  visualHolder.add(model);
  visualHolder.rotation.y = Math.PI;
  shipRoot.add(visualHolder);

  // 1. Rear Main Thrusters (shoot along -Z in visualHolder -> +Z behind shipRoot)
  const rawNozzles = [
    { pos: new THREE.Vector3(-0.1046, 0.0774, -0.4178), radius: 0.0445 * scale },
    { pos: new THREE.Vector3(0.0007, 0.0793, -0.4179), radius: 0.0459 * scale },
    { pos: new THREE.Vector3(0.1047, 0.0774, -0.4178), radius: 0.0445 * scale }
  ];

  const outerPlumeGeo = new THREE.CylinderGeometry(0.18, 0.96, 1.0, 28, 16, true);
  outerPlumeGeo.translate(0, 0.5, 0);
  outerPlumeGeo.rotateX(-Math.PI / 2);

  const innerCoreGeo = new THREE.CylinderGeometry(0.06, 0.55, 0.72, 24, 8, true);
  innerCoreGeo.translate(0, 0.36, 0);
  innerCoreGeo.rotateX(-Math.PI / 2);

  const discTex = createDiscGlowTexture();
  const plumes = [];

  rawNozzles.forEach((n) => {
    const localPos = n.pos.clone().sub(center).multiplyScalar(scale);
    const nozzleRig = new THREE.Group();
    nozzleRig.position.copy(localPos);
    visualHolder.add(nozzleRig);

    const discSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: discTex,
        color: 0x7dd3fc,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.72
      })
    );
    discSprite.position.set(0, 0, -0.02);
    discSprite.scale.setScalar(n.radius * 2.2);
    nozzleRig.add(discSprite);

    const matOuter = createPlasmaPlumeMaterial();
    const outerMesh = new THREE.Mesh(outerPlumeGeo, matOuter);
    outerMesh.visible = false;
    nozzleRig.add(outerMesh);

    const matInner = createPlasmaPlumeMaterial(0xffffff, 0x7dd3fc, 0x99f6e4);
    const innerMesh = new THREE.Mesh(innerCoreGeo, matInner);
    innerMesh.visible = false;
    nozzleRig.add(innerMesh);

    plumes.push({
      rig: nozzleRig,
      disc: discSprite,
      outer: outerMesh,
      inner: innerMesh,
      baseRadius: n.radius
    });
  });

  // 2. Front Wing Retro-Thrusters (shoot along +Z in visualHolder -> -Z in front of shipRoot during reverse)
  const rawWingIntakes = [
    { pos: new THREE.Vector3(-0.2231, 0.064, 0.0025), radius: 0.032 * scale },
    { pos: new THREE.Vector3(0.2231, 0.068, 0.0025), radius: 0.032 * scale }
  ];

  const retroPlumeGeo = new THREE.CylinderGeometry(0.14, 0.85, 1.0, 24, 10, true);
  retroPlumeGeo.translate(0, 0.5, 0);
  retroPlumeGeo.rotateX(Math.PI / 2); // +Y -> +Z in visualHolder (forward out of wing intakes)

  const retroDiscTex = createDiscGlowTexture(
    'rgba(255,255,255,1)',
    'rgba(103,232,249,0.9)',
    'rgba(56,189,248,0.4)'
  );
  const retroPlumes = [];

  rawWingIntakes.forEach((w) => {
    const localPos = w.pos.clone().sub(center).multiplyScalar(scale);
    const retroRig = new THREE.Group();
    retroRig.position.copy(localPos);
    visualHolder.add(retroRig);

    const discSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: retroDiscTex,
        color: 0x38bdf8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.0
      })
    );
    discSprite.position.set(0, 0, 0.02);
    discSprite.scale.setScalar(w.radius * 2.4);
    retroRig.add(discSprite);

    const matRetro = createPlasmaPlumeMaterial(0xe0f2fe, 0x22d3ee, 0x38bdf8);
    const retroMesh = new THREE.Mesh(retroPlumeGeo, matRetro);
    retroMesh.visible = false;
    retroRig.add(retroMesh);

    retroPlumes.push({
      rig: retroRig,
      disc: discSprite,
      plume: retroMesh,
      baseRadius: w.radius
    });
  });

  const hullLight = new THREE.PointLight(0xbae6fd, 1.1, 22);
  hullLight.position.set(0, 3.8, 1.5);
  shipRoot.add(hullLight);

  const engineGlow = new THREE.PointLight(0x38bdf8, 1.4, 20);
  const centerNozzleLocal = rawNozzles[1].pos.clone().sub(center).multiplyScalar(scale);
  engineGlow.position.set(-centerNozzleLocal.x, centerNozzleLocal.y, -centerNozzleLocal.z + 0.55);
  shipRoot.add(engineGlow);

  return {
    root: shipRoot,
    updateEffects(speed, maxCruiseSpeed, isBoosting, time) {
      const flicker = 0.94 + Math.sin(time * 55) * 0.06;
      const idlePulse = 0.6 + Math.sin(time * 3.5) * 0.12;
      const isForward = speed > 0.8;
      const isReverse = speed < -0.8;

      const forwardRatio = isForward ? Math.min(1.0, speed / maxCruiseSpeed) : 0;
      const reverseRatio = isReverse ? Math.min(1.0, Math.abs(speed) / 35) : 0;
      const boostFactor = isBoosting ? 1.0 : 0.0;

      // Rear Main Thrusters:
      // - Idle or Reverse: hide jet cones, show soft pulsing burner disc glow
      // - Forward: grow jet cones proportionally with speed & boost
      plumes.forEach((p, idx) => {
        const phase = time + idx * 0.37;
        if (isForward || isBoosting) {
          const power = Math.min(1.8, 0.28 + forwardRatio * 0.85 + (isBoosting ? 0.85 : 0));
          const length = (0.55 + forwardRatio * 2.2 + (isBoosting ? 1.85 : 0)) * flicker;
          const radius = p.baseRadius * (0.85 + forwardRatio * 0.18 + (isBoosting ? 0.25 : 0));

          p.outer.visible = true;
          p.inner.visible = true;

          p.outer.scale.set(radius, radius, length);
          p.outer.material.uniforms.uTime.value = phase;
          p.outer.material.uniforms.uPower.value = power;
          p.outer.material.uniforms.uBoost.value = boostFactor;

          p.inner.scale.set(radius * 0.82, radius * 0.82, length * 0.8);
          p.inner.material.uniforms.uTime.value = phase * 1.2;
          p.inner.material.uniforms.uPower.value = power * 1.15;
          p.inner.material.uniforms.uBoost.value = boostFactor;

          const discScale = p.baseRadius * (2.2 + forwardRatio * 0.65 + (isBoosting ? 0.5 : 0)) * flicker;
          p.disc.scale.set(discScale, discScale, 1);
          p.disc.material.opacity = 0.92;
          p.disc.material.color.setHex(isBoosting ? 0x5eead4 : 0x7dd3fc);
        } else {
          p.outer.visible = false;
          p.inner.visible = false;
          const discScale = p.baseRadius * (1.85 + idlePulse * 0.25);
          p.disc.scale.set(discScale, discScale, 1);
          p.disc.material.opacity = idlePulse;
          p.disc.material.color.setHex(0x38bdf8);
        }
      });

      // Front Wing Retro-Thrusters (active only in Reverse)
      retroPlumes.forEach((rp, idx) => {
        if (isReverse) {
          const phase = time * 1.3 + idx * 0.5;
          const length = (0.45 + reverseRatio * 1.45) * flicker;
          const radius = rp.baseRadius * (0.85 + reverseRatio * 0.25);

          rp.plume.visible = true;
          rp.plume.scale.set(radius, radius, length);
          rp.plume.material.uniforms.uTime.value = phase;
          rp.plume.material.uniforms.uPower.value = 0.35 + reverseRatio * 0.75;

          const discScale = rp.baseRadius * (2.1 + reverseRatio * 0.7) * flicker;
          rp.disc.scale.set(discScale, discScale, 1);
          rp.disc.material.opacity = 0.85;
        } else {
          rp.plume.visible = false;
          rp.disc.material.opacity = 0.0;
        }
      });

      if (isForward || isBoosting) {
        engineGlow.intensity = 1.6 + forwardRatio * 1.8 + (isBoosting ? 2.2 : 0);
        engineGlow.color.setHex(isBoosting ? 0x5eead4 : 0x38bdf8);
      } else {
        engineGlow.intensity = 0.85 + idlePulse * 0.35;
        engineGlow.color.setHex(0x38bdf8);
      }
    }
  };
}
