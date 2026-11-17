# Trident Galactic — Project Handover & Engineering Backlog

## 1. Project Overview
**Trident Galactic** is an interactive 3D space-flight and NASA-grounded astronomy learning web application built with **Three.js** and **Vite**. Users pilot the custom *Trident Galactic* biosphere spacecraft across four nested cosmic zones (**Solar System**, **Nearby Stars & Exoplanets**, **Milky Way Sector**, and **Local Group Galaxies**), inspecting NASA-derived science telemetry and answering dual-difficulty (**Explorer K–12** vs. **Astrophysicist**) Quick Check quizzes.

- **Local Repository Path**: `/Users/chuhee/Downloads/SW_Repos/GitHub/trident-galactic`
- **GitHub Remote**: `trident-galactic` repository on GitHub (`main` branch)

---

## 2. Repository Structure & Key Files
- `index.html`: 3-row non-overlapping CSS Grid HUD (`header`, `main.hud-middle`, `footer.hud-bottom`), collapsible left/right drawers, `RESET` progress button, independent **Orbital Speed** & **Rotation Speed** sliders, Pilot HUD sight overlay, Flight Plan Bar, and Cockpit Control Deck.
- `src/main.js`: WebGL2 renderer + 4x MSAA `HalfFloatType` `EffectComposer` (`UnrealBloomPass`), UI event bindings, 3D raycast + 2D screen-space assisted target picking (`handleCanvasPick`), click-to-deselect target, `localStorage` persistence (`trident_galactic_progress_v2`), reticle projection (`updateReticle`), Flight Plan telemetry, and main `animate()` loop.
- `src/flight.js`: `FlightController` class: Arcade & Manual 6-DOF rotation, forward (`F`) / reverse (`R`) throttle (`-35` to `+80`), Hyper-Boost (`220`), full stop (`Space`, `X`, `0`), fuel consumption/refuel, camera modes (`chase` / `orbit`), logarithmic zoom distance (`1.8m – 3,200m`), radial-standoff `autopilotTarget` guidance, automatic station-keeping `lockedOrbitTarget` around moving planets/moons, and planetary surface collision shielding.
- `src/ship.js`: Loads `public/models/trident-galactic.glb` via `GLTFLoader` + `DRACOLoader` (`targetLength = 2.2`), applies 16x anisotropic texture filtering, and drives the 3 rear Mach-diamond conical plasma plumes + 2 front wing leading-edge swept horizontal fan-blade retro-thrusters.
- `src/universe.js`: Builds the 4 cosmic zone `THREE.Group` hierarchies (26 total destinations), loads real 2K NASA/Solar System Scope equirectangular planetary textures & Hubble M42/M1 nebula mosaics (`public/textures/`), animated solar/supergiant photosphere shaders, multi-layer 2K photorealistic exoplanet & moon biome shaders, Earth/exoplanet/Titan 3D cloud layers, soft FrontSide Fresnel atmospheric scattering rims, 6 visitable moons (`The Moon`, `Io`, `Europa`, `Enceladus`, `Titan`, `Triton`), EHT relativistic black hole shader, 28,000-star spiral galaxies with H II knots, Keplerian orbital motion, and the animated 3D Flight Path line.
- `src/nasaData.js`: Offline-safe, structured catalog of 26 celestial destinations (20 primary bodies + 6 visitable Moon sub-destinations) across 4 zones with dual-difficulty educational content (`explorer` K–12 and `advanced` Astrophysicist), quizzes, and official NASA reference links.
- `src/audio.js`: `SpaceAudio` Web Audio API synthesizer: stereo convolution reverb, Dmaj9 ambient cosmic pad, dual detuned sub-bass reactor oscillators, pink-noise ion turbine bandpass filter, boost ignition sub-drop, and discovery chime.
- `src/style.css`: Glassmorphic sci-fi theme, 3-row CSS Grid layout, indented `.moon-subitem` styles, Pilot HUD mode rules, and Cockpit Control Deck styles.
- `public/models/trident-galactic.glb`: Repaired 3.1 MB spacecraft mesh (419,705 triangles, 4096x4096 WebP PBR textures, Draco-compressed, smoothed wingtips, cleaned winglet UV seams).
- `public/textures/`: 14 bundled 2K NASA/Solar System Scope equirectangular planetary maps and Hubble M42/M1 nebula mosaics.
- `public/favicon.svg` & `public/og-image.png`: Custom vector spacecraft favicon and `1200×630` Open Graph / Twitter Card social preview image.
- `.github/workflows/deploy.yml`: GitHub Actions workflow that builds and deploys `./dist` to GitHub Pages on push to `main`.

---

## 3. Current Keyboard & Cockpit Controls Reference

- **Accelerate Forward (Increase Throttle)**: Hold **`F`** on keyboard, or hold **`FWD (F) ▶`** button, or drag the **Throttle Slider** right (`0` to `+80`).
- **Reverse / Decelerate (Negative Throttle)**: Hold **`R`** on keyboard, or hold **`◀ REV (R)`** button, or drag the **Throttle Slider** left (`0` to `-35`).
- **Full Stop / Hover (`0.0 Mm/s`)**: Press **`Space`**, **`X`**, or **`0`**, or click **`■ STOP (SPACE)`**.
- **Standard Cruise (`24.0 Mm/s`)**: Click **`CRUISE`** button.
- **Hyper-Boost (`220 Mm/s`)**: Hold **`Shift`**, or hold **`⚡ BOOST`** button.
- **Pitch Up / Down**: **`W` / `S`** or **`↑` / `↓`**, or click/hold **`▲` / `▼`** on Steering D-Pad.
- **Turn Left / Right (or Roll in 6-DOF)**: **`A` / `D`** or **`←` / `→`** (`Q`/`E` yaw/roll), or click/hold **`◀` / `▶`** and **`↶` / `↷`** on Steering D-Pad.
- **Lock / Unlock Mouse Steering (Default: `MOUSE: LOCKED`)**: Press **`K`** or click empty 3D space, or click **`MOUSE: ON / LOCKED`** badge.
- **Select / Deselect Destination**: Click any planet, moon (`↳`), star, nebula, or galaxy in the Cosmic Atlas or 3D scene to select it; click the selected destination a second time to deselect it. Double-click in the Cosmic Atlas or 3D scene to immediately engage **`AUTO-FLY`**.
- **Reset Progress**: Click **`RESET`** in the Cosmic Atlas header to clear all `✓ Explored` badges and quiz scores.
- **Orbital & Rotation Speed Sliders**: Drag **`ORBITAL SPEED`** (`0–60 days/sec`) to adjust or pause orbital revolution (including moons), and drag **`ROTATION SPEED`** (`0.0×–2.0×`) to adjust or pause axial spin.
- **Zoom In / Zoom Out (`1.8m – 3,200m`)**: **`+` (`=`)** / **`-`** or **Mouse Scroll Wheel**, or click **`＋ ZOOM IN`** / **`－ ZOOM OUT`** or drag **Zoom Slider**.
- **Switch Flight Mode (Arcade / 6-DOF)**: Press **`M`** or click **`ARCADE` / `6-DOF`** badge.
- **Switch Camera (Chase / Orbit)**: Press **`C`** or click **`CHASE CAM` / `ORBIT CAM`** badge.
- **Toggle Pilot HUD Mode**: Press **`H`** or click **`VIEW: FULL / PILOT HUD`** button.
- **Switch Learning Difficulty**: Press **`L`** or click **`LEVEL: EXPLORER / ASTROPHYSICIST`** button.
- **Toggle Orbit Paths**: Press **`O`** or click **`ORBITS: ON / OFF`** button.
- **Toggle Space Audio**: Press **`V`** or click **`AUDIO: ON / OFF`** button.
- **Close Modal / Cancel Autopilot**: Press **`Escape`**.

---

## 4. Engineering Changelog & Completed Enhancements

All initial handover issues and live-testing enhancements have been implemented and verified:

1. **Radial-Standoff Autopilot & Station-Keeping Orbit Lock (`src/flight.js`, `src/main.js`)**:
   - Autopilot steers directly toward `autopilotTarget.worldPosition` from any 3D angle with moving-target velocity lead compensation and parks cleanly at `standoffDist` facing the target center across all 26 destinations.
   - `lockedOrbitTarget` + `lockedOrbitOffset` keeps the parked ship moving in lockstep with orbiting planets and moons (`HOLDING ORBIT`), rotating synchronously with moon orbital revolution so the parent planet stays framed in the background without occluding or colliding with the ship.
2. **6 Visitable Moon Sub-Destinations (`src/nasaData.js`, `src/universe.js`, `src/main.js`)**:
   - Separated **The Moon (Luna)** under Earth, **Io** & **Europa** under Jupiter, **Enceladus** & **Titan** under Saturn, and **Triton** under Neptune as indented `↳` sub-destinations in the Cosmic Atlas and clickable/targetable 3D worlds with full Explorer/Astrophysicist profiles and quizzes.
3. **Spacecraft Scale, Expanded Solar System Spacing & Logarithmic Zoom (`1.8m – 3,200m`)**:
   - Scaled spacecraft hull to `2.2` units (`zoomDistance = 3.8m`) and expanded Zone 1 orbital spacing (`240` to `2,840` units) so moons and planets have realistic visual separation and monumental scale relative to the ship.
4. **High-Resolution 2K NASA Textures, Photorealistic Exoplanet Biome Shaders & Soft Atmospheric Limbs (`src/universe.js`, `public/textures/`)**:
   - Bundled 14 real 2K NASA/Solar System Scope planetary maps and Hubble M42/M1 nebula mosaics.
   - Added `createPhotorealBiomeMaterial` + 2K cloud layers + companion host red-dwarf stars (`Proxima Centauri M5.5V` and `TRAPPIST-1A M8V` with sibling rocky planets) for Zone 2 exoplanets and Solar System moons, with `NaN`-safe `pow`/`normalize` guards for `HalfFloatType` + `UnrealBloomPass`.
   - Replaced the `BackSide` atmosphere ring with a soft `FrontSide` Fresnel limb shader (`smoothstep(0.0, 0.28, mu)`) so no hard neon ring appears around Earth or exoplanets.
5. **Swept Horizontal Fan-Blade Retro-Thrusters (`src/ship.js`)**:
   - Replaced the round cone on the front wing leading-edge vents with a flattened horizontal plasma ribbon/wedge fan geometry and slit glow matching the wing contour.
6. **Cockpit UX, Quiz Shuffling, Responsive Polish & Social Metadata (`src/main.js`, `src/flight.js`, `src/style.css`, `index.html`)**:
   - Defaulted to `MOUSE: LOCKED` and Stationary Orbit (`0.0 Mm/s`) at launch with `Discovered: 0 / 26`.
   - Added deterministic quiz option shuffling across slots 1–3, slider/button focus blur and modifier-key guards, `Escape` handling, responsive Chromebook/tablet/mobile breakpoints, vector `favicon.svg`, `1200×630` `og-image.png`, and Three.js vendor chunk splitting.

---

## 5. Documentation & Build Synchronization Policy
For every build or feature iteration, all three core project documents must be kept in sync before completing the build:
- **`README.md`**: Keep live URL, user-facing features, target audience modes (`Explorer K–12` & `Astrophysicist`), and key controls up to date.
- **`DESIGN.md`**: Record all architectural, branding (`favicon.svg`, `og-image.png`), 3D asset/shader pipeline, pedagogy, and responsive UX design decisions.
- **`HANDOVER.md`**: Maintain the complete file inventory, keyboard/cockpit control reference, and chronological engineering changelog.
