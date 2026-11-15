import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import './style.css';
import { ZONES } from './nasaData.js';
import { createUniverse } from './universe.js';
import { loadTridentShip } from './ship.js';
import { FlightController } from './flight.js';
import { SpaceAudio } from './audio.js';

const canvas = document.getElementById('space-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
const pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(pixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040a);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.65;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.25, 20000);

const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth * pixelRatio,
  window.innerHeight * pixelRatio,
  {
    type: THREE.HalfFloatType,
    samples: 4
  }
);

const composer = new EffectComposer(renderer, renderTarget);
composer.setPixelRatio(pixelRatio);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.42,
  0.45,
  0.9
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const universe = createUniverse(scene);
const audio = new SpaceAudio();

// DOM Elements
const loaderOverlay = document.getElementById('loader-overlay');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const sectorLabel = document.getElementById('sector-label');
const btnDifficulty = document.getElementById('btn-difficulty');
const difficultyText = document.getElementById('difficulty-text');
const btnOrbits = document.getElementById('btn-orbits');
const orbitsText = document.getElementById('orbits-text');
const btnSound = document.getElementById('btn-sound');
const soundText = document.getElementById('sound-text');
const btnApod = document.getElementById('btn-apod');
const btnHudToggle = document.getElementById('btn-hud-toggle');
const hudModeText = document.getElementById('hud-mode-text');
const hud = document.getElementById('hud');
const pilotHudOverlay = document.getElementById('pilot-hud-overlay');
const pilotPitchText = document.getElementById('pilot-pitch-text');

// Drawers & Collapse toggles
const tourPanel = document.getElementById('tour-panel');
const scienceCard = document.getElementById('science-card');
const btnToggleLeft = document.getElementById('btn-toggle-left');
const btnToggleRight = document.getElementById('btn-toggle-right');

const destListEl = document.getElementById('destination-list');
const discoveryProgress = document.getElementById('discovery-progress');
const btnCancelAuto = document.getElementById('btn-cancel-auto');
const timeControlBox = document.getElementById('time-control-box');
const timeSlider = document.getElementById('time-slider');
const timeScaleLabel = document.getElementById('time-scale-label');

// Science Card DOM
const sciBadge = document.getElementById('sci-badge');
const sciTitle = document.getElementById('sci-title');
const sciNasaLink = document.getElementById('sci-nasa-link');
const sciHeadline = document.getElementById('sci-headline');
const sciDist = document.getElementById('sci-dist');
const sciRadius = document.getElementById('sci-radius');
const sciGravity = document.getElementById('sci-gravity');
const sciTemp = document.getElementById('sci-temp');
const sciBullets = document.getElementById('sci-bullets');
const quizScoreEl = document.getElementById('quiz-score');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');

// APOD Modal DOM
const apodModal = document.getElementById('apod-modal');
const btnApodClose = document.getElementById('btn-apod-close');
const apodTitle = document.getElementById('apod-title');
const apodImg = document.getElementById('apod-img');
const apodDesc = document.getElementById('apod-desc');
const apodLink = document.getElementById('apod-link');

// Flight Plan Bar DOM
const fpTarget = document.getElementById('fp-target');
const fpDistance = document.getElementById('fp-distance');
const fpEta = document.getElementById('fp-eta');
const fuelBar = document.getElementById('fuel-bar');
const fuelValue = document.getElementById('fuel-value');
const btnRefuel = document.getElementById('btn-refuel');
const btnFpAuto = document.getElementById('btn-fp-auto');
const btnFpWarp = document.getElementById('btn-fp-warp');

// Bottom Cockpit Deck DOM
const speedValue = document.getElementById('speed-value');
const throttleSlider = document.getElementById('throttle-slider');
const btnRev = document.getElementById('btn-rev');
const btnFwd = document.getElementById('btn-fwd');
const btnStop = document.getElementById('btn-stop');
const btnCruise = document.getElementById('btn-cruise');
const btnBoost = document.getElementById('btn-boost');
const boostBar = document.getElementById('boost-bar');

const headingValue = document.getElementById('heading-value');
const btnMouseSteer = document.getElementById('btn-mouse-steer');
const btnFlightMode = document.getElementById('btn-flight-mode');
const flightModeText = document.getElementById('flight-mode-text');

const zoomValue = document.getElementById('zoom-value');
const zoomSlider = document.getElementById('zoom-slider');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnCameraMode = document.getElementById('btn-camera-mode');
const cameraModeText = document.getElementById('camera-mode-text');
const btnCamReset = document.getElementById('btn-cam-reset');

const reticle = document.getElementById('target-reticle');
const reticleName = document.getElementById('reticle-name');
const reticleDist = document.getElementById('reticle-dist');

let shipObj = null;
let flight = null;
let difficulty = 'explorer';
let pilotHudMode = false;
let activeDest = universe.catalog.find((d) => d.id === 'earth') || universe.catalog[0];

const visitedIds = new Set(['earth']);
const answeredQuizzes = new Set();
let quizScore = 0;

function updateDiscoveryBadge() {
  discoveryProgress.textContent = `Discovered: ${visitedIds.size} / ${universe.catalog.length}`;
}

function renderScienceCard(dest) {
  if (!dest) return;
  const content = difficulty === 'explorer' ? dest.explorer : dest.advanced;

  sciBadge.textContent = `${dest.category} • ${difficulty === 'explorer' ? 'EXPLORER K–12' : 'ASTROPHYSICIST'}`;
  sciTitle.textContent = dest.name;
  sciNasaLink.href = dest.nasaUrl;
  sciHeadline.textContent = content.headline;

  sciDist.textContent = dest.metrics.distanceLabel;
  sciRadius.textContent = dest.metrics.radiusKm;
  sciGravity.textContent = dest.metrics.gravity;
  sciTemp.textContent = dest.metrics.temp;

  sciBullets.innerHTML = '';
  content.bullets.forEach((b) => {
    const li = document.createElement('li');
    li.textContent = b;
    sciBullets.appendChild(li);
  });

  const quizKey = `${dest.id}-${difficulty}`;
  quizQuestion.textContent = content.quiz.question;
  quizOptions.innerHTML = '';
  quizFeedback.classList.add('hidden');

  content.quiz.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = optText;
    btn.addEventListener('click', () => {
      const isCorrect = idx === content.quiz.answerIndex;
      quizOptions.querySelectorAll('.quiz-opt').forEach((b, i) => {
        b.classList.toggle('correct', i === content.quiz.answerIndex);
        if (i === idx && !isCorrect) b.classList.add('wrong');
      });
      quizFeedback.textContent = `${isCorrect ? '✓ Correct! ' : 'Not quite — '}${content.quiz.explanation}`;
      quizFeedback.classList.remove('hidden');

      if (isCorrect && !answeredQuizzes.has(quizKey)) {
        answeredQuizzes.add(quizKey);
        quizScore += 1;
        quizScoreEl.textContent = `Score: ${quizScore}`;
        audio.playDiscoveryChime();
      }
    });
    quizOptions.appendChild(btn);
  });
}

function markVisited(dest) {
  if (!visitedIds.has(dest.id)) {
    visitedIds.add(dest.id);
    updateDiscoveryBadge();
    audio.playDiscoveryChime();
    buildDestinationList();
  }
}

function syncFlightControlsUI() {
  if (!flight) return;
  throttleSlider.value = Math.round(flight.targetThrottleSpeed);
  zoomSlider.value = Math.round(flight.zoomDistance);
  zoomValue.textContent = `${Math.round(flight.zoomDistance)}m`;
  btnStop.classList.toggle('active', flight.isStopped);
  if (btnMouseSteer) {
    btnMouseSteer.textContent = flight.mouseSteerEnabled ? 'MOUSE: ON' : 'MOUSE: LOCKED';
    btnMouseSteer.classList.toggle('locked', !flight.mouseSteerEnabled);
  }
}

function selectDestination(dest, engageAutopilot = false) {
  activeDest = dest;
  fpTarget.textContent = dest.name;
  renderScienceCard(dest);
  document.querySelectorAll('.dest-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.id === dest.id);
  });
  if (engageAutopilot && flight) {
    flight.setAutopilot(dest);
    syncFlightControlsUI();
    btnCancelAuto.classList.remove('hidden');
    sectorLabel.textContent = `AUTOPILOT • ${dest.name.toUpperCase()}`;
  }
}

function buildDestinationList() {
  const currentZone = universe.getActiveZone();
  const zoneItems = universe.catalog.filter((d) => d.zone === currentZone);
  destListEl.innerHTML = '';

  zoneItems.forEach((dest) => {
    const row = document.createElement('div');
    row.className = `dest-item ${activeDest?.id === dest.id ? 'active' : ''}`;
    row.dataset.id = dest.id;
    const visitedMark = visitedIds.has(dest.id) ? '<span class="visited-dot" title="Visited"></span>' : '';
    row.innerHTML = `
      <div class="dest-meta">
        <span class="dest-name">${visitedMark}${dest.name}</span>
        <span class="dest-type">${dest.category}</span>
      </div>
      <div class="dest-actions">
        <span class="dest-dist mono" id="dist-${dest.id}">--</span>
        <button class="warp-pill" title="Instant Hyper-Warp to ${dest.name}">WARP</button>
      </div>
    `;
    row.addEventListener('click', (e) => {
      if (e.target.classList.contains('warp-pill')) {
        markVisited(dest);
        selectDestination(dest, false);
        flight?.warpTo(dest);
        syncFlightControlsUI();
        btnCancelAuto.classList.add('hidden');
        sectorLabel.textContent = `${dest.name.toUpperCase()} • STATIONARY ORBIT`;
        return;
      }
      // Single click selects destination & shows Flight Path + Science Card
      selectDestination(dest, false);
    });
    row.addEventListener('dblclick', () => {
      selectDestination(dest, true);
    });
    destListEl.appendChild(row);
  });
}

function switchZone(zoneId) {
  universe.setZone(zoneId);
  const zoneMeta = ZONES.find((z) => z.id === zoneId);
  if (zoneMeta) {
    sectorLabel.textContent = zoneMeta.badge;
  }
  document.querySelectorAll('.zone-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.zone === zoneId);
  });
  timeControlBox.style.display = zoneId === 'solar' ? 'flex' : 'none';

  const firstInZone = universe.catalog.find((d) => d.zone === zoneId);
  if (firstInZone) {
    markVisited(firstInZone);
    selectDestination(firstInZone, false);
    if (flight) {
      flight.warpTo(firstInZone);
      syncFlightControlsUI();
    }
  }
  buildDestinationList();
}

document.querySelectorAll('.zone-tab').forEach((btn) => {
  btn.addEventListener('click', () => switchZone(btn.dataset.zone));
});

// Collapsible Side Drawers
btnToggleLeft.addEventListener('click', () => {
  const collapsed = tourPanel.classList.toggle('collapsed');
  btnToggleLeft.textContent = collapsed ? '▶' : '◀';
});

btnToggleRight.addEventListener('click', () => {
  const collapsed = scienceCard.classList.toggle('collapsed');
  btnToggleRight.textContent = collapsed ? '◀' : '▶';
});

function toggleDifficulty() {
  difficulty = difficulty === 'explorer' ? 'advanced' : 'explorer';
  difficultyText.textContent = difficulty === 'explorer' ? 'EXPLORER (K–12)' : 'ASTROPHYSICIST';
  btnDifficulty.classList.toggle('active', difficulty === 'advanced');
  renderScienceCard(activeDest);
}

function toggleOrbits() {
  universe.orbitLinesGroup.visible = !universe.orbitLinesGroup.visible;
  const on = universe.orbitLinesGroup.visible;
  orbitsText.textContent = on ? 'ON' : 'OFF';
  btnOrbits.classList.toggle('active', on);
}

function toggleFlightMode() {
  if (!flight) return;
  const next = flight.mode === 'arcade' ? 'manual' : 'arcade';
  flight.setMode(next);
  flightModeText.textContent = next === 'arcade' ? 'ARCADE' : '6-DOF';
}

function toggleCameraMode() {
  if (!flight) return;
  const next = flight.cameraMode === 'chase' ? 'orbit' : 'chase';
  flight.setCameraMode(next);
  cameraModeText.textContent = next === 'chase' ? 'CHASE CAM' : 'ORBIT CAM';
}

function togglePilotHud() {
  pilotHudMode = !pilotHudMode;
  hud.classList.toggle('pilot-hud', pilotHudMode);
  pilotHudOverlay.classList.toggle('hidden', !pilotHudMode);
  hudModeText.textContent = pilotHudMode ? 'PILOT HUD' : 'FULL';
  btnHudToggle.classList.toggle('active', pilotHudMode);
}

btnDifficulty.addEventListener('click', toggleDifficulty);
btnOrbits.addEventListener('click', toggleOrbits);
btnMouseSteer.addEventListener('click', () => flight?.toggleMouseSteer());
btnFlightMode.addEventListener('click', toggleFlightMode);
btnCameraMode.addEventListener('click', toggleCameraMode);
btnHudToggle.addEventListener('click', togglePilotHud);

// Flight Plan Bar Actions
btnFpAuto.addEventListener('click', () => {
  if (activeDest) selectDestination(activeDest, true);
});
btnFpWarp.addEventListener('click', () => {
  if (!activeDest || !flight) return;
  markVisited(activeDest);
  flight.warpTo(activeDest);
  syncFlightControlsUI();
  btnCancelAuto.classList.add('hidden');
  sectorLabel.textContent = `${activeDest.name.toUpperCase()} • STATIONARY ORBIT`;
});
btnRefuel.addEventListener('click', () => {
  flight?.refuel();
});

// Cockpit Deck: Speed / Throttle / Reverse / Stop / Boost
throttleSlider.addEventListener('input', (e) => {
  if (!flight) return;
  flight.setTargetSpeed(Number(e.target.value));
  btnCancelAuto.classList.add('hidden');
});

btnStop.addEventListener('click', () => {
  if (!flight) return;
  flight.setTargetSpeed(0);
  btnCancelAuto.classList.add('hidden');
  sectorLabel.textContent = `${activeDest.name.toUpperCase()} • STATIONARY HOVER`;
});

btnCruise.addEventListener('click', () => {
  if (!flight) return;
  flight.setTargetSpeed(24);
  btnCancelAuto.classList.add('hidden');
});

function bindHoldButton(el, actionName) {
  if (!el) return;
  const start = (e) => {
    e.preventDefault();
    flight?.setUiHold(actionName, true);
  };
  const end = () => {
    flight?.setUiHold(actionName, false);
  };
  el.addEventListener('mousedown', start);
  el.addEventListener('touchstart', start, { passive: false });
  window.addEventListener('mouseup', end);
  window.addEventListener('touchend', end);
}

bindHoldButton(btnFwd, 'forward');
bindHoldButton(btnRev, 'reverse');
bindHoldButton(btnBoost, 'boost');

document.querySelectorAll('[data-hold]').forEach((btn) => {
  const action = btn.dataset.hold;
  bindHoldButton(btn, action);
  if (action.startsWith('cam')) {
    btn.addEventListener('mousedown', () => {
      if (flight && flight.cameraMode !== 'orbit') {
        flight.setCameraMode('orbit');
        cameraModeText.textContent = 'ORBIT CAM';
      }
    });
  }
});

zoomSlider.addEventListener('input', (e) => {
  flight?.setZoom(Number(e.target.value));
});
btnZoomIn.addEventListener('click', () => {
  if (flight) flight.setZoom(flight.zoomDistance - 3);
});
btnZoomOut.addEventListener('click', () => {
  if (flight) flight.setZoom(flight.zoomDistance + 3);
});
btnCamReset.addEventListener('click', () => {
  flight?.resetCameraView();
});

btnSound.addEventListener('click', () => {
  const on = audio.toggle();
  soundText.textContent = on ? 'ON' : 'OFF';
  btnSound.classList.toggle('active', on);
});
btnCancelAuto.addEventListener('click', () => {
  if (flight) flight.setAutopilot(null);
  btnCancelAuto.classList.add('hidden');
});

timeSlider.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  universe.setTimeScale(val);
  timeScaleLabel.textContent = val === 0 ? 'Paused' : `${val} days/sec`;
});

let apodLoaded = false;
btnApod.addEventListener('click', async () => {
  apodModal.classList.toggle('hidden');
  if (apodLoaded) return;
  apodLoaded = true;
  try {
    const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    if (!res.ok) throw new Error('DEMO_KEY limit');
    const data = await res.json();
    apodTitle.textContent = `${data.title} (${data.date})`;
    apodDesc.textContent = data.explanation;
    if (data.media_type === 'image' && data.url) {
      apodImg.src = data.url;
      apodImg.classList.remove('hidden');
    }
  } catch {
    apodTitle.textContent = 'NASA James Webb & Hubble Deep-Space Briefing';
    apodDesc.textContent =
      'Explore our 4-zone cosmic catalog grounded in NASA JPL Horizons ephemerides, the NASA Exoplanet Archive, and Hubble/Webb Messier observations. Click the NASA link on any Science Card to open the official NASA mission page for that world.';
    apodLink.href = 'https://science.nasa.gov/apod/';
  }
});
btnApodClose.addEventListener('click', () => {
  apodModal.classList.add('hidden');
});

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'KeyX') {
    flight?.toggleStop();
    syncFlightControlsUI();
  }
  if (e.code === 'KeyK') flight?.toggleMouseSteer();
  if (e.code === 'KeyL') toggleDifficulty();
  if (e.code === 'KeyO') toggleOrbits();
  if (e.code === 'KeyM') toggleFlightMode();
  if (e.code === 'KeyC') toggleCameraMode();
  if (e.code === 'KeyH') togglePilotHud();
  if (e.code === 'KeyV') btnSound.click();
});

window.addEventListener('resize', () => {
  const pr = Math.min(window.devicePixelRatio, 2);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(pr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(pr);
  composer.setSize(window.innerWidth, window.innerHeight);
});

updateDiscoveryBadge();
buildDestinationList();
renderScienceCard(activeDest);

const clock = new THREE.Clock();
const projVec = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const ndcPointer = new THREE.Vector2();

function handleCanvasPick(clientX, clientY) {
  ndcPointer.x = (clientX / window.innerWidth) * 2 - 1;
  ndcPointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndcPointer, camera);

  const currentZone = universe.getActiveZone();
  const zoneGroup = universe.zoneGroups[currentZone];
  if (!zoneGroup) return false;

  const hits = raycaster.intersectObjects(zoneGroup.children, true);
  for (const h of hits) {
    const id = h.object.userData?.catalogId;
    if (id) {
      const targetDest = universe.catalog.find((d) => d.id === id);
      if (targetDest) {
        selectDestination(targetDest, false);
        return true;
      }
    }
  }
  return false;
}

function formatDistanceLabel(rawDist, zone) {
  if (zone === 'solar') return `${(rawDist / 280).toFixed(2)} AU`;
  if (zone === 'stellar') return `${(rawDist * 0.25).toFixed(1)} ly`;
  if (zone === 'milkyway') return `${(rawDist * 15).toFixed(0)} ly`;
  return `${(rawDist * 0.0018).toFixed(2)} Mly`;
}

function formatEta(rawDist, speed) {
  if (rawDist < 28) return 'ARRIVED';
  if (speed <= 0.8) return 'HOVER';
  const secs = Math.round(rawDist / speed);
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function updateReticle() {
  if (!activeDest || !shipObj) {
    reticle.classList.add('hidden');
    return;
  }
  const dist = shipObj.root.position.distanceTo(activeDest.worldPosition);
  projVec.copy(activeDest.worldPosition).project(camera);

  if (projVec.z > 1 || Math.abs(projVec.x) > 1.05 || Math.abs(projVec.y) > 1.05) {
    reticle.classList.add('hidden');
    return;
  }

  reticle.classList.remove('hidden');
  const x = (projVec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projVec.y * 0.5 + 0.5) * window.innerHeight;
  reticle.style.left = `${x}px`;
  reticle.style.top = `${y}px`;
  reticleName.textContent = activeDest.name.toUpperCase();
  reticleDist.textContent = formatDistanceLabel(dist, universe.getActiveZone());
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const elapsed = clock.elapsedTime;

  if (flight && shipObj) {
    universe.update(dt, shipObj.root.position, Math.abs(flight.speed) / flight.boostSpeed);
    const state = flight.update(dt);
    shipObj.updateEffects(state.speed, flight.maxCruiseSpeed, state.isBoosting, elapsed);
    audio.update(state.throttle, state.isBoosting);

    speedValue.textContent = (state.speed * 1.4).toFixed(1);
    boostBar.style.width = `${state.boostEnergy.toFixed(0)}%`;
    fuelBar.style.width = `${state.fuel.toFixed(0)}%`;
    fuelValue.textContent = `${state.fuel.toFixed(0)}%`;

    const euler = new THREE.Euler().setFromQuaternion(shipObj.root.quaternion, 'YXZ');
    const deg = (((-THREE.MathUtils.radToDeg(euler.y) % 360) + 360) % 360).toFixed(0).padStart(3, '0');
    headingValue.textContent = `${deg}°`;
    const pitchDeg = Math.round(THREE.MathUtils.radToDeg(euler.x));
    pilotPitchText.textContent = `PITCH ${pitchDeg >= 0 ? '+' : ''}${pitchDeg}° • HDG ${deg}°`;

    if (!flight.autopilotTarget) {
      btnCancelAuto.classList.add('hidden');
    }

    const currentZone = universe.getActiveZone();
    if (activeDest && activeDest.zone === currentZone) {
      const remDist = shipObj.root.position.distanceTo(activeDest.worldPosition);
      fpTarget.textContent = activeDest.name;
      fpDistance.textContent = formatDistanceLabel(remDist, currentZone);
      fpEta.textContent = formatEta(remDist, state.speed);
      universe.updateFlightPath(shipObj.root.position, activeDest.worldPosition, elapsed, remDist > 22);
    } else {
      universe.updateFlightPath(shipObj.root.position, null, elapsed, false);
    }

    universe.catalog.forEach((d) => {
      if (d.zone !== currentZone) return;
      const dist = shipObj.root.position.distanceTo(d.worldPosition);
      const el = document.getElementById(`dist-${d.id}`);
      if (el) {
        el.textContent = formatDistanceLabel(dist, currentZone).split(' ')[0];
      }
      if (dist < d.radius * 3.6 + 28 && !flight.autopilotTarget) {
        if (activeDest?.id !== d.id) {
          selectDestination(d, false);
        }
        markVisited(d);
      }
    });

    updateReticle();
  }

  composer.render();
}

async function init() {
  try {
    shipObj = await loadTridentShip(renderer, (p) => {
      const pct = Math.min(100, Math.round(p * 100));
      loaderBar.style.width = `${pct}%`;
      loaderPercent.textContent = `${pct}%`;
    });

    scene.add(shipObj.root);
    flight = new FlightController(shipObj.root, camera);
    flight.onStateChange = syncFlightControlsUI;
    flight.onCanvasClick = handleCanvasPick;

    universe.update(0.016, new THREE.Vector3(), 0);
    flight.warpTo(activeDest);
    flight.setTargetSpeed(24);
    flight.speed = 16;
    syncFlightControlsUI();

    flight.onAutopilotArrive = (arrivedDest) => {
      btnCancelAuto.classList.add('hidden');
      markVisited(arrivedDest);
      syncFlightControlsUI();
      sectorLabel.textContent = `${arrivedDest.name.toUpperCase()} • STATIONARY ORBIT`;
    };

    loaderBar.style.width = '100%';
    loaderPercent.textContent = '100%';
    setTimeout(() => {
      loaderOverlay.classList.add('hidden');
    }, 350);

    animate();
  } catch (err) {
    console.error('Failed to initialize Trident Galactic:', err);
    document.getElementById('loader-status').textContent = 'Error loading 3D spacecraft model.';
  }
}

init();
