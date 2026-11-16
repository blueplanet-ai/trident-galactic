# Trident Galactic — Project Handover & Engineering Backlog

## 1. Project Overview
**Trident Galactic** is an interactive 3D space-flight and NASA-grounded astronomy learning web application built with **Three.js** and **Vite**. Users pilot the custom *Trident Galactic* biosphere spacecraft across four nested cosmic zones (**Solar System**, **Nearby Stars & Exoplanets**, **Milky Way Sector**, and **Local Group Galaxies**), inspecting NASA-derived science telemetry and answering dual-difficulty (**Explorer K–12** vs. **Astrophysicist**) Quick Check quizzes.

- **Local Repository Path**: `/Users/chuhee/Downloads/SW_Repos/GitHub/trident-galactic`
- **GitHub Remote**: `trident-galactic` repository on GitHub (`main` branch)

---

## 2. Repository Structure & Key Files
- `index.html`: 3-row non-overlapping CSS Grid HUD (`header`, `main.hud-middle`, `footer.hud-bottom`), collapsible left/right drawers, Pilot HUD sight overlay, Flight Plan Bar, and Cockpit Control Deck.
- `src/main.js`: WebGL2 renderer + 4x MSAA `HalfFloatType` `EffectComposer` (`UnrealBloomPass`), UI event bindings, 3D raycast picking (`handleCanvasPick`), reticle projection (`updateReticle`), Flight Plan telemetry, and main `animate()` loop.
- `src/flight.js`: `FlightController` class: Arcade & Manual 6-DOF rotation, forward/reverse throttle (`-35` to `+80`), Hyper-Boost (`220`), fuel consumption/refuel, camera modes (`chase` / `orbit`), zoom distance, and `autopilotTarget` guidance.
- `src/ship.js`: Loads `public/models/trident-galactic.glb` via `GLTFLoader` + `DRACOLoader`, applies 16x anisotropic texture filtering, and drives the 3 rear Mach-diamond plasma plumes + 2 front wing leading-edge retro-thrusters.
- `src/universe.js`: Builds the 4 cosmic zone `THREE.Group` hierarchies, procedural 2K planetary textures, atmospheric Fresnel shaders, Saturn/black-hole radial ring UVs, 28,000-star spiral galaxies, Keplerian orbital motion, and the animated 3D Flight Path line.
- `src/nasaData.js`: Offline-safe, structured catalog of 14 celestial destinations across 4 zones with dual-difficulty educational content (`explorer` K–12 and `advanced` Astrophysicist), quizzes, and official NASA reference links.
- `src/audio.js`: `SpaceAudio` Web Audio API synthesizer: stereo convolution reverb, Dmaj9 ambient cosmic pad, dual detuned sub-bass reactor oscillators, pink-noise ion turbine bandpass filter, boost ignition sub-drop, and discovery chime.
- `src/style.css`: Glassmorphic sci-fi theme, 3-row CSS Grid layout, Pilot HUD mode rules, and Cockpit Control Deck styles.
- `public/models/trident-galactic.glb`: Repaired 3.1 MB spacecraft mesh (419,705 triangles, 4096x4096 WebP PBR textures, Draco-compressed, smoothed wingtips, cleaned winglet UV seams).
- `.github/workflows/deploy.yml`: GitHub Actions workflow that builds and deploys `./dist` to GitHub Pages on push to `main`.

---

## 3. Current Keyboard & Cockpit Controls Reference
*(Addresses Question #4: What is the keyboard for reverse and forward?)*

- **Accelerate Forward (Increase Throttle)**: Hold **`R`** on keyboard, or hold **`FWD ▶`** button, or drag the **Throttle Slider** right (`0` to `+80`).
- **Reverse / Decelerate (Negative Throttle)**: Hold **`F`** on keyboard, or hold **`◀ REV`** button, or drag the **Throttle Slider** left (`0` to `-35`).
- **Full Stop / Hover (`0.0 Mm/s`)**: Press **`X`** or hold **`Space`**, or click **`■ STOP (0)`**.
- **Standard Cruise (`24.0 Mm/s`)**: Click **`CRUISE`** button.
- **Hyper-Boost (`220 Mm/s`)**: Hold **`Shift`**, or hold **`⚡ BOOST`** button.
- **Pitch Up / Down**: **`W` / `S`** or **`↑` / `↓`**, or click/hold **`▲` / `▼`** on Steering D-Pad.
- **Turn Left / Right (or Roll in 6-DOF)**: **`A` / `D`** or **`←` / `→`** (`Q`/`E` yaw in 6-DOF), or click/hold **`◀` / `▶`** and **`↶` / `↷`** on Steering D-Pad.
- **Lock / Unlock Mouse Steering**: Press **`K`** or click empty 3D space, or click **`MOUSE: ON / LOCKED`** badge.
- **Zoom In / Zoom Out**: **`+` (`=`)** / **`-`** or **Mouse Scroll Wheel**, or click **`＋ ZOOM IN`** / **`－ ZOOM OUT`** or drag **Zoom Slider**.
- **Switch Flight Mode (Arcade / 6-DOF)**: Press **`M`** or click **`ARCADE` / `6-DOF`** badge.
- **Switch Camera (Chase / Orbit)**: Press **`C`** or click **`CHASE CAM` / `ORBIT CAM`** badge.
- **Toggle Pilot HUD Mode**: Press **`H`** or click **`VIEW: FULL / PILOT HUD`** button.
- **Switch Learning Difficulty**: Press **`L`** or click **`LEVEL: EXPLORER / ASTROPHYSICIST`** button.
- **Toggle Orbit Paths**: Press **`O`** or click **`ORBITS: ON / OFF`** button.
- **Toggle Space Audio**: Press **`V`** or click **`AUDIO: ON / OFF`** button.

---

## 4. Root-Cause Analysis & Exact Fix Specifications for the 7 Reported Issues

### Issue 1: Auto-Fly Infinite Loop / Orbit Circling Near Destination
- **Symptom**: When engaging `AUTO-FLY` to a planet in the Solar System (or when already near a destination), the ship either circles indefinitely or fails to transition cleanly into a stationary hold relative to the planet.
- **Root Cause**:
  1. In `src/universe.js` (`lines 594–608`), Solar System planets continuously move along their Keplerian orbits (`simDaysPerSecond = 8` by default). For moving planets, `targetPoint` moves while the ship's turn rate (`slerp(desiredQuat, clampedDt * 2.8)`) at high speed (`160–220`) has a turning radius larger than `18` units—causing the ship to orbit around `targetPoint` without ever entering `dist < 18`.
  2. Once `dist < 18` triggers and `this.speed = 0`, the planet continues moving along its orbit in `universe.js` while the ship stays at a fixed world coordinate, so the planet immediately drifts away from the parked ship.
- **Fix Specification**:
  1. **Add Station-Keeping / Orbit Lock (`lockedOrbitTarget`) in `src/flight.js`**:
     - When `warpTo(dest)` or `autopilotTarget` arrival triggers, set `this.lockedOrbitTarget = dest` and store `this.lockedOrbitOffset = this.ship.position.clone().sub(dest.worldPosition)`.
     - While `this.isStopped && this.lockedOrbitTarget` is active, update `this.ship.position.copy(this.lockedOrbitTarget.worldPosition).add(this.lockedOrbitOffset)` each frame so Hold Mode stays parked in stationary orbit relative to the moving planet. Clear `lockedOrbitTarget` when the user manually accelerates or steers.
  2. **Prevent Autopilot Overshoot**:
     - In `src/flight.js` (`lines 240–255`), increase the arrival capture radius to `Math.max(24, this.autopilotTarget.radius * 0.8)` and scale angular turn rate up as distance decreases (`clampedDt * (3.5 + (1 - Math.min(1, dist / 200)) * 6.0)`), clamping approach speed to `Math.min(desiredSpeed, dist * 1.2)` within `dist < 120`.
  3. **Disable `AUTO-FLY` When Already Holding Orbit**:
     - In `src/main.js`, if `flight.lockedOrbitTarget === activeDest`, display `HOLDING ORBIT` on `#btn-fp-auto` and ignore redundant autopilot clicks.

### Issue 2: Camera Zoom Range Too Small for Planetary & Solar System Views
- **Symptom**: At Saturn (`radius = 28`, rings out to `65.8`) or Jupiter (`radius = 34`), the maximum zoom out (`maxZoom = 42` in `src/flight.js:24` and `index.html:231`) is smaller than the planet's own radius, making it impossible to zoom out to see the full planet system or neighboring planets in the Solar System.
- **Root Cause**: `this.maxZoom = 42` was sized only for the `7.5m` spacecraft hull, not for planetary/system-wide observation (`Solar System` spans `2,160` units across).
- **Fix Specification**:
  1. In `src/flight.js` (`line 24`) and `index.html` (`#zoom-slider`, `line 231`), expand `minZoom = 5`, `maxZoom = 1400` using a logarithmic/exponential zoom curve on the slider (`0..100` mapped to `5m .. 1400m`).
  2. Make mouse-wheel and `+`/`-` zoom step proportional to current zoom distance (`this.setZoom(this.zoomDistance * (1 + Math.sign(deltaY) * 0.14))`) so zooming is fine-grained near the ship (`5m–30m`) and fast when zooming out to view Saturn's ring system (`150m`) or the entire Solar System (`1200m`).

### Issue 3: Confusing `STOP`, `CRUISE`, and `BOOST` Button Active Highlights
- **Symptom**: `⚡ BOOST` always looks highlighted, `CRUISE` never highlights even when cruising, and `■ STOP (0)` has a permanent yellow/orange border that changes when active.
- **Root Cause**:
  - In `index.html` (`lines 177–179`), `btn-stop` has hardcoded `.warn-btn` (permanent gold border/text) and `btn-boost` has hardcoded `.accent-btn` (permanent cyan border/text), while `syncFlightControlsUI()` in `src/main.js` (`line 221`) only toggles `.active` on `btnStop` and never updates `btnCruise` or `btnBoost`.
- **Fix Specification**:
  1. Remove static `.warn-btn` and `.accent-btn` classes from `#btn-stop` and `#btn-boost` in `index.html` so all propulsion mode buttons (`◀ REV`, `■ STOP`, `CRUISE`, `FWD ▶`, `⚡ BOOST`) share a neutral default style when inactive.
  2. Update button active classes every frame in `src/main.js`:
     - `btnStop.classList.toggle('active', state.isStopped)`
     - `btnCruise.classList.toggle('active', !state.isStopped && !state.isBoosting && state.speed > 0.8)`
     - `btnRev.classList.toggle('active', state.speed < -0.8)`
     - `btnBoost.classList.toggle('active', state.isBoosting)`

### Issue 4: Discoverable Keyboard Shortcuts for Forward & Reverse
- **Symptom**: It isn't obvious on screen which keyboard keys control Forward and Reverse throttle (`R` and `F`).
- **Root Cause**: `btn-rev` and `btn-fwd` in `index.html` (`lines 166, 174`) only show `R` and `F` in hover tooltips (`title="..."`), not on the visible button labels.
- **Fix Specification**:
  - Update the button text in `index.html` to `◀ REV (F)` and `FWD (R) ▶`.

### Issue 5: Target Reticle Circle Offset from Planet Center
- **Symptom**: When a planet is selected, the cyan target circle (`#target-reticle`) is not centered on the planet's sphere.
- **Root Cause**:
  1. In `index.html` (`lines 25–30`) and `src/style.css`, `#target-reticle` is a flex column containing both `.reticle-ring` (`34x34px`) and `.reticle-label` (`~22px` tall) below it, with `transform: translate(-50%, -50%)` applied to the entire `#target-reticle` container. Because the combined container height is `~62px`, `translate(-50%, -50%)` centers the combined box at `(x, y)`—pushing the `.reticle-ring` circle **14 pixels above** the planet's projected 3D center.
  2. Additionally, `updateReticle()` in `src/main.js` (`line 472`) projects coordinates before `camera.updateMatrixWorld()` is called for that frame.
- **Fix Specification**:
  1. In `src/style.css`, set `#target-reticle` to `width: 0; height: 0;`, position `.reticle-ring` with `position: absolute; left: 0; top: 0; transform: translate(-50%, -50%);`, and position `.reticle-label` below it with `position: absolute; left: 0; top: 24px; transform: translateX(-50%);` so the ring's center always lands on the exact projected pixel of `activeDest.worldPosition`.
  2. Call `camera.updateMatrixWorld()` right before `projVec.copy(activeDest.worldPosition).project(camera)` in `updateReticle()`.

### Issue 6: "Discovered" Planet List Auto-Checks Planets Just by Passing Nearby
- **Symptom**: Flying past a planet in `src/main.js` (`line 526`) automatically switches `activeDest` and marks it "Discovered" with a green dot.
- **Root Cause**: `animate()` in `src/main.js` (`lines 526–531`) runs a passive proximity check (`if (dist < d.radius * 3.6 + 28 && !flight.autopilotTarget)`) that overwrites `activeDest` and calls `markVisited(d)` during fly-bys.
- **Fix Specification**:
  1. Remove the passive fly-by auto-switch/auto-visit block in `src/main.js` (`lines 526–531`).
  2. Only mark a destination as **Explored** when the user intentionally **arrives** via `AUTO-FLY`, **warps** via `WARP`, or **completes its Quick Check quiz**, and display a clear `✓ Explored` badge in the list.

### Issue 7: Mouse Steering (`MOUSE: ON / LOCKED`) Does Not Steer When Stopped or After Clicking
- **Symptom**: Even when `MOUSE: ON` is displayed, moving the mouse does not turn the spaceship when stopped/hovering or after clicking near objects.
- **Root Cause**:
  1. **Line 298 in `src/flight.js` (`Math.abs(this.speed) > 1.5` gate)**:
     `if (this.mouseSteerEnabled && this.pointer.active && this.cameraMode === 'chase' && Math.abs(this.speed) > 1.5)`
     Whenever the ship arrives at a destination, warps, or is in `STOP / HOVER` (`speed === 0`), `Math.abs(this.speed) > 1.5` evaluates to `false`, completely disabling mouse steering while stationary.
  2. **Line 97 in `src/flight.js` (Canvas click vs. Raycaster pick)**: Clicking near a planet's generous invisible `hitSphere` (`max(radius * 1.65, 22)`) triggers `handleCanvasPick` (`handled = true`), which prevents the click from toggling `mouseSteerEnabled`.
- **Fix Specification**:
  1. In `src/flight.js` (`line 298`), remove `&& Math.abs(this.speed) > 1.5` so `MOUSE: ON` rotates the ship whether cruising or hovering at `0.0 Mm/s`.
  2. Keep `this.pointer.x` and `this.pointer.y` updated continuously on `mousemove`, and only pause steering while `Boolean(e.target.closest('.glass'))` is true.
