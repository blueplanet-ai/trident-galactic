import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

function createDiscGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.28, 'rgba(165, 243, 252, 0.95)');
  grad.addColorStop(0.62, 'rgba(56, 189, 248, 0.45)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPlasmaPlumeMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uPower: { value: 0.5 },
      uBoost: { value: 0.0 },
      uCoreColor: { value: new THREE.Color(0xe0f2fe) },
      uEdgeColor: { value: new THREE.Color(0x38bdf8) },
      uBoostColor: { value: new THREE.Color(0x5eead4) }
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

        float alpha = axialFade * nozzleHotspot * edgeSoftness * diamonds * clamp(0.38 + uPower * 0.62, 0.0, 1.0);
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

  const visualHolder = new THREE.Group();
  visualHolder.add(model);
  visualHolder.rotation.y = Math.PI;
  shipRoot.add(visualHolder);

  // Exact Blender-measured nozzle centers in raw mesh space:
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
        opacity: 0.92
      })
    );
    discSprite.position.set(0, 0, -0.02);
    discSprite.scale.setScalar(n.radius * 2.5);
    nozzleRig.add(discSprite);

    const matOuter = createPlasmaPlumeMaterial();
    const outerMesh = new THREE.Mesh(outerPlumeGeo, matOuter);
    nozzleRig.add(outerMesh);

    const matInner = createPlasmaPlumeMaterial();
    matInner.uniforms.uCoreColor.value.setHex(0xffffff);
    const innerMesh = new THREE.Mesh(innerCoreGeo, matInner);
    nozzleRig.add(innerMesh);

    plumes.push({
      rig: nozzleRig,
      disc: discSprite,
      outer: outerMesh,
      inner: innerMesh,
      baseRadius: n.radius
    });
  });

  const hullLight = new THREE.PointLight(0xbae6fd, 1.1, 22);
  hullLight.position.set(0, 3.8, 1.5);
  shipRoot.add(hullLight);

  const engineGlow = new THREE.PointLight(0x38bdf8, 2.2, 20);
  const centerNozzleLocal = rawNozzles[1].pos.clone().sub(center).multiplyScalar(scale);
  engineGlow.position.set(-centerNozzleLocal.x, centerNozzleLocal.y, -centerNozzleLocal.z + 0.55);
  shipRoot.add(engineGlow);

  return {
    root: shipRoot,
    updateEffects(throttle, isBoosting, time) {
      const boostFactor = isBoosting ? 1.0 : 0.0;
      const power = Math.max(0.18, throttle + (isBoosting ? 1.1 : 0));
      const flicker = 0.95 + Math.sin(time * 55) * 0.05;

      plumes.forEach((p, idx) => {
        const phase = time + idx * 0.37;
        const length = (0.85 + power * 2.45) * flicker;
        const radius = p.baseRadius * (0.92 + (isBoosting ? 0.24 : 0.05));

        p.outer.scale.set(radius, radius, length);
        p.outer.material.uniforms.uTime.value = phase;
        p.outer.material.uniforms.uPower.value = power;
        p.outer.material.uniforms.uBoost.value = boostFactor;

        p.inner.scale.set(radius * 0.85, radius * 0.85, length * 0.82);
        p.inner.material.uniforms.uTime.value = phase * 1.2;
        p.inner.material.uniforms.uPower.value = power * 1.15;
        p.inner.material.uniforms.uBoost.value = boostFactor;

        const discScale = p.baseRadius * (2.2 + power * 0.6) * flicker;
        p.disc.scale.set(discScale, discScale, 1);
        p.disc.material.color.setHex(isBoosting ? 0x5eead4 : 0x7dd3fc);
      });

      engineGlow.intensity = 1.2 + power * 2.6;
      engineGlow.color.setHex(isBoosting ? 0x5eead4 : 0x38bdf8);
    }
  };
}
