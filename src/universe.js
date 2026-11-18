import * as THREE from 'three';
import { ASTRONOMY_CATALOG } from './nasaData.js';

const PLANET_TEXTURE_PATHS = {
  sun: './textures/sun.jpg',
  mercury: './textures/mercury.jpg',
  venus: './textures/venus.jpg',
  earth: './textures/earth_day.jpg',
  mars: './textures/mars.jpg',
  jupiter: './textures/jupiter.jpg',
  saturn: './textures/saturn.jpg',
  uranus: './textures/uranus.jpg',
  neptune: './textures/neptune.jpg'
};

const EXTRA_TEXTURE_PATHS = {
  earthClouds: './textures/earth_clouds.jpg',
  moon: './textures/moon.jpg',
  saturnRing: './textures/saturn_ring.png',
  orionNebula: './textures/orion_nebula.jpg',
  crabNebula: './textures/crab_nebula.jpg'
};

const sharedTexLoader = typeof Image !== 'undefined' ? new THREE.TextureLoader() : null;
const textureCache = new Map();

function loadCosmicTexture(url, fallbackFactory, wrapRepeat = false) {
  if (textureCache.has(url)) return textureCache.get(url);
  if (!sharedTexLoader) {
    const fb = fallbackFactory ? fallbackFactory() : new THREE.Texture();
    textureCache.set(url, fb);
    return fb;
  }
  const tex = sharedTexLoader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (wrapRepeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  textureCache.set(url, tex);
  return tex;
}

function createRadialGlowTexture(innerColor, midColor, outerColor = 'rgba(0,0,0,0)') {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.35, midColor);
  grad.addColorStop(1, outerColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createStarSpriteTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.6, 'rgba(200,230,255,0.25)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPlanetTexture(item) {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const palette = item.palette || ['#38bdf8', '#1d4ed8'];
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  palette.forEach((stop, i) => {
    grad.addColorStop(i / Math.max(1, palette.length - 1), stop);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  if (item.visualType === 'banded' || item.visualType === 'ringed' || item.visualType === 'venus') {
    for (let i = 0; i < 140; i++) {
      const y = Math.random() * h;
      const bandH = 3 + Math.random() * 28;
      ctx.fillStyle = `rgba(${185 + Math.random() * 65}, ${145 + Math.random() * 75}, ${105 + Math.random() * 85}, ${0.05 + Math.random() * 0.14})`;
      ctx.fillRect(0, y, w, bandH);
    }
    if (item.id === 'jupiter') {
      ctx.fillStyle = 'rgba(220, 88, 42, 0.65)';
      ctx.beginPath();
      ctx.ellipse(w * 0.62, h * 0.62, 95, 48, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (item.visualType === 'icy') {
    for (let i = 0; i < 300; i++) {
      ctx.strokeStyle = `rgba(220, 248, 255, ${0.08 + Math.random() * 0.2})`;
      ctx.lineWidth = 1 + Math.random() * 2.5;
      ctx.beginPath();
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 240, y + (Math.random() - 0.5) * 130);
      ctx.stroke();
    }
  } else if (item.visualType === 'rocky' || item.visualType === 'mars') {
    for (let i = 0; i < 280; i++) {
      const r = 6 + Math.random() * 44;
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    if (item.id === 'mars') {
      ctx.fillStyle = 'rgba(248, 250, 252, 0.78)';
      ctx.fillRect(0, 0, w, 34);
      ctx.fillRect(0, h - 28, w, 28);
    }
  } else if (item.id === 'proxima-b') {
    // Tidally locked "Eyeball Earth" exoplanet: warm dayside ocean & crimson terminator, frozen nightside
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const dayGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, h * 0.62);
    dayGrad.addColorStop(0.0, '#0ea5e9');
    dayGrad.addColorStop(0.32, '#0284c7');
    dayGrad.addColorStop(0.55, '#9f1239');
    dayGrad.addColorStop(0.75, '#4c0519');
    dayGrad.addColorStop(1.0, '#1e293b');
    ctx.fillStyle = dayGrad;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 240; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const distFromSubstellar = Math.hypot(cx - w * 0.5, cy - h * 0.5);
      ctx.fillStyle =
        distFromSubstellar < h * 0.42
          ? 'rgba(16, 185, 129, 0.34)'
          : distFromSubstellar < h * 0.62
            ? 'rgba(251, 113, 133, 0.25)'
            : 'rgba(226, 232, 240, 0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 18 + Math.random() * 95, 10 + Math.random() * 48, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Temperate rocky/ocean world (e.g. TRAPPIST-1e) with continents, oceans, and polar ice caps
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = i % 4 === 0 ? 'rgba(255,255,255,0.28)' : i % 2 === 0 ? 'rgba(16, 185, 129, 0.42)' : 'rgba(180, 130, 85, 0.32)';
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w,
        Math.random() * h,
        24 + Math.random() * 140,
        14 + Math.random() * 70,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
    ctx.fillRect(0, 0, w, 38);
    ctx.fillRect(0, h - 38, w, 38);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createRingTexture() {
  const w = 1024;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  for (let x = 0; x < w; x++) {
    const t = x / w;
    const fine = Math.sin(t * 95) * 0.3 + Math.cos(t * 42) * 0.4 + 0.5;
    const cassiniGap = t > 0.58 && t < 0.63 ? 0.08 : 1.0;
    const fade = Math.sin(t * Math.PI);
    const alpha = Math.max(0, fade * cassiniGap * (0.22 + 0.68 * fine));
    ctx.fillStyle = `rgba(${215 + Math.floor(t * 35)}, ${192 + Math.floor(t * 35)}, 168, ${alpha})`;
    ctx.fillRect(x, 0, 1, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createAtmosphereMesh(radius, colorHex) {
  const geo = new THREE.SphereGeometry(radius * 1.01, 64, 64);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalMatrix * normal;
        vViewDir = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      vec3 safeNorm(vec3 v) {
        float lenSq = dot(v, v);
        return lenSq > 1e-8 ? v * inversesqrt(lenSq) : vec3(0.0, 0.0, 1.0);
      }
      void main() {
        float mu = clamp(dot(safeNorm(vNormal), safeNorm(vViewDir)), 0.0, 1.0);
        // Feather smoothly to 0.0 at the outer silhouette (mu -> 0) and toward the center (mu -> 1) so no hard ring ever appears
        float limb = pow(max(1.0 - mu, 1e-4), 2.6) * smoothstep(0.0, 0.28, mu);
        gl_FragColor = vec4(clamp(uColor, 0.0, 4.0), clamp(limb * 0.36, 0.0, 1.0));
      }
    `
  });
  return new THREE.Mesh(geo, mat);
}

function createPhotorealBiomeMaterial(texA, texB, colors, isEyeballWorld = false) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexA: { value: texA },
      uTexB: { value: texB },
      uCol0: { value: new THREE.Color(colors[0]) },
      uCol1: { value: new THREE.Color(colors[1]) },
      uCol2: { value: new THREE.Color(colors[2]) },
      uCol3: { value: new THREE.Color(colors[3]) },
      uEyeball: { value: isEyeballWorld ? 1.0 : 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalMatrix * normal;
        vWorldNormal = mat3(modelMatrix) * normal;
        vViewDir = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform vec3 uCol0;
      uniform vec3 uCol1;
      uniform vec3 uCol2;
      uniform vec3 uCol3;
      uniform float uEyeball;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      vec3 safeNorm(vec3 v) {
        float lenSq = dot(v, v);
        return lenSq > 1e-8 ? v * inversesqrt(lenSq) : vec3(0.0, 0.0, 1.0);
      }

      void main() {
        vec3 sA = texture2D(uTexA, vUv).rgb;
        vec3 sB = texture2D(uTexB, vec2(vUv.x * 1.35 + 0.27, 1.0 - vUv.y)).rgb;
        float h = dot(sA, vec3(0.38, 0.42, 0.20)) * 0.62 + dot(sB, vec3(0.333)) * 0.38;
        float detail = (sA.r - sB.g) * 0.18;
        float elev = clamp(h + detail, 0.0, 1.0);

        vec3 biome = mix(uCol0, uCol1, smoothstep(0.18, 0.44, elev));
        biome = mix(biome, uCol2, smoothstep(0.44, 0.70, elev));
        biome = mix(biome, uCol3, smoothstep(0.70, 0.94, elev));

        if (uEyeball > 0.5) {
          // Tidally locked substellar ocean basin & warm terminator ring transitioning to frozen nightside
          vec2 dUv = (vUv - vec2(0.5, 0.5)) * vec2(2.2, 1.8);
          float rSub = sqrt(max(dot(dUv, dUv), 1e-8));
          vec3 dayOcean = mix(vec3(0.04, 0.36, 0.52), vec3(0.08, 0.62, 0.58), smoothstep(0.28, 0.52, elev));
          vec3 terminator = mix(vec3(0.68, 0.24, 0.18), vec3(0.92, 0.55, 0.32), elev);
          vec3 nightIce = mix(vec3(0.12, 0.16, 0.26), vec3(0.72, 0.82, 0.92), smoothstep(0.3, 0.85, elev));
          vec3 eyeCol = mix(dayOcean, terminator, smoothstep(0.25, 0.58, rSub));
          eyeCol = mix(eyeCol, nightIce, smoothstep(0.58, 0.92, rSub));
          biome = mix(biome, eyeCol, 0.72);
        }

        vec3 lightDir = normalize(vec3(-0.55, 0.35, 0.75));
        vec3 wn = safeNorm(vWorldNormal);
        vec3 vn = safeNorm(vNormal);
        vec3 vd = safeNorm(vViewDir);
        float diff = max(0.18, dot(wn, lightDir) * 0.65 + 0.35);
        float mu = clamp(dot(vn, vd), 0.0, 1.0);
        float specDot = clamp(dot(reflect(-lightDir, wn), vd), 1e-4, 1.0);
        float spec = pow(specDot, 24.0) * (1.0 - smoothstep(0.35, 0.55, elev)) * 0.28;

        vec3 finalRgb = clamp(biome * diff + vec3(spec) * (0.4 + 0.6 * mu), 0.0, 4.0);
        gl_FragColor = vec4(finalRgb, 1.0);
      }
    `
  });
}

function createStarShaderMaterial(baseTex, coreColorHex, edgeColorHex, turbulenceScale = 1.0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: baseTex },
      uTime: { value: 0 },
      uCoreColor: { value: new THREE.Color(coreColorHex) },
      uEdgeColor: { value: new THREE.Color(edgeColorHex) },
      uTurb: { value: turbulenceScale }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalMatrix * normal;
        vViewDir = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uTime;
      uniform vec3 uCoreColor;
      uniform vec3 uEdgeColor;
      uniform float uTurb;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      vec3 safeNorm(vec3 v) {
        float lenSq = dot(v, v);
        return lenSq > 1e-8 ? v * inversesqrt(lenSq) : vec3(0.0, 0.0, 1.0);
      }

      void main() {
        vec2 uv1 = vUv + vec2(uTime * 0.008, sin(vUv.x * 12.0 + uTime * 0.4) * 0.006 * uTurb);
        vec2 uv2 = vUv * vec2(1.35, 1.15) - vec2(uTime * 0.005, cos(vUv.y * 14.0 - uTime * 0.35) * 0.006 * uTurb);
        vec3 tex1 = texture2D(uMap, uv1).rgb;
        vec3 tex2 = texture2D(uMap, uv2).rgb;
        float lum = dot(mix(tex1, tex2, 0.42), vec3(0.333));

        float mu = clamp(dot(safeNorm(vNormal), safeNorm(vViewDir)), 0.0, 1.0);
        float limb = pow(max(mu, 1e-4), 0.48);
        float coronaRim = pow(max(1.0 - mu, 1e-4), 2.4);

        vec3 baseTint = mix(uEdgeColor, uCoreColor, clamp(lum * 1.25 * limb, 0.0, 1.0));
        vec3 finalCol = clamp(baseTint * (0.95 + lum * 0.55) + uEdgeColor * coronaRim * 0.75, 0.0, 6.0);
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `
  });
}

function createNebulaPlaneMesh(tex, size, tintHex = 0xffffff, opacity = 0.88) {
  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uMap: { value: tex },
      uTint: { value: new THREE.Color(tintHex) },
      uOpacity: { value: opacity }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec3 uTint;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec2 centered = (vUv - 0.5) * 2.0;
        float dist = sqrt(max(dot(centered, centered), 1e-8));
        float vignette = smoothstep(1.0, 0.22, dist);
        vec3 col = texture2D(uMap, vUv).rgb * uTint;
        float lum = max(col.r, max(col.g, col.b));
        gl_FragColor = vec4(clamp(col * 1.15, 0.0, 4.0), clamp(vignette * clamp(lum * 1.35, 0.0, 1.0) * uOpacity, 0.0, 1.0));
      }
    `
  });
  return new THREE.Mesh(geo, mat);
}

function createAccretionDiskMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uInnerColor: { value: new THREE.Color('#fff7ed') },
      uMidColor: { value: new THREE.Color('#fb923c') },
      uOuterColor: { value: new THREE.Color('#9a3412') }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uInnerColor;
      uniform vec3 uMidColor;
      uniform vec3 uOuterColor;
      varying vec2 vUv;
      varying vec3 vPos;

      void main() {
        float rNorm = clamp(vUv.x, 0.0, 1.0);
        float safeX = abs(vPos.x) < 1e-5 ? 1e-5 : vPos.x;
        float angle = atan(vPos.y, safeX);

        float spiral1 = sin(angle * 4.0 - rNorm * 18.0 + uTime * 3.2) * 0.5 + 0.5;
        float spiral2 = cos(angle * 7.0 - rNorm * 28.0 + uTime * 4.8) * 0.5 + 0.5;
        float filaments = mix(spiral1, spiral2, 0.45);

        // Relativistic Doppler beaming crescent (approaching side brighter)
        float doppler = 0.78 + 0.38 * cos(angle + 0.6);
        float innerEdge = smoothstep(0.0, 0.12, rNorm);
        float outerFade = pow(max(1.0 - rNorm, 1e-4), 1.45);

        vec3 col = mix(uInnerColor, uMidColor, smoothstep(0.0, 0.38, rNorm));
        col = mix(col, uOuterColor, smoothstep(0.38, 1.0, rNorm));

        float alpha = innerEdge * outerFade * (0.45 + 0.55 * filaments) * doppler;
        gl_FragColor = vec4(clamp(col * (1.1 + 0.5 * filaments) * doppler, 0.0, 6.0), clamp(alpha, 0.0, 0.96));
      }
    `
  });
}

function createSpiralGalaxy({ count = 24000, radius = 320, arms = 4, spin = 3.5, coreColor = '#ffe4a3', armColor = '#60a5fa' }, starSprite) {
  const group = new THREE.Group();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cCore = new THREE.Color(coreColor);
  const cArm = new THREE.Color(armColor);
  const cOuter = new THREE.Color('#a855f7');
  const cHII = new THREE.Color('#f472b6');

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.pow(Math.random(), 1.5) * radius;
    const branchAngle = ((i % arms) / arms) * Math.PI * 2;
    const spinAngle = (r / radius) * spin;
    const scatter = (Math.random() - 0.5) * (0.28 + (r / radius) * 0.72) * 32;
    const yScatter = (Math.random() - 0.5) * (10 + (1 - r / radius) * 28);

    positions[i3] = Math.cos(branchAngle + spinAngle) * r + scatter;
    positions[i3 + 1] = yScatter;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + (Math.random() - 0.5) * 32;

    const isStarburstKnot = r > radius * 0.22 && r < radius * 0.82 && i % 19 === 0;
    const mixed = isStarburstKnot
      ? cHII
      : cCore.clone().lerp(r / radius > 0.55 ? cOuter : cArm, Math.min(1, r / (radius * 0.75)));
    colors[i3] = mixed.r;
    colors[i3 + 1] = mixed.g;
    colors[i3 + 2] = mixed.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 6.5,
    map: starSprite,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.92
  });

  group.add(new THREE.Points(geo, mat));

  // Add volumetric nebular glow clouds along spiral arms for photographic depth
  const nebulaCloudTex = createRadialGlowTexture('rgba(244,114,182,0.34)', 'rgba(96,165,250,0.14)');
  for (let a = 0; a < arms; a++) {
    for (let s = 1; s <= 4; s++) {
      const r = (s / 4.5) * radius * 0.82;
      const angle = (a / arms) * Math.PI * 2 + (r / radius) * spin;
      const cloud = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: nebulaCloudTex,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.55
        })
      );
      cloud.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      const scale = radius * (0.28 + Math.random() * 0.16);
      cloud.scale.set(scale, scale, 1);
      group.add(cloud);
    }
  }

  return group;
}

function computeKeplerPosition(a, e, inclinationDeg, theta, outVec) {
  const b = a * Math.sqrt(1 - e * e);
  const incRad = THREE.MathUtils.degToRad(inclinationDeg || 0);
  const xOrb = a * Math.cos(theta) - a * e;
  const zOrb = b * Math.sin(theta);
  const y = zOrb * Math.sin(incRad);
  const z = zOrb * Math.cos(incRad);
  return outVec.set(xOrb, y, z);
}

function createOrbitLine(a, e, inclinationDeg, colorHex = 0x38bdf8) {
  const segments = 160;
  const pts = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    pts.push(computeKeplerPosition(a, e, inclinationDeg, theta, new THREE.Vector3()));
  }

  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending
  });
  return new THREE.Line(geo, mat);
}

export function createUniverse(scene) {
  const starSprite = createStarSpriteTexture();
  const zoneGroups = {
    solar: new THREE.Group(),
    stellar: new THREE.Group(),
    milkyway: new THREE.Group(),
    intergalactic: new THREE.Group()
  };

  Object.values(zoneGroups).forEach((g) => scene.add(g));

  const orbitLinesGroup = new THREE.Group();
  zoneGroups.solar.add(orbitLinesGroup);

  const starCount = 16000;
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  const starPalette = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#bae6fd'),
    new THREE.Color('#fef08a'),
    new THREE.Color('#fed7aa'),
    new THREE.Color('#c4b5fd')
  ];

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const r = 12000 + Math.random() * 14000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i3 + 2] = r * Math.cos(phi);

    const c = starPalette[Math.floor(Math.random() * starPalette.length)];
    starCol[i3] = c.r;
    starCol[i3 + 1] = c.g;
    starCol[i3 + 2] = c.b;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  const starMat = new THREE.PointsMaterial({
    size: 26,
    map: starSprite,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  const streakCount = 480;
  const streakPos = new Float32Array(streakCount * 3);
  for (let i = 0; i < streakCount; i++) {
    streakPos[i * 3] = (Math.random() - 0.5) * 160;
    streakPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
    streakPos[i * 3 + 2] = (Math.random() - 0.5) * 240;
  }
  const streakGeo = new THREE.BufferGeometry();
  streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
  const streakMat = new THREE.PointsMaterial({
    color: 0xbae6fd,
    map: starSprite,
    size: 1.4,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const dustField = new THREE.Points(streakGeo, streakMat);
  scene.add(dustField);

  scene.add(new THREE.AmbientLight(0x3b4d6b, 0.95));
  scene.add(new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.65));

  const sunLight = new THREE.PointLight(0xfff1d6, 4.2, 22000, 0.22);
  scene.add(sunLight);

  const astGeo = new THREE.DodecahedronGeometry(1, 1);
  const astMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88, metalness: 0.14 });
  const astCount = 460;
  const astMesh = new THREE.InstancedMesh(astGeo, astMat, astCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < astCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 2460 + (Math.random() - 0.5) * 180;
    dummy.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 48, Math.sin(angle) * r);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const sc = 1.1 + Math.random() * 3.2;
    dummy.scale.set(sc, sc * 0.75, sc * 1.15);
    dummy.updateMatrix();
    astMesh.setMatrixAt(i, dummy.matrix);
  }
  zoneGroups.solar.add(astMesh);

  const catalogRuntime = ASTRONOMY_CATALOG.map((item) => {
    const holder = new THREE.Group();
    const zoneGroup = zoneGroups[item.zone];
    zoneGroup.add(holder);

    let primaryMesh = null;
    const extraUpdaters = [];

    if (item.visualType === 'star') {
      const sunTex = loadCosmicTexture(PLANET_TEXTURE_PATHS.sun, () => createPlanetTexture(item), true);
      const coreHex = item.id === 'sirius' ? '#ffffff' : item.id === 'betelgeuse' ? '#fef08a' : '#fffbeb';
      const edgeHex = item.id === 'sirius' ? '#38bdf8' : item.id === 'betelgeuse' ? '#dc2626' : '#f59e0b';
      const turb = item.id === 'betelgeuse' ? 2.4 : 1.0;

      const starMat = createStarShaderMaterial(sunTex, coreHex, edgeHex, turb);
      primaryMesh = new THREE.Mesh(new THREE.SphereGeometry(item.radius, 64, 64), starMat);
      holder.add(primaryMesh);
      extraUpdaters.push((dt) => {
        starMat.uniforms.uTime.value += dt;
      });

      const corona = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createRadialGlowTexture(item.palette[0], item.coronaColor || 'rgba(255,180,60,0.5)'),
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      corona.scale.set(item.radius * 4.8, item.radius * 4.8, 1);
      holder.add(corona);

      if (item.id === 'sirius') {
        const pupPivot = new THREE.Group();
        const pup = new THREE.Mesh(
          new THREE.SphereGeometry(6, 24, 24),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        pup.position.set(item.radius * 2.1, 8, 0);
        const pupGlow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createRadialGlowTexture('rgba(255,255,255,1)', 'rgba(56,189,248,0.85)'),
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        pupGlow.scale.set(42, 42, 1);
        pup.add(pupGlow);
        pupPivot.add(pup);
        holder.add(pupPivot);
        extraUpdaters.push((dt) => {
          pupPivot.rotation.y += dt * 0.35;
        });
      }
    } else if (item.visualType === 'nebula') {
      primaryMesh = new THREE.Group();
      holder.add(primaryMesh);

      const nebulaUrl = item.id === 'orion-nebula' ? EXTRA_TEXTURE_PATHS.orionNebula : EXTRA_TEXTURE_PATHS.crabNebula;
      const nebulaTex = loadCosmicTexture(nebulaUrl, () => createRadialGlowTexture('rgba(236,72,153,0.5)', 'rgba(56,189,248,0.2)'));

      // Multi-angle radial-feathered Hubble photographic planes for 3D parallax + real telescope structure
      const mainPlane = createNebulaPlaneMesh(nebulaTex, item.radius * 3.1, 0xffffff, 0.92);
      primaryMesh.add(mainPlane);

      const crossPlane1 = createNebulaPlaneMesh(nebulaTex, item.radius * 2.8, 0xe0f2fe, 0.62);
      crossPlane1.rotation.y = Math.PI * 0.32;
      crossPlane1.rotation.x = 0.22;
      primaryMesh.add(crossPlane1);

      const crossPlane2 = createNebulaPlaneMesh(nebulaTex, item.radius * 2.6, 0xfbcfe8, 0.55);
      crossPlane2.rotation.y = -Math.PI * 0.36;
      crossPlane2.rotation.z = 0.4;
      primaryMesh.add(crossPlane2);

      const colors = [
        ['rgba(236,72,153,0.36)', 'rgba(168,85,247,0.14)'],
        ['rgba(56,189,248,0.34)', 'rgba(45,212,191,0.12)'],
        ['rgba(251,191,36,0.26)', 'rgba(244,63,94,0.10)']
      ];
      for (let i = 0; i < 12; i++) {
        const pair = colors[i % colors.length];
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createRadialGlowTexture(pair[0], pair[1]),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
          })
        );
        sp.position.set(
          (Math.random() - 0.5) * item.radius * 2.0,
          (Math.random() - 0.5) * item.radius * 1.4,
          (Math.random() - 0.5) * item.radius * 2.0
        );
        const s = item.radius * (1.4 + Math.random() * 1.4);
        sp.scale.set(s, s, 1);
        primaryMesh.add(sp);
      }

      if (item.id === 'crab-nebula') {
        // Central Crab Pulsar (PSR B0531+21) spinning with twin relativistic synchrotron lighthouse beams
        const pulsarGroup = new THREE.Group();
        const pulsarCore = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createRadialGlowTexture('rgba(255,255,255,1)', 'rgba(56,189,248,0.9)'),
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        pulsarCore.scale.set(28, 28, 1);
        pulsarGroup.add(pulsarCore);

        const beamGeo = new THREE.ConeGeometry(12, item.radius * 1.9, 20, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.32,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const beam1 = new THREE.Mesh(beamGeo, beamMat);
        beam1.position.y = item.radius * 0.95;
        const beam2 = new THREE.Mesh(beamGeo, beamMat);
        beam2.rotation.x = Math.PI;
        beam2.position.y = -item.radius * 0.95;
        pulsarGroup.add(beam1, beam2);
        pulsarGroup.rotation.z = 0.55;
        holder.add(pulsarGroup);
        extraUpdaters.push((dt) => {
          pulsarGroup.rotation.y += dt * 14.0;
        });
      }
    } else if (item.visualType === 'blackhole') {
      primaryMesh = new THREE.Mesh(
        new THREE.SphereGeometry(item.radius * 0.52, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      holder.add(primaryMesh);

      const photonRing = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createRadialGlowTexture('rgba(0,0,0,0)', 'rgba(251,146,60,0.92)', 'rgba(0,0,0,0)'),
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      photonRing.scale.set(item.radius * 2.65, item.radius * 2.65, 1);
      holder.add(photonRing);

      const diskGeo = new THREE.RingGeometry(item.radius * 0.65, item.radius * 2.55, 128, 8);
      const posAttr = diskGeo.attributes.position;
      const uvAttr = diskGeo.attributes.uv;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const r = Math.sqrt(x * x + y * y);
        uvAttr.setXY(i, (r - item.radius * 0.65) / (item.radius * 1.9), 0.5);
      }
      const diskMat = createAccretionDiskMaterial();
      const diskMesh = new THREE.Mesh(diskGeo, diskMat);
      diskMesh.rotation.x = Math.PI * 0.42;
      holder.add(diskMesh);

      // Relativistic lensed upper/lower halo arch (Einstein gravitational lensing of rear disk)
      const lensedMesh = new THREE.Mesh(diskGeo, diskMat);
      lensedMesh.rotation.x = -Math.PI * 0.08;
      lensedMesh.scale.setScalar(0.76);
      holder.add(lensedMesh);

      extraUpdaters.push((dt) => {
        diskMat.uniforms.uTime.value += dt;
      });
    } else if (item.visualType === 'galaxy') {
      primaryMesh = createSpiralGalaxy(item.galaxyConfig, starSprite);
      primaryMesh.rotation.x = 0.48;
      primaryMesh.rotation.z = -0.22;
      holder.add(primaryMesh);

      const coreGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createRadialGlowTexture('rgba(255,240,200,0.92)', 'rgba(251,191,36,0.32)'),
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      coreGlow.scale.set(item.radius * 1.15, item.radius * 1.15, 1);
      holder.add(coreGlow);
    } else {
      const realTexUrl = PLANET_TEXTURE_PATHS[item.id];
      const texEarth = loadCosmicTexture(PLANET_TEXTURE_PATHS.earth, () => createPlanetTexture(item), true);
      const texMars = loadCosmicTexture(PLANET_TEXTURE_PATHS.mars, () => createPlanetTexture(item), true);
      const texMercury = loadCosmicTexture(PLANET_TEXTURE_PATHS.mercury, () => createPlanetTexture(item), true);
      const texVenus = loadCosmicTexture(PLANET_TEXTURE_PATHS.venus, () => createPlanetTexture(item), true);
      const texMoon = loadCosmicTexture(EXTRA_TEXTURE_PATHS.moon, () => createPlanetTexture(item), true);

      let planetMat = null;
      if (item.id === 'moon') {
        planetMat = new THREE.MeshStandardMaterial({
          map: texMoon,
          bumpMap: texMoon,
          bumpScale: 0.32,
          roughness: 0.88,
          metalness: 0.04
        });
      } else if (item.id === 'proxima-b') {
        planetMat = createPhotorealBiomeMaterial(
          texMars,
          texEarth,
          ['#0c4a6e', '#0f766e', '#b45309', '#e2e8f0'],
          true
        );
      } else if (item.id === 'trappist-1') {
        planetMat = createPhotorealBiomeMaterial(
          texEarth,
          texMercury,
          ['#0f3b66', '#0284c7', '#15803d', '#f8fafc'],
          false
        );
      } else if (item.id === 'io') {
        planetMat = createPhotorealBiomeMaterial(
          texMars,
          texVenus,
          ['#451a03', '#dc2626', '#f59e0b', '#fef08a'],
          false
        );
      } else if (item.id === 'europa') {
        planetMat = createPhotorealBiomeMaterial(
          texMercury,
          texMars,
          ['#9a3412', '#cbd5e1', '#e0f2fe', '#ffffff'],
          false
        );
      } else if (item.id === 'enceladus') {
        planetMat = createPhotorealBiomeMaterial(
          texMercury,
          texMoon,
          ['#38bdf8', '#bae6fd', '#f1f5f9', '#ffffff'],
          false
        );
      } else if (item.id === 'titan') {
        planetMat = createPhotorealBiomeMaterial(
          texVenus,
          texMars,
          ['#78350f', '#b45309', '#d97706', '#fde68a'],
          false
        );
      } else if (item.id === 'triton') {
        planetMat = createPhotorealBiomeMaterial(
          texMoon,
          texMercury,
          ['#64748b', '#cbd5e1', '#fecdd3', '#f8fafc'],
          false
        );
      } else {
        const surfaceTex = realTexUrl
          ? loadCosmicTexture(realTexUrl, () => createPlanetTexture(item))
          : createPlanetTexture(item);
        const isRocky = item.visualType === 'rocky' || item.visualType === 'mars';
        planetMat = new THREE.MeshStandardMaterial({
          map: surfaceTex,
          bumpMap: isRocky ? surfaceTex : null,
          bumpScale: isRocky ? 0.38 : 0,
          roughness: item.visualType === 'icy' || item.id === 'earth' ? 0.42 : 0.72,
          metalness: item.id === 'earth' ? 0.14 : 0.06
        });
      }

      primaryMesh = new THREE.Mesh(new THREE.SphereGeometry(item.radius, 64, 64), planetMat);
      if (item.id === 'uranus') {
        // Uranus's 97.77-degree sideways axial obliquity
        primaryMesh.rotation.z = THREE.MathUtils.degToRad(97.77);
      }
      holder.add(primaryMesh);

      if (item.id === 'earth' || item.id === 'proxima-b' || item.id === 'trappist-1' || item.id === 'titan') {
        const cloudTex = loadCosmicTexture(EXTRA_TEXTURE_PATHS.earthClouds, null, true);
        const cloudTint =
          item.id === 'proxima-b' ? 0xfed7aa : item.id === 'titan' ? 0xfde68a : 0xffffff;
        const cloudOpacity = item.id === 'titan' ? 0.55 : item.id === 'proxima-b' ? 0.48 : 0.72;
        const cloudMesh = new THREE.Mesh(
          new THREE.SphereGeometry(item.radius * 1.014, 64, 64),
          new THREE.MeshStandardMaterial({
            map: cloudTex,
            alphaMap: cloudTex,
            color: cloudTint,
            transparent: true,
            opacity: cloudOpacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            roughness: 0.9
          })
        );
        holder.add(cloudMesh);
        extraUpdaters.push((dt, spinScale) => {
          cloudMesh.rotation.y += dt * 0.32 * spinScale;
        });
      }

      // Add companion red-dwarf host stars & sibling planets for Proxima Centauri b and TRAPPIST-1e
      if (item.id === 'proxima-b') {
        const sunTex = loadCosmicTexture(PLANET_TEXTURE_PATHS.sun, null, true);
        const hostStarMat = createStarShaderMaterial(sunTex, '#fde047', '#dc2626', 1.8);
        const hostStar = new THREE.Mesh(new THREE.SphereGeometry(16, 32, 32), hostStarMat);
        hostStar.position.set(-135, 24, -110);
        const hostGlow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createRadialGlowTexture('rgba(254,240,138,0.95)', 'rgba(239,68,68,0.55)'),
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        hostGlow.scale.set(95, 95, 1);
        hostStar.add(hostGlow);
        holder.add(hostStar);
        extraUpdaters.push((dt) => {
          hostStarMat.uniforms.uTime.value += dt;
        });
      }

      if (item.id === 'trappist-1') {
        const sunTex = loadCosmicTexture(PLANET_TEXTURE_PATHS.sun, null, true);
        const trappistStarMat = createStarShaderMaterial(sunTex, '#fef08a', '#ea580c', 1.6);
        const trappistStar = new THREE.Mesh(new THREE.SphereGeometry(18, 32, 32), trappistStarMat);
        trappistStar.position.set(145, 18, -125);
        const starGlow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createRadialGlowTexture('rgba(254,215,170,0.95)', 'rgba(234,88,12,0.55)'),
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        starGlow.scale.set(105, 105, 1);
        trappistStar.add(starGlow);
        holder.add(trappistStar);

        // Sibling rocky planets (1b, 1c, 1d, 1f, 1g) in resonant chain around TRAPPIST-1A
        const siblings = [
          { r: 3.2, dist: 34, speed: 0.75, phase: 0.5, col: 0xd97706 },
          { r: 3.4, dist: 48, speed: 0.5, phase: 2.1, col: 0xb45309 },
          { r: 2.8, dist: 64, speed: 0.34, phase: 3.9, col: 0x38bdf8 },
          { r: 3.5, dist: 84, speed: 0.22, phase: 1.3, col: 0x67e8f9 }
        ];
        siblings.forEach((sib) => {
          const piv = new THREE.Group();
          piv.position.copy(trappistStar.position);
          piv.rotation.z = 0.08;
          piv.rotation.y = sib.phase;
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(sib.r, 20, 20),
            new THREE.MeshStandardMaterial({ color: sib.col, roughness: 0.65 })
          );
          m.position.set(sib.dist, 0, 0);
          piv.add(m);
          holder.add(piv);
          extraUpdaters.push((dt, _spinScale, orbitScale) => {
            piv.rotation.y += dt * sib.speed * orbitScale;
          });
        });

        extraUpdaters.push((dt) => {
          trappistStarMat.uniforms.uTime.value += dt;
        });
      }

      if (item.atmosphereColor) {
        holder.add(createAtmosphereMesh(item.radius, item.atmosphereColor));
      }

      if (item.visualType === 'ringed') {
        const innerR = item.radius * 1.35;
        const outerR = item.radius * 2.35;
        const ringGeo = new THREE.RingGeometry(innerR, outerR, 128);
        const posAttr = ringGeo.attributes.position;
        const uvAttr = ringGeo.attributes.uv;
        for (let i = 0; i < posAttr.count; i++) {
          const x = posAttr.getX(i);
          const y = posAttr.getY(i);
          const r = Math.sqrt(x * x + y * y);
          uvAttr.setXY(i, (r - innerR) / (outerR - innerR), 0.5);
        }
        const ringTex = loadCosmicTexture(EXTRA_TEXTURE_PATHS.saturnRing, () => createRingTexture());
        const ringMesh = new THREE.Mesh(
          ringGeo,
          new THREE.MeshStandardMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.94,
            roughness: 0.65
          })
        );
        ringMesh.rotation.x = Math.PI * 0.41;
        ringMesh.rotation.y = 0.2;
        holder.add(ringMesh);
      }

      if (item.id === 'uranus') {
        // Uranus's faint vertical epsilon ring system tilted at 97.77 deg
        const uRingGeo = new THREE.RingGeometry(item.radius * 1.45, item.radius * 1.72, 96);
        const uRingMesh = new THREE.Mesh(
          uRingGeo,
          new THREE.MeshBasicMaterial({
            color: 0x67e8f9,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        uRingMesh.rotation.y = Math.PI * 0.15;
        holder.add(uRingMesh);
      }

      if (item.id === 'jupiter') {
        // Outer 2 Galilean moons Ganymede and Callisto (Io and Europa are full visitable catalog destinations)
        const outerGalileanMoons = [
          { name: 'Ganymede', dist: item.radius * 4.7, r: 2.9, color: 0x94a3b8, speed: 0.225, phase: 3.5 },
          { name: 'Callisto', dist: item.radius * 5.8, r: 2.6, color: 0x64748b, speed: 0.1, phase: 5.0 }
        ];
        outerGalileanMoons.forEach((mCfg) => {
          const pivot = new THREE.Group();
          pivot.rotation.y = mCfg.phase;
          const mMesh = new THREE.Mesh(
            new THREE.SphereGeometry(mCfg.r, 24, 24),
            new THREE.MeshStandardMaterial({ color: mCfg.color, roughness: 0.7 })
          );
          mMesh.position.set(mCfg.dist, 0, 0);
          pivot.add(mMesh);
          holder.add(pivot);
          extraUpdaters.push((dt, _spinScale, orbitScale) => {
            pivot.rotation.y += dt * mCfg.speed * orbitScale;
          });
        });
      }
    }

    const worldPosition = new THREE.Vector3();
    if (item.zone === 'solar') {
      if (item.orbitRadius > 0) {
        const line = createOrbitLine(item.orbitRadius, item.eccentricity || 0, item.inclinationDeg || 0);
        orbitLinesGroup.add(line);
      }
    } else if (item.position) {
      holder.position.set(item.position[0], item.position[1], item.position[2]);
      worldPosition.copy(holder.position);
    }

    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(item.radius * 1.35, 10), 16, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitSphere.userData.catalogId = item.id;
    holder.add(hitSphere);
    if (primaryMesh && primaryMesh.isMesh) {
      primaryMesh.userData.catalogId = item.id;
    }

    const isExtendedCloud = item.visualType === 'galaxy' || item.visualType === 'nebula';
    const isMoon = Boolean(item.parentId);
    const approachDist = isExtendedCloud
      ? Math.max(85, item.radius * 1.35)
      : isMoon
        ? Math.max(12, item.radius * 2.8)
        : Math.max(32, item.radius * 2.4);
    const approachOffset = new THREE.Vector3(0, item.radius * 0.35 + (isMoon ? 2 : 5), approachDist);

    return {
      ...item,
      holder,
      hitSphere,
      primaryMesh,
      worldPosition,
      approachOffset,
      orbitalAngle: item.initialAngle || item.moonPhase || 0,
      deltaOrbitalAngle: 0,
      parentObj: null,
      extraUpdaters
    };
  });

  catalogRuntime.forEach((obj) => {
    if (obj.parentId) {
      obj.parentObj = catalogRuntime.find((p) => p.id === obj.parentId) || null;
    }
  });

  // Animated 3D Flight Path Line & Travelling Pulse Markers
  const pathCount = 48;
  const pathPositions = new Float32Array(pathCount * 3);
  const pathGeo = new THREE.BufferGeometry();
  pathGeo.setAttribute('position', new THREE.BufferAttribute(pathPositions, 3));
  const pathLine = new THREE.Line(
    pathGeo,
    new THREE.LineBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(pathLine);

  const pulseCount = 14;
  const pulsePositions = new Float32Array(pulseCount * 3);
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
  const pulsePoints = new THREE.Points(
    pulseGeo,
    new THREE.PointsMaterial({
      color: 0x5eead4,
      map: starSprite,
      size: 6.5,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  scene.add(pulsePoints);

  let activeZone = 'solar';
  let simDaysPerSecond = 0;
  let spinSpeedScale = 1.0;

  function setZone(zoneId) {
    activeZone = zoneId;
    Object.entries(zoneGroups).forEach(([id, group]) => {
      group.visible = id === zoneId;
    });
  }

  setZone('solar');

  return {
    catalog: catalogRuntime,
    zoneGroups,
    orbitLinesGroup,
    setZone,
    getActiveZone: () => activeZone,
    setTimeScale(daysPerSec) {
      simDaysPerSecond = daysPerSec;
    },
    setSpinScale(scale) {
      spinSpeedScale = scale;
    },
    updateFlightPath(shipPos, destPos, time, visible = true) {
      pathLine.visible = visible;
      pulsePoints.visible = visible;
      if (!visible || !destPos) return;

      const pAttr = pathGeo.attributes.position;
      for (let i = 0; i < pathCount; i++) {
        const t = i / (pathCount - 1);
        pAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(shipPos.x, destPos.x, t),
          THREE.MathUtils.lerp(shipPos.y, destPos.y, t),
          THREE.MathUtils.lerp(shipPos.z, destPos.z, t)
        );
      }
      pAttr.needsUpdate = true;

      const mAttr = pulseGeo.attributes.position;
      for (let i = 0; i < pulseCount; i++) {
        const t = ((i / pulseCount) + time * 0.28) % 1.0;
        mAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(shipPos.x, destPos.x, t),
          THREE.MathUtils.lerp(shipPos.y, destPos.y, t),
          THREE.MathUtils.lerp(shipPos.z, destPos.z, t)
        );
      }
      mAttr.needsUpdate = true;
    },
    update(dt, shipPosition, speedRatio) {
      starField.position.copy(shipPosition);
      dustField.position.copy(shipPosition);
      streakMat.opacity = 0.24 + Math.min(0.7, speedRatio * 0.65);
      streakMat.size = 1.2 + speedRatio * 1.8;

      const orbitScale = simDaysPerSecond / 8.0;

      // Pass 1: Update primary planets, stars, nebulae, and galaxies
      catalogRuntime.forEach((obj) => {
        if (obj.zone !== activeZone || obj.parentId) return;

        if (obj.primaryMesh && obj.rotationSpeed) {
          obj.primaryMesh.rotation.y += dt * obj.rotationSpeed * 6 * spinSpeedScale;
        }
        obj.extraUpdaters.forEach((fn) => fn(dt, spinSpeedScale, orbitScale));

        if (obj.zone === 'solar') {
          if (obj.orbitRadius > 0 && obj.orbitPeriodDays > 0) {
            const e = obj.eccentricity || 0;
            const meanMotion = (Math.PI * 2) / obj.orbitPeriodDays;
            const keplerFactor = Math.pow(1 + e * Math.cos(obj.orbitalAngle), 2) / Math.pow(1 - e * e, 1.5);
            obj.orbitalAngle = (obj.orbitalAngle + meanMotion * keplerFactor * simDaysPerSecond * dt) % (Math.PI * 2);

            computeKeplerPosition(obj.orbitRadius, e, obj.inclinationDeg || 0, obj.orbitalAngle, obj.holder.position);
          } else {
            obj.holder.position.set(0, 0, 0);
          }
          obj.worldPosition.copy(obj.holder.position);
        }
      });

      // Pass 2: Update visitable moons relative to their parent planet's updated worldPosition
      catalogRuntime.forEach((obj) => {
        if (obj.zone !== activeZone || !obj.parentId) return;
        const parentObj = obj.parentObj || catalogRuntime.find((p) => p.id === obj.parentId);
        if (!parentObj) return;

        if (obj.primaryMesh && obj.rotationSpeed) {
          obj.primaryMesh.rotation.y += dt * obj.rotationSpeed * 6 * spinSpeedScale;
        }
        obj.extraUpdaters.forEach((fn) => fn(dt, spinSpeedScale, orbitScale));

        const dAngle = (obj.moonOrbitSpeed || 0.35) * orbitScale * dt;
        obj.deltaOrbitalAngle = dAngle;
        obj.orbitalAngle = (obj.orbitalAngle + dAngle) % (Math.PI * 2);
        const r = obj.moonOrbitDist || 40;
        const incRad = THREE.MathUtils.degToRad(obj.moonInclinationDeg || 0);
        const mx = Math.cos(obj.orbitalAngle) * r;
        const mzOrb = Math.sin(obj.orbitalAngle) * r;
        const my = mzOrb * Math.sin(incRad);
        const mz = mzOrb * Math.cos(incRad);

        obj.holder.position.set(
          parentObj.worldPosition.x + mx,
          parentObj.worldPosition.y + my,
          parentObj.worldPosition.z + mz
        );
        obj.worldPosition.copy(obj.holder.position);
      });
    }
  };
}
