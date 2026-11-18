# Trident Galactic — Architecture & Product Design Document

## 1. Vision & Educational Purpose
**Trident Galactic** is an interactive 3D space-exploration and astronomy learning platform designed for both **K–12 students** and **general/advanced astronomy enthusiasts**. Learners pilot the custom *Trident Galactic* biosphere spacecraft through a 4-zone, multi-scale universe grounded in real NASA data.

---

## 2. Core Product & Design Decisions Made So Far

### 2.1 Branding, Social Metadata & Repository Setup
- **Official Name & Live URL**: **Trident Galactic** (updated from the earlier working title "Triton Galactic"), deployed at `https://blueplanet-ai.github.io/trident-galactic/`.
- **Visual Identity & Social Sharing**:
  - Custom vector spacecraft favicon (`public/favicon.svg`) depicting the swept-wing Trident hull, three glowing cyan-teal rear ion nozzles, and a tilted Keplerian orbital ring.
  - High-resolution `1200×630` Open Graph / Twitter Card hero preview image (`public/og-image.png`) captured directly from the WebGL2 engine with full `og:*` and `twitter:*` metadata in `index.html`.
- **Hosting, Build & CI/CD**: Static web application built with **Vite + Three.js**, splitting `three` into a dedicated cacheable vendor chunk (`manualChunks`) in `vite.config.js`, and hosted on **GitHub Pages** via `.github/workflows/deploy.yml` using `base: './'` for portable asset resolution.

### 2.2 3D Spacecraft Asset Pipeline (Blender MCP + glTF-Transform)
- **Source Model**: `Trident-3D.glb` (90.51 MB raw AI-generated 3D mesh, 1.5M triangles, 4K PNG textures).
- **Blender 5.2.2 LTS Repair Pipeline**:
  - Welded duplicate seam vertices (`dist = 0.00015`) to eliminate normal-map cracks.
  - Applied multi-pass Laplacian vertex smoothing with falloff to the outer wingtips (`|x| > 0.36`).
  - Re-projected `36,738` UV loops on the outer winglet tips (`|x| > 0.425`) onto clean white hull UVs to eliminate baked orange text/stripe artifacts from the original concept generation.
  - Applied clean collapse decimation (`419,705` triangles) + Weighted Normals and exported with **Draco compression + 4096x4096 WebP textures** (`public/models/trident-galactic.glb`, `3.1 MB`).
- **Coordinate System, Scale & Cosmic Spacing**:
  - Spacecraft physical hull length is scaled to `2.2` scene units (`targetLength = 2.2`) with default Chase/Orbit camera distance `3.8m` (`minZoom = 1.8m`, `maxZoom = 3,200m`) and expanded celestial spacing (`520 – 6,250` Zone 1 planetary orbits, `75 – 140` moon orbits, `1.8×` Zone 2–4 separations, ship-anchored `12,000–26,000` starfield skybox, `45,000` far plane, `22,000` sunlight range) so moons, planets, and interplanetary flight legs feel genuinely vast.
  - Raw glTF mesh has nose at `+Z (+0.6445)` and rear nozzles at `-Z (-0.4179)`.
  - `visualHolder` in `src/ship.js` rotates the centered mesh `180°` around `Y` so the ship's nose points along `-Z` (Three.js forward axis).
  - Exact Blender-measured rear nozzle centers (in raw glTF coordinates):
    - **Left Nozzle**: `(-0.1046, 0.0774, -0.4178)`, radius `0.0445`
    - **Center Nozzle**: `(0.0007, 0.0793, -0.4179)`, radius `0.0459`
    - **Right Nozzle**: `(0.1047, 0.0774, -0.4178)`, radius `0.0445`
  - Exact Blender-measured front wing leading-edge intake centers (for reverse retro-thrusters):
    - **Left Wing Intake**: `(-0.2231, 0.064, 0.0025)`
    - **Right Wing Intake**: `(0.2231, 0.068, 0.0025)`

### 2.3 Propulsion & Shader Visual Effects
- **Idle / Stationary State (`|speed| <= 0.8`)**: Rear extended jet cones are hidden; only the recessed cyan burner discs pulse gently inside the three engine bells.
- **Forward Flight (`speed > 0.8`, `F` key)**: Custom GLSL `ShaderMaterial` conical plasma plumes with animated Mach shock diamonds emerge and scale in length/radius proportionally with forward velocity and Hyper-Boost (`Shift`).
- **Reverse Flight (`speed < -0.8`, `R` key)**: Rear nozzles stay in idle glow while dual forward-facing **swept horizontal fan-blade plasma sheets** (`retroPlumeGeo.scale(2.65, 0.24, 1.0)`) and horizontal slit glows ignite from the flat front wing leading-edge vents.
- **Rendering Pipeline & HalfFloat Bloom Stability**: WebGL2 `HalfFloatType` 4x MSAA render target + `UnrealBloomPass` (`threshold: 0.9`, `strength: 0.42`, `radius: 0.45`) + `RoomEnvironment` PMREM reflections + 16x anisotropic texture filtering. All custom GLSL `ShaderMaterial`s use `NaN`-safe `pow(max(x, 1e-4), y)` and zero-safe `safeNorm()` helpers with clamped fragment outputs so 4x MSAA sample extrapolation never introduces `NaN`/`Inf` artifacts into the `HalfFloatType` bloom mipmap chain.

### 2.4 Multi-Scale 4-Zone Cosmic Architecture & NASA 2K Textures
To solve the 20-order-of-magnitude scale gap between planetary radii (`km`) and intergalactic distances (`Mly`), the universe is organized into **4 nested zones** (**26 total destinations**: 20 primary celestial bodies + 6 visitable Moon sub-destinations) switched via top header tabs, rendered with real 2K NASA/Solar System Scope equirectangular maps, multi-layer photorealistic biome shaders, and Hubble mosaics (`public/textures/`):
1. **Zone 1 — Solar System (`0 – 30 AU`, 15 destinations)**:
   - **Primary Bodies**: The Sun (animated SDO solar photosphere shader), Mercury (MESSENGER 2K map), Venus (2K cloud deck), Earth (2K Blue Marble daymap + animated 3D cloud sphere + soft FrontSide Fresnel atmosphere), Mars (Viking 2K map), Main Asteroid Belt, Jupiter (Cassini 2K map + outer Galilean moons Ganymede & Callisto), Saturn (Cassini 2K map + radial alpha rings), Uranus (97.77° axial tilt + faint epsilon ring), and Neptune (2K map).
   - **6 Visitable Moon Sub-Destinations (`↳`)**:
     - Under **Earth**: `↳ The Moon (Luna)` (NASA LRO 2K map with crater bump relief and independent axial spin).
     - Under **Jupiter**: `↳ Io` (Galilean volcanic sulfur biome shader) and `↳ Europa` (fractured ice-shell subsurface-ocean biome shader) in 4:2:1 Laplace resonance.
     - Under **Saturn**: `↳ Enceladus` (high-albedo south-polar tiger-stripe geyser moon) and `↳ Titan` (1.45-bar golden nitrogen/methane cloud globe).
     - Under **Neptune**: `↳ Triton` (retrograde 157°-inclined captured Kuiper Belt moon).
   - **Independent Time & Spin Controls**: Uses Keplerian elliptical (`a, e`), inclined (`i`), and angular-momentum-conserving orbits with separate real-time **Orbital Speed** (`0–60 days/sec`) and **Rotation Speed** (`0.0×–2.0×`) sliders plus toggleable orbit lines (`O`).
2. **Zone 2 — Nearby Stars & Exoplanets (`4 – 650 ly`, 4 destinations)**: Proxima Centauri b (photorealistic 2K multi-layer tidally locked eyeball-earth shader + cloud sphere + companion red-dwarf host star Proxima Centauri M5.5V), Sirius A & B (blue-white A1V star shader + orbiting White Dwarf companion), TRAPPIST-1 System (photorealistic 2K archipelago ocean-world shader + cloud sphere + host star TRAPPIST-1A M8V and resonant sibling rocky worlds), and Betelgeuse (animated convective red supergiant shader).
3. **Zone 3 — Milky Way Sector (`1,300 – 26,670 ly`, 3 destinations)**: Orion Nebula (M42 Hubble multi-plane volumetric mosaic), Crab Nebula & Pulsar (M1 Hubble mosaic + spinning relativistic pulsar lighthouse jets), and Sagittarius A* (supermassive black hole with EHT Doppler-beamed relativistic accretion disk shader and gravitational lensing halo).
4. **Zone 4 — Local Group Galaxies (`0.16 – 2.73 Mly`, 4 destinations)**: Milky Way Galaxy, Large Magellanic Cloud (LMC), Andromeda Galaxy (M31), and Triangulum Galaxy (M33) with H II starburst knots and volumetric nebular spiral arms.

### 2.5 Dual-Difficulty Learning Pedagogy
Every celestial object and visitable moon in `src/nasaData.js` carries two complete educational profiles toggled at any time via `L` or the `LEVEL` button:
- **Explorer Mode (K–12)**: Visual, curiosity-driven explanations, relatable scale analogies, and foundational astronomy quiz questions.
- **Astrophysicist Mode (General / Advanced)**: Quantitative orbital mechanics, spectral classifications, nuclear/relativistic physics, telescope instrumentation (JWST, Hubble, Juno, Cassini, MAVEN, EHT, Gaia, LRO, Europa Clipper), and advanced comprehension quizzes.
- **Balanced Quiz Option Permutation**: Quiz choices are deterministically shuffled per `(destination, difficulty)` using an FNV-1a hash permutation so the correct answer is evenly distributed across options 1, 2, and 3 while maintaining consistent ordering across re-renders.
- **Data Grounding & Progress Persistence**: Offline-safe verified NASA metrics, direct deep links to official NASA Science, JPL Solar System Dynamics, and NASA Exoplanet Catalog pages, live **NASA APOD** modal (supporting both daily astronomy images and video thumbnails), and `localStorage` persistence with a one-click **`RESET`** button in the Cosmic Atlas header.

### 2.6 Cockpit UI, Responsive Classroom Layout & HUD Architecture
- **Non-Overlapping 3-Row CSS Grid**: `grid-template-rows: auto 1fr auto` ensures the left **Cosmic Atlas** drawer and right **Science Scanner** drawer never overlap the top navigation bar or bottom cockpit controls. Both side drawers are collapsible (`◀` / `▶`) and use `scrollbar-gutter: stable` with thin custom scrollbars.
- **Responsive Device Support**: Built for widescreen desktops, `1366×768` K–12 classroom Chromebooks (`@media (max-height: 820px)`), `1024×768` tablets (`@media (max-width: 1120px)`), and mobile screens (`@media (max-width: 768px)`).
- **Pilot HUD Mode (`H` / `VIEW`)**: Hides the educational side drawers for an unobstructed windshield view while keeping the center **Pilot Pitch/Heading Crosshair (`+`)**, corner-bracket **Target Reticle (`[ ]`)**, single circular **Prograde/Retrograde Vector (`⊕`)**, **3D Flight Path**, **Flight Plan Bar** (Target, Remaining Distance, ETA, Fuel %), and **Cockpit Control Deck** visible.
- **Propulsion Physics, Inertial Dampers & Newtonian Coast (`Z`)**:
  - Uses a true 3D `velocity` vector (`FlightController.velocity`) and smoothed rotational inertia (`angularVel`) instead of latched discrete speeds.
  - **Progressive Precision Thrust Curve**: Holding `F` or `R` spools smoothly over `~1.35s` (`8 → 28 units/s²` forward, `7 → 20 units/s²` reverse) for fine close-range orbital maneuvering around moons and planets, while `Shift` Hyper-Boost surges up to `280`.
  - **Inertial Dampers ON (Default, `DAMPERS: ON`)**: Releasing `F`/`R` initiates a gentle ~2.5–3s inertial coast-down via RCS dampers with subtle front retro-slit glows, while lateral RCS coupling trims drift during turns.
  - **Newtonian Vacuum Coast (`Z` / `COAST (OFF)`)**: Disables artificial deceleration so the ship glides indefinitely on pure momentum (`0` fuel burn, engines off) and can rotate 360° independently of its travel direction, demonstrating Newton's First Law.
  - **Prograde / Retrograde Vector Marker (`#prograde-marker`)**: Projects the ship's true 3D velocity vector onto the windshield HUD (`PROGRADE` in green, `RETROGRADE` in amber) so pilots see actual trajectory vs. nose heading during turns and Newtonian drift.
  - **Thrust-Accurate VFX & Physics-Coupled Audio (`src/ship.js`, `src/audio.js`)**: `updateEffects()` responds to active `forwardThrust` / `retroThrust` demand—so pressing `R` while moving forward fires the front wing retro-thrusters immediately as braking jets. `SpaceAudio` drives separate main ion-drive, front retro-jet, and stereo-panned RCS attitude thruster voices (dropping to quiet ambient standby when coasting in `COAST (OFF)`), smoothly retunes ambient pad harmonics across the 4 cosmic zones, adds proximity signatures (Crab Pulsar ticks, Sagittarius A* gravitational sub-hum), plays subtle cockpit/quiz avionics SFX, suspends the `AudioContext` on mute, and provides an inline Master Volume slider. Clicking `CRUISE` or dragging the Throttle Slider engages explicit Cruise Hold until manual thrust or `Space`.
- **Dual Flight, Synchronous Moon Station-Keeping & Camera Controls**:
  - Launches positioned in front of Earth at `0.0 Mm/s` with `ORBITAL SPEED: Paused`, **`MOUSE: LOCKED`**, and **unlocked Flight Plan (`NONE`)** so pilots can fly freely from frame 1 (auto-orbit lock arms once the pilot flies or engages `AUTO-FLY`/`WARP`).
  - Supports **Arcade** (default auto-leveling bank-and-turn) and **Manual 6-DOF** (`M`) flight modes, **Chase** and **Orbit** (`C`) cameras (`1.8m – 3,200m` logarithmic zoom), radial-standoff **`AUTO-FLY`** with automatic **Station-Keeping Orbit Lock (`HOLDING ORBIT`)** around moving planets and moons (rotating synchronously with moon orbital revolution so the parent planet remains framed in the background without occluding or colliding with the ship), planetary surface collision shielding in all states, click-again target deselection, `Escape` modal/autopilot dismissal, focus-safe slider/button keyboard controls, and 3D raycast + 2D screen-space assisted target picking.
