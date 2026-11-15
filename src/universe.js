import * as THREE from 'three';
import { ASTRONOMY_CATALOG } from './nasaData.js';

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
  } else {
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(34, 155, 98, 0.36)';
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
  const geo = new THREE.SphereGeometry(radius * 1.055, 48, 48);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
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
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float rim = pow(0.68 - dot(vNormal, vViewDir), 3.0);
        gl_FragColor = vec4(uColor, clamp(rim, 0.0, 0.88));
      }
    `
  });
  return new THREE.Mesh(geo, mat);
}

function createSpiralGalaxy({ count = 24000, radius = 320, arms = 4, spin = 3.5, coreColor = '#ffe4a3', armColor = '#60a5fa' }, starSprite) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cCore = new THREE.Color(coreColor);
  const cArm = new THREE.Color(armColor);
  const cOuter = new THREE.Color('#a855f7');

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.pow(Math.random(), 1.5) * radius;
    const branchAngle = ((i % arms) / arms) * Math.PI * 2;
    const spinAngle = (r / radius) * spin;
    const scatter = (Math.random() - 0.5) * (0.32 + (r / radius) * 0.68) * 32;
    const yScatter = (Math.random() - 0.5) * (12 + (1 - r / radius) * 26);

    positions[i3] = Math.cos(branchAngle + spinAngle) * r + scatter;
    positions[i3 + 1] = yScatter;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + (Math.random() - 0.5) * 32;

    const mixed = cCore.clone().lerp(r / radius > 0.55 ? cOuter : cArm, Math.min(1, r / (radius * 0.75)));
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

  return new THREE.Points(geo, mat);
}

function createOrbitLine(a, e, inclinationDeg, colorHex = 0x38bdf8) {
  const segments = 160;
  const pts = [];
  const b = a * Math.sqrt(1 - e * e);
  const incRad = THREE.MathUtils.degToRad(inclinationDeg);

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = a * Math.cos(theta) - a * e;
    const z = b * Math.sin(theta);
    const y = Math.sin(theta) * a * Math.sin(incRad);
    pts.push(new THREE.Vector3(x, y, z));
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
    const r = 2400 + Math.random() * 7500;
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
    size: 11,
    map: starSprite,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  scene.add(new THREE.Points(starGeo, starMat));

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

  const sunLight = new THREE.PointLight(0xfff1d6, 4.2, 8500, 0.25);
  scene.add(sunLight);

  const astGeo = new THREE.DodecahedronGeometry(1, 1);
  const astMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88, metalness: 0.14 });
  const astCount = 340;
  const astMesh = new THREE.InstancedMesh(astGeo, astMat, astCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < astCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 435 + (Math.random() - 0.5) * 65;
    dummy.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 28, Math.sin(angle) * r);
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
      primaryMesh = new THREE.Mesh(
        new THREE.SphereGeometry(item.radius, 64, 64),
        new THREE.MeshBasicMaterial({ color: item.palette[0] })
      );
      holder.add(primaryMesh);

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
            map: createRadialGlowTexture('rgba(255,255,255,1)', 'rgba(56,189,248,0.7)'),
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        pupGlow.scale.set(36, 36, 1);
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
      const colors = [
        ['rgba(236,72,153,0.45)', 'rgba(168,85,247,0.18)'],
        ['rgba(56,189,248,0.42)', 'rgba(45,212,191,0.16)'],
        ['rgba(251,191,36,0.32)', 'rgba(244,63,94,0.12)']
      ];
      for (let i = 0; i < 18; i++) {
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
          (Math.random() - 0.5) * item.radius * 2.4,
          (Math.random() - 0.5) * item.radius * 1.6,
          (Math.random() - 0.5) * item.radius * 2.4
        );
        const s = item.radius * (1.8 + Math.random() * 1.8);
        sp.scale.set(s, s, 1);
        primaryMesh.add(sp);
      }
    } else if (item.visualType === 'blackhole') {
      primaryMesh = new THREE.Mesh(
        new THREE.SphereGeometry(item.radius * 0.52, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      holder.add(primaryMesh);

      const photonRing = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createRadialGlowTexture('rgba(0,0,0,0)', 'rgba(251,146,60,0.85)', 'rgba(0,0,0,0)'),
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      photonRing.scale.set(item.radius * 2.6, item.radius * 2.6, 1);
      holder.add(photonRing);

      const diskGeo = new THREE.RingGeometry(item.radius * 0.68, item.radius * 2.4, 128);
      const posAttr = diskGeo.attributes.position;
      const uvAttr = diskGeo.attributes.uv;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const r = Math.sqrt(x * x + y * y);
        uvAttr.setXY(i, (r - item.radius * 0.68) / (item.radius * 1.72), 0.5);
      }
      const diskMesh = new THREE.Mesh(
        diskGeo,
        new THREE.MeshBasicMaterial({
          map: createRingTexture(),
          color: 0xf97316,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      diskMesh.rotation.x = Math.PI * 0.42;
      holder.add(diskMesh);
      extraUpdaters.push((dt) => {
        diskMesh.rotation.z += dt * 0.65;
      });
    } else if (item.visualType === 'galaxy') {
      primaryMesh = createSpiralGalaxy(item.galaxyConfig, starSprite);
      primaryMesh.rotation.x = 0.48;
      primaryMesh.rotation.z = -0.22;
      holder.add(primaryMesh);

      const coreGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createRadialGlowTexture('rgba(255,240,200,0.9)', 'rgba(251,191,36,0.28)'),
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      coreGlow.scale.set(item.radius * 1.1, item.radius * 1.1, 1);
      holder.add(coreGlow);
    } else {
      primaryMesh = new THREE.Mesh(
        new THREE.SphereGeometry(item.radius, 64, 64),
        new THREE.MeshStandardMaterial({
          map: createPlanetTexture(item),
          roughness: item.visualType === 'icy' ? 0.35 : 0.65,
          metalness: item.visualType === 'icy' ? 0.2 : 0.08
        })
      );
      holder.add(primaryMesh);

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
        const ringMesh = new THREE.Mesh(
          ringGeo,
          new THREE.MeshStandardMaterial({
            map: createRingTexture(),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            roughness: 0.75
          })
        );
        ringMesh.rotation.x = Math.PI * 0.41;
        ringMesh.rotation.y = 0.2;
        holder.add(ringMesh);
      }

      if (item.hasMoon) {
        const moonPivot = new THREE.Group();
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(item.radius * 0.27, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.88 })
        );
        moon.position.set(item.radius * 2.4, 4, 0);
        moonPivot.add(moon);
        holder.add(moonPivot);
        extraUpdaters.push((dt) => {
          moonPivot.rotation.y += dt * 0.45;
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

    const approachDist = Math.max(42, item.radius * 2.8);
    const approachOffset = new THREE.Vector3(0, item.radius * 0.55 + 8, approachDist);

    return {
      ...item,
      holder,
      primaryMesh,
      worldPosition,
      approachOffset,
      orbitalAngle: item.initialAngle || 0,
      extraUpdaters
    };
  });

  let activeZone = 'solar';
  let simDaysPerSecond = 8;

  function setZone(zoneId) {
    activeZone = zoneId;
    Object.entries(zoneGroups).forEach(([id, group]) => {
      group.visible = id === zoneId;
    });
  }

  setZone('solar');

  return {
    catalog: catalogRuntime,
    orbitLinesGroup,
    setZone,
    getActiveZone: () => activeZone,
    setTimeScale(daysPerSec) {
      simDaysPerSecond = daysPerSec;
    },
    update(dt, shipPosition, speedRatio) {
      dustField.position.copy(shipPosition);
      streakMat.opacity = 0.24 + Math.min(0.7, speedRatio * 0.65);
      streakMat.size = 1.2 + speedRatio * 1.8;

      catalogRuntime.forEach((obj) => {
        if (obj.zone !== activeZone) return;

        if (obj.primaryMesh && obj.rotationSpeed) {
          obj.primaryMesh.rotation.y += dt * obj.rotationSpeed * 6;
        }
        obj.extraUpdaters.forEach((fn) => fn(dt));

        if (obj.zone === 'solar') {
          if (obj.orbitRadius > 0 && obj.orbitPeriodDays > 0) {
            const angularVel = (Math.PI * 2) / obj.orbitPeriodDays;
            obj.orbitalAngle += angularVel * simDaysPerSecond * dt;

            const a = obj.orbitRadius;
            const e = obj.eccentricity || 0;
            const b = a * Math.sqrt(1 - e * e);
            const incRad = THREE.MathUtils.degToRad(obj.inclinationDeg || 0);

            const x = a * Math.cos(obj.orbitalAngle) - a * e;
            const z = b * Math.sin(obj.orbitalAngle);
            const y = Math.sin(obj.orbitalAngle) * a * Math.sin(incRad);

            obj.holder.position.set(x, y, z);
          } else {
            obj.holder.position.set(0, 0, 0);
          }
          obj.worldPosition.copy(obj.holder.position);
        }
      });
    }
  };
}
