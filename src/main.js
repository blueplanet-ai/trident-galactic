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
const roomEnv = new RoomEnvironment();
scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
scene.environmentIntensity = 0.65;
roomEnv.dispose();
pmremGenerator.dispose();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.08, 25000);

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
const volumeSlider = document.getElementById('volume-slider');
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
const btnResetProgress = document.getElementById('btn-reset-progress');
const timeControlBox = document.getElementById('time-control-box');
const orbitSpeedGroup = document.getElementById('orbit-speed-group');
const timeSlider = document.getElementById('time-slider');
const timeScaleLabel = document.getElementById('time-scale-label');
const spinSlider = document.getElementById('spin-slider');
const spinScaleLabel = document.getElementById('spin-scale-label');

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
const btnDampeners = document.getElementById('btn-dampeners');
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
const progradeMarker = document.getElementById('prograde-marker');
const progradeLabel = document.getElementById('prograde-label');

let shipObj = null;
let flight = null;
let difficulty = 'explorer';
let pilotHudMode = false;
const defaultEarth = universe.catalog.find((d) => d.id === 'earth') || universe.catalog[0];
let activeDest = defaultEarth;
let lastScienceDest = defaultEarth;

const STORAGE_KEY = 'trident_galactic_progress_v2';
const visitedIds = new Set();
const answeredQuizzes = new Set();
const distLabelEls = new Map();
let quizScore = 0;

function loadSavedProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.visitedIds)) {
      parsed.visitedIds.forEach((id) => visitedIds.add(id));
    }
    if (Array.isArray(parsed.answeredQuizzes)) {
      parsed.answeredQuizzes.forEach((k) => answeredQuizzes.add(k));
    }
    if (typeof parsed.quizScore === 'number') {
      quizScore = parsed.quizScore;
      quizScoreEl.textContent = `Score: ${quizScore}`;
    }
    if (parsed.difficulty === 'explorer' || parsed.difficulty === 'advanced') {
      difficulty = parsed.difficulty;
      difficultyText.textContent = difficulty === 'explorer' ? 'EXPLORER (K–12)' : 'ASTROPHYSICIST';
      btnDifficulty.classList.toggle('active', difficulty === 'advanced');
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        visitedIds: Array.from(visitedIds),
        answeredQuizzes: Array.from(answeredQuizzes),
        quizScore,
        difficulty
      })
    );
  } catch {
    // Ignore storage errors
  }
}

loadSavedProgress();

function updateDiscoveryBadge() {
  discoveryProgress.textContent = `Discovered: ${visitedIds.size} / ${universe.catalog.length}`;
}

function getShuffledOptionOrder(quizKey, count) {
  const indices = Array.from({ length: count }, (_, i) => i);
  if (count !== 3) return indices;
  const perms = [
    [0, 1, 2],
    [1, 0, 2],
    [1, 2, 0],
    [0, 2, 1],
    [2, 0, 1],
    [2, 1, 0]
  ];
  let hash = 2166136261;
  for (let i = 0; i < quizKey.length; i++) {
    hash ^= quizKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return perms[(hash >>> 0) % perms.length];
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
  const alreadySolved = answeredQuizzes.has(quizKey);
  quizQuestion.textContent = content.quiz.question;
  quizOptions.innerHTML = '';

  if (alreadySolved) {
    quizFeedback.textContent = `✓ Completed! ${content.quiz.explanation}`;
    quizFeedback.classList.remove('hidden');
  } else {
    quizFeedback.classList.add('hidden');
  }

  const optionOrder = getShuffledOptionOrder(quizKey, content.quiz.options.length);
  optionOrder.forEach((origIdx, displayIdx) => {
    const optText = content.quiz.options[origIdx];
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    if (alreadySolved && origIdx === content.quiz.answerIndex) {
      btn.classList.add('correct');
    }
    btn.textContent = optText;
    btn.addEventListener('click', () => {
      const isCorrect = origIdx === content.quiz.answerIndex;
      quizOptions.querySelectorAll('.quiz-opt').forEach((b, i) => {
        b.classList.toggle('correct', optionOrder[i] === content.quiz.answerIndex);
        b.classList.toggle('wrong', i === displayIdx && !isCorrect);
      });
      quizFeedback.textContent = `${isCorrect ? '✓ Correct! ' : 'Not quite — '}${content.quiz.explanation}`;
      quizFeedback.classList.remove('hidden');

      if (isCorrect) {
        markVisited(dest);
        if (!answeredQuizzes.has(quizKey)) {
          answeredQuizzes.add(quizKey);
          quizScore += 1;
          quizScoreEl.textContent = `Score: ${quizScore}`;
          audio.playDiscoveryChime();
          saveProgress();
        }
      } else {
        audio.playQuizWrong();
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
    saveProgress();
  }
}

function syncFlightControlsUI() {
  if (!flight) return;
  if (document.activeElement !== throttleSlider) {
    throttleSlider.value = Math.round(flight.targetThrottleSpeed);
  }
  zoomSlider.value = flight.zoomToSliderValue();
  zoomValue.textContent = `${Math.round(flight.zoomDistance)}m`;
  btnStop.classList.toggle('active', flight.isStopped);
  btnCruise.classList.toggle('active', flight.cruiseHoldActive);
  btnRev.classList.toggle('active', flight.keys.has('KeyR') || flight.uiHeld.has('reverse') || flight.speed < -0.8);
  btnBoost.classList.toggle('active', flight.isBoosting);
  if (btnDampeners) {
    btnDampeners.textContent = flight.dampenersEnabled ? 'DAMPERS: ON' : 'COAST (OFF)';
    btnDampeners.classList.toggle('coast', !flight.dampenersEnabled);
  }
  if (btnMouseSteer) {
    btnMouseSteer.textContent = flight.mouseSteerEnabled ? 'MOUSE: ON' : 'MOUSE: LOCKED';
    btnMouseSteer.classList.toggle('locked', !flight.mouseSteerEnabled);
  }
}

function selectDestination(dest, engageAutopilot = false) {
  if (!dest) {
    activeDest = null;
    if (flight) flight.setAutopilot(null);
    btnCancelAuto.classList.add('hidden');
    fpTarget.textContent = 'NONE (SELECT TARGET)';
    fpDistance.textContent = '--';
    fpEta.textContent = '--:--';
    document.querySelectorAll('.dest-item').forEach((el) => el.classList.remove('active'));
    return;
  }

  const changed = lastScienceDest?.id !== dest.id;
  activeDest = dest;
  lastScienceDest = dest;
  fpTarget.textContent = dest.name;
  if (changed) {
    renderScienceCard(dest);
  }
  document.querySelectorAll('.dest-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.id === dest.id);
  });

  // If autopilot is explicitly requested OR already active toward another target, direct autopilot to the newly selected destination
  const shouldAutoFly = engageAutopilot || Boolean(flight?.autopilotTarget);
  if (shouldAutoFly && flight) {
    if (flight.isStopped && flight.lockedOrbitTarget === dest) {
      return;
    }
    flight.setAutopilot(dest);
    audio.playAutopilotEngage();
    syncFlightControlsUI();
    btnCancelAuto.classList.remove('hidden');
    sectorLabel.textContent = `AUTOPILOT • ${dest.name.toUpperCase()}`;
  }
}

function buildDestinationList() {
  const currentZone = universe.getActiveZone();
  const zoneItems = universe.catalog.filter((d) => d.zone === currentZone);
  destListEl.innerHTML = '';
  distLabelEls.clear();

  zoneItems.forEach((dest) => {
    const row = document.createElement('div');
    const isMoonSub = Boolean(dest.parentId);
    row.className = `dest-item ${isMoonSub ? 'moon-subitem' : ''} ${activeDest?.id === dest.id ? 'active' : ''}`;
    row.dataset.id = dest.id;
    const visitedMark = visitedIds.has(dest.id)
      ? '<span class="explored-badge" title="Explored">✓ Explored</span>'
      : '';
    const prefix = isMoonSub ? '<span class="moon-prefix">↳</span>' : '';
    row.innerHTML = `
      <div class="dest-meta">
        <span class="dest-name">${prefix}${dest.name} ${visitedMark}</span>
        <span class="dest-type">${dest.category}</span>
      </div>
      <div class="dest-actions">
        <span class="dest-dist mono" id="dist-${dest.id}">--</span>
        <button class="warp-pill" title="Instant Hyper-Warp to ${dest.name}">WARP</button>
      </div>
    `;
    const distSpan = row.querySelector('.dest-dist');
    if (distSpan) distLabelEls.set(dest.id, distSpan);
    row.addEventListener('click', (e) => {
      if (e.target.classList.contains('warp-pill')) {
        markVisited(dest);
        selectDestination(dest, false);
        flight?.warpTo(dest);
        audio.playWarpJump();
        syncFlightControlsUI();
        btnCancelAuto.classList.add('hidden');
        sectorLabel.textContent = `${dest.name.toUpperCase()} • STATIONARY ORBIT`;
        return;
      }
      // Clicking an already-selected destination a second time deselects it
      if (activeDest?.id === dest.id && !flight?.autopilotTarget) {
        selectDestination(null, false);
        return;
      }
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
  audio.setZone(zoneId);
  audio.playWarpJump();
  const zoneMeta = ZONES.find((z) => z.id === zoneId);
  if (zoneMeta) {
    sectorLabel.textContent = zoneMeta.badge;
  }
  document.querySelectorAll('.zone-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.zone === zoneId);
  });
  if (orbitSpeedGroup) {
    orbitSpeedGroup.style.display = zoneId === 'solar' || zoneId === 'stellar' ? 'block' : 'none';
  }

  const firstInZone = universe.catalog.find((d) => d.zone === zoneId);
  if (firstInZone) {
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
  audio.playUiClick(difficulty === 'advanced' ? 'on' : 'off');
  renderScienceCard(activeDest || lastScienceDest);
  saveProgress();
}

function toggleOrbits() {
  universe.orbitLinesGroup.visible = !universe.orbitLinesGroup.visible;
  const on = universe.orbitLinesGroup.visible;
  orbitsText.textContent = on ? 'ON' : 'OFF';
  btnOrbits.classList.toggle('active', on);
  audio.playUiClick(on ? 'on' : 'off');
}

function toggleFlightMode() {
  if (!flight) return;
  const next = flight.mode === 'arcade' ? 'manual' : 'arcade';
  flight.setMode(next);
  flightModeText.textContent = next === 'arcade' ? 'ARCADE' : '6-DOF';
  audio.playUiClick(next === 'manual' ? 'on' : 'off');
}

function toggleCameraMode() {
  if (!flight) return;
  const next = flight.cameraMode === 'chase' ? 'orbit' : 'chase';
  flight.setCameraMode(next);
  cameraModeText.textContent = next === 'chase' ? 'CHASE CAM' : 'ORBIT CAM';
  audio.playUiClick(next === 'orbit' ? 'on' : 'off');
}

function togglePilotHud() {
  pilotHudMode = !pilotHudMode;
  hud.classList.toggle('pilot-hud', pilotHudMode);
  pilotHudOverlay.classList.toggle('hidden', !pilotHudMode);
  hudModeText.textContent = pilotHudMode ? 'PILOT HUD' : 'FULL';
  btnHudToggle.classList.toggle('active', pilotHudMode);
  audio.playUiClick(pilotHudMode ? 'on' : 'off');
}

function toggleDampenersWithSfx() {
  if (!flight) return;
  const on = flight.toggleDampeners();
  audio.playUiClick(on ? 'on' : 'coast');
}

btnDifficulty.addEventListener('click', toggleDifficulty);
btnOrbits.addEventListener('click', toggleOrbits);
btnDampeners?.addEventListener('click', toggleDampenersWithSfx);
btnMouseSteer.addEventListener('click', () => {
  const on = flight?.toggleMouseSteer();
  audio.playUiClick(on ? 'on' : 'off');
});
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
  audio.playWarpJump();
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
  flight.stopShip();
  syncFlightControlsUI();
  btnCancelAuto.classList.add('hidden');
  sectorLabel.textContent = `${(activeDest || lastScienceDest).name.toUpperCase()} • STATIONARY HOVER`;
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
  if (!flight) return;
  flight.setZoom(flight.sliderValueToZoom(e.target.value));
});
btnZoomIn.addEventListener('click', () => {
  flight?.stepZoom(-1);
});
btnZoomOut.addEventListener('click', () => {
  flight?.stepZoom(1);
});
btnCamReset.addEventListener('click', () => {
  flight?.resetCameraView();
});

btnSound.addEventListener('click', () => {
  const on = audio.toggle();
  soundText.textContent = on ? 'ON' : 'OFF';
  btnSound.classList.toggle('active', on);
  volumeSlider?.classList.toggle('hidden', !on);
  if (on && volumeSlider) {
    audio.setVolume(Number(volumeSlider.value) / 100);
    audio.playUiClick('on');
  }
});

volumeSlider?.addEventListener('input', (e) => {
  audio.setVolume(Number(e.target.value) / 100);
});
btnCancelAuto.addEventListener('click', () => {
  if (flight) flight.setAutopilot(null);
  btnCancelAuto.classList.add('hidden');
});

btnResetProgress?.addEventListener('click', () => {
  visitedIds.clear();
  answeredQuizzes.clear();
  quizScore = 0;
  quizScoreEl.textContent = 'Score: 0';
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  updateDiscoveryBadge();
  selectDestination(null, false);
  buildDestinationList();
  renderScienceCard(lastScienceDest);
});

timeSlider.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  universe.setTimeScale(val);
  timeScaleLabel.textContent = val === 0 ? 'Paused' : `${val} days/sec`;
});

spinSlider?.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  universe.setSpinScale(val / 100);
  if (spinScaleLabel) {
    spinScaleLabel.textContent = val === 0 ? 'Paused' : `${(val / 100).toFixed(1)}×`;
  }
});

let apodLoaded = false;
btnApod.addEventListener('click', async () => {
  apodModal.classList.toggle('hidden');
  if (apodLoaded) return;
  apodLoaded = true;
  try {
    const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true');
    if (!res.ok) throw new Error('DEMO_KEY limit');
    const data = await res.json();
    apodTitle.textContent = `${data.title} (${data.date})`;
    apodDesc.textContent = data.explanation;
    if (data.media_type === 'image' && data.url) {
      apodImg.src = data.url;
      apodImg.classList.remove('hidden');
      apodLink.href = 'https://science.nasa.gov/apod/';
      apodLink.textContent = 'Open Official NASA APOD Archive ↗';
    } else if (data.media_type === 'video') {
      apodImg.src = data.thumbnail_url || './og-image.png';
      apodImg.classList.remove('hidden');
      apodLink.href = data.url || 'https://science.nasa.gov/apod/';
      apodLink.textContent = 'Watch Official NASA APOD Video ↗';
    }
  } catch {
    apodTitle.textContent = 'NASA James Webb & Hubble Deep-Space Briefing';
    apodDesc.textContent =
      'Explore our 4-zone cosmic catalog grounded in NASA JPL Horizons ephemerides, the NASA Exoplanet Archive, and Hubble/Webb Messier observations. Click the NASA link on any Science Card to open the official NASA mission page for that world.';
    apodImg.src = './og-image.png';
    apodImg.classList.remove('hidden');
    apodLink.href = 'https://science.nasa.gov/apod/';
    apodLink.textContent = 'Open Official NASA APOD Archive ↗';
  }
});
btnApodClose.addEventListener('click', () => {
  apodModal.classList.add('hidden');
});

[timeSlider, spinSlider, throttleSlider, zoomSlider, volumeSlider].forEach((slider) => {
  if (!slider) return;
  slider.addEventListener('change', () => slider.blur());
  slider.addEventListener('mouseup', () => slider.blur());
  slider.addEventListener('touchend', () => slider.blur());
});

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = e.target?.tagName;
  if (tag === 'TEXTAREA' || e.target?.isContentEditable || (tag === 'INPUT' && e.target.type !== 'range')) {
    return;
  }

  if (e.code === 'Escape') {
    if (!apodModal.classList.contains('hidden')) {
      apodModal.classList.add('hidden');
      return;
    }
    if (flight?.autopilotTarget) {
      flight.setAutopilot(null);
      btnCancelAuto.classList.add('hidden');
      return;
    }
  }

  if (e.code === 'Space' || e.code === 'KeyX' || e.code === 'Digit0' || e.code === 'Numpad0') {
    e.preventDefault();
    if (document.activeElement && (document.activeElement.tagName === 'BUTTON' || document.activeElement.tagName === 'INPUT')) {
      document.activeElement.blur();
    }
    if (flight) {
      flight.stopShip();
      syncFlightControlsUI();
      btnCancelAuto.classList.add('hidden');
      sectorLabel.textContent = `${(activeDest || lastScienceDest).name.toUpperCase()} • STATIONARY HOVER`;
    }
  }
  if (e.code === 'KeyZ') toggleDampenersWithSfx();
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
const scratchEuler = new THREE.Euler(0, 0, 0, 'YXZ');
const raycaster = new THREE.Raycaster();
const ndcPointer = new THREE.Vector2();

function handleCanvasPick(clientX, clientY, engageAutopilot = false) {
  camera.updateMatrixWorld();
  ndcPointer.x = (clientX / window.innerWidth) * 2 - 1;
  ndcPointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndcPointer, camera);

  const currentZone = universe.getActiveZone();
  const zoneObjects = universe.catalog.filter((d) => d.zone === currentZone);
  const zoneHitSpheres = zoneObjects.filter((d) => d.hitSphere).map((d) => d.hitSphere);

  let pickedDest = null;

  if (zoneHitSpheres.length > 0) {
    const hits = raycaster.intersectObjects(zoneHitSpheres, false);
    for (const h of hits) {
      const id = h.object.userData?.catalogId;
      if (!id) continue;
      const candidate = zoneObjects.find((d) => d.id === id);
      if (!candidate) continue;

      // If multiple objects lie along the ray and the first hit is the object we already have selected/parked at, prefer the other target along the ray
      if (hits.length > 1 && (flight?.lockedOrbitTarget === candidate || activeDest === candidate)) {
        continue;
      }
      pickedDest = candidate;
      break;
    }
  }

  // 2D Screen-Space Projection Assist for distant stars/planets/moons (so TRAPPIST-1, Betelgeuse, etc. are always easy to click)
  if (!pickedDest) {
    let bestDistPx = 42;
    for (const d of zoneObjects) {
      projVec.copy(d.worldPosition).project(camera);
      if (projVec.z > 1 || projVec.z < -1) continue;
      const sx = (projVec.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-projVec.y * 0.5 + 0.5) * window.innerHeight;
      const dPx = Math.hypot(clientX - sx, clientY - sy);
      if (dPx < bestDistPx) {
        bestDistPx = dPx;
        pickedDest = d;
      }
    }
  }

  if (pickedDest) {
    if (!engageAutopilot && activeDest?.id === pickedDest.id && !flight?.autopilotTarget) {
      selectDestination(null, false);
      return true;
    }
    selectDestination(pickedDest, engageAutopilot);
    return true;
  }
  return false;
}

function formatDistanceLabel(rawDist, zone) {
  if (zone === 'solar') return `${(rawDist / 640).toFixed(2)} AU`;
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
  camera.updateMatrixWorld();
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

const progradeWorldVec = new THREE.Vector3();
function updateProgradeMarker(state) {
  if (!progradeMarker || !shipObj || !state || state.speedMag < 1.8 || flight?.lockedOrbitTarget) {
    progradeMarker?.classList.add('hidden');
    return;
  }
  camera.updateMatrixWorld();
  progradeWorldVec.copy(shipObj.root.position).addScaledVector(state.velocityDirection, 140);
  projVec.copy(progradeWorldVec).project(camera);

  let isRetro = false;
  if (projVec.z > 1 || Math.abs(projVec.x) > 0.96 || Math.abs(projVec.y) > 0.96) {
    // Check retrograde direction (anti-velocity) when coasting backwards or reversing
    progradeWorldVec.copy(shipObj.root.position).addScaledVector(state.velocityDirection, -140);
    projVec.copy(progradeWorldVec).project(camera);
    if (projVec.z > 1 || Math.abs(projVec.x) > 0.96 || Math.abs(projVec.y) > 0.96) {
      progradeMarker.classList.add('hidden');
      return;
    }
    isRetro = true;
  }

  progradeMarker.classList.remove('hidden');
  progradeMarker.classList.toggle('retrograde', isRetro);
  if (progradeLabel) {
    progradeLabel.textContent = isRetro ? 'RETROGRADE' : 'PROGRADE';
  }
  const x = (projVec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projVec.y * 0.5 + 0.5) * window.innerHeight;
  progradeMarker.style.left = `${x}px`;
  progradeMarker.style.top = `${y}px`;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const elapsed = clock.elapsedTime;

  if (flight && shipObj) {
    const currentZone = universe.getActiveZone();
    const zoneObjects = universe.catalog.filter((d) => d.zone === currentZone);
    universe.update(dt, shipObj.root.position, Math.abs(flight.speed) / flight.boostSpeed);
    const state = flight.update(dt, zoneObjects);
    shipObj.updateEffects(state.speed, flight.maxCruiseSpeed, state.isBoosting, elapsed, state);

    let proximity = null;
    if (audio.enabled) {
      let bestDist = Infinity;
      for (let i = 0; i < zoneObjects.length; i++) {
        const obj = zoneObjects[i];
        if (obj.id === 'crab-nebula' || obj.id === 'sagittarius-a' || obj.visualType === 'star') {
          const d = shipObj.root.position.distanceTo(obj.worldPosition);
          if (d < bestDist) {
            bestDist = d;
            proximity = { id: obj.id, visualType: obj.visualType, dist: d };
          }
        }
      }
    }
    audio.update(state, proximity);

    speedValue.textContent = (state.speed * 1.4).toFixed(1);
    if (!state.cruiseHoldActive && document.activeElement !== throttleSlider) {
      throttleSlider.value = Math.round(
        THREE.MathUtils.clamp(state.forwardSpeed, flight.minReverseSpeed, flight.maxCruiseSpeed)
      );
    }
    boostBar.style.width = `${state.boostEnergy.toFixed(0)}%`;
    fuelBar.style.width = `${state.fuel.toFixed(0)}%`;
    fuelValue.textContent = `${state.fuel.toFixed(0)}%`;

    btnStop.classList.toggle('active', state.isStopped);
    btnCruise.classList.toggle('active', state.cruiseHoldActive);
    btnRev.classList.toggle('active', flight.keys.has('KeyR') || flight.uiHeld.has('reverse') || state.speed < -0.8);
    btnBoost.classList.toggle('active', state.isBoosting);
    btnFwd.classList.toggle('active', flight.keys.has('KeyF') || flight.uiHeld.has('forward'));

    const euler = scratchEuler.setFromQuaternion(shipObj.root.quaternion, 'YXZ');
    const deg = (((-THREE.MathUtils.radToDeg(euler.y) % 360) + 360) % 360).toFixed(0).padStart(3, '0');
    headingValue.textContent = `${deg}°`;
    const pitchDeg = Math.round(THREE.MathUtils.radToDeg(euler.x));
    pilotPitchText.textContent = `PITCH ${pitchDeg >= 0 ? '+' : ''}${pitchDeg}° • HDG ${deg}°`;

    if (!flight.autopilotTarget) {
      btnCancelAuto.classList.add('hidden');
    }

    const holdingActiveDest = Boolean(
      activeDest && flight.isStopped && flight.lockedOrbitTarget && flight.lockedOrbitTarget === activeDest
    );
    const autoFlyingActiveDest = Boolean(
      activeDest && flight.autopilotTarget && flight.autopilotTarget === activeDest
    );
    if (!activeDest) {
      btnFpAuto.textContent = 'AUTO-FLY';
      btnFpAuto.disabled = true;
      btnFpAuto.classList.remove('active');
      btnFpWarp.disabled = true;
    } else if (holdingActiveDest) {
      btnFpAuto.textContent = 'HOLDING ORBIT';
      btnFpAuto.disabled = true;
      btnFpAuto.classList.add('active');
      btnFpWarp.disabled = false;
    } else if (autoFlyingActiveDest) {
      btnFpAuto.textContent = 'AUTO-FLYING...';
      btnFpAuto.disabled = false;
      btnFpAuto.classList.add('active');
      btnFpWarp.disabled = false;
    } else {
      btnFpAuto.textContent = 'AUTO-FLY';
      btnFpAuto.disabled = false;
      btnFpAuto.classList.remove('active');
      btnFpWarp.disabled = false;
    }

    if (activeDest && activeDest.zone === currentZone) {
      const standoffDist = activeDest.approachOffset ? activeDest.approachOffset.length() : activeDest.radius * 2.8;
      const distToCenter = shipObj.root.position.distanceTo(activeDest.worldPosition);
      const remDist = Math.max(0, distToCenter - standoffDist);
      fpTarget.textContent = activeDest.name;
      fpDistance.textContent = formatDistanceLabel(distToCenter, currentZone);
      fpEta.textContent = holdingActiveDest ? 'ORBIT LOCK' : formatEta(remDist, state.speed);
      universe.updateFlightPath(
        shipObj.root.position,
        activeDest.worldPosition,
        elapsed,
        !holdingActiveDest && remDist > 6
      );
    } else {
      universe.updateFlightPath(shipObj.root.position, null, elapsed, false);
    }

    zoneObjects.forEach((d) => {
      const dist = shipObj.root.position.distanceTo(d.worldPosition);
      const el = distLabelEls.get(d.id);
      if (el) {
        const label = formatDistanceLabel(dist, currentZone);
        if (el.textContent !== label) el.textContent = label;
      }
    });

    updateReticle();
    updateProgradeMarker(state);
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
    flight.onCanvasClick = (x, y) => handleCanvasPick(x, y, false);
    flight.onCanvasDoubleClick = (x, y) => handleCanvasPick(x, y, true);

    universe.update(0.016, new THREE.Vector3(), 0);
    // Launch parked in Stationary Orbit facing Earth & Moon with Flight Path line hidden
    flight.warpTo(defaultEarth);
    flight.stopShip();
    syncFlightControlsUI();

    flight.onAutopilotArrive = (arrivedDest) => {
      btnCancelAuto.classList.add('hidden');
      markVisited(arrivedDest);
      audio.playOrbitLock();
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
