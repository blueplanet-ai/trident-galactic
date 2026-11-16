# Trident Galactic — Architecture & Product Design Document

## 1. Vision & Educational Purpose
**Trident Galactic** is an interactive 3D space-exploration and astronomy learning platform designed for both **K–12 students** and **general/advanced astronomy enthusiasts**. Learners pilot the custom *Trident Galactic* biosphere spacecraft through a 4-zone, multi-scale universe grounded in real NASA data.

---

## 2. Core Product & Design Decisions Made So Far

### 2.1 Branding & Repository Setup
- **Official Name**: **Trident Galactic** (updated from the earlier working title "Triton Galactic").
- **Hosting & CI/CD**: Static web application built with **Vite + Three.js**, hosted on **GitHub Pages** via `.github/workflows/deploy.yml` using `base: './'` for portable asset resolution.

### 2.2 3D Spacecraft Asset Pipeline (Blender MCP + glTF-Transform)
- **Source Model**: `Trident-3D.glb` (90.51 MB raw AI-generated 3D mesh, 1.5M triangles, 4K PNG textures).
- **Blender 5.2.2 LTS Repair Pipeline**:
  - Welded duplicate seam vertices (`dist = 0.00015`) to eliminate normal-map cracks.
  - Applied multi-pass Laplacian vertex smoothing with falloff to the outer wingtips (`|x| > 0.36`).
  - Re-projected `36,738` UV loops on the outer winglet tips (`|x| > 0.425`) onto clean white hull UVs to eliminate baked orange text/stripe artifacts from the original concept generation.
  - Applied clean collapse decimation (`419,705` triangles) + Weighted Normals and exported with **Draco compression + 4096x4096 WebP textures** (`public/models/trident-galactic.glb`, `3.1 MB`).
- **Coordinate System & Nozzle Sockets**:
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
- **Forward Flight (`speed > 0.8`)**: Custom GLSL `ShaderMaterial` plasma plumes with animated Mach shock diamonds emerge and scale in length/radius proportionally with forward velocity and Hyper-Boost.
- **Reverse Flight (`speed < -0.8`)**: Rear nozzles stay in idle glow while dual forward-facing retro-thruster plumes ignite from the front wing leading-edge vents.
- **Rendering Pipeline**: WebGL2 `HalfFloatType` 4x MSAA render target + `UnrealBloomPass` (`threshold: 0.9`, `strength: 0.42`, `radius: 0.45`) + `RoomEnvironment` PMREM reflections + 16x anisotropic texture filtering.

### 2.4 Multi-Scale 4-Zone Cosmic Architecture & NASA 2K Textures
To solve the 20-order-of-magnitude scale gap between planetary radii (`km`) and intergalactic distances (`Mly`), the universe is organized into **4 nested zones** (20 total destinations) switched via top header tabs, rendered with real 2K NASA/Solar System Scope equirectangular maps and Hubble mosaics (`public/textures/`):
1. **Zone 1 — Solar System (`0 – 30 AU`)**: The Sun (animated SDO solar photosphere shader), Mercury (MESSENGER 2K map), Venus (2K cloud deck), Earth & Moon (2K Blue Marble daymap + animated 3D cloud sphere + LRO 2K Moon), Mars (Viking 2K map), Main Asteroid Belt, Jupiter (Cassini 2K map + 4 Galilean moons in 4:2:1 Laplace resonance), Saturn (Cassini 2K map + radial alpha rings + Enceladus & Titan), Uranus (97.77° axial tilt + faint epsilon ring), and Neptune & Triton (retrograde 157°-inclined Triton orbit). Uses Keplerian elliptical (`a, e`), inclined (`i`), and angular-momentum-conserving orbits with a real-time orbital speed slider (`0–60 days/sec`) and toggleable orbit lines (`O`).
2. **Zone 2 — Nearby Stars & Exoplanets (`4 – 650 ly`)**: Proxima Centauri b (tidally locked eyeball exoplanet), Sirius A & B (binary with White Dwarf companion), TRAPPIST-1 System (7 rocky worlds), and Betelgeuse (animated convective red supergiant shader).
3. **Zone 3 — Milky Way Sector (`1,300 – 26,670 ly`)**: Orion Nebula (M42 Hubble multi-plane volumetric mosaic), Crab Nebula & Pulsar (M1 Hubble mosaic + spinning relativistic pulsar lighthouse jets), and Sagittarius A* (supermassive black hole with EHT Doppler-beamed relativistic accretion disk shader and gravitational lensing halo).
4. **Zone 4 — Local Group Galaxies (`0.16 – 2.73 Mly`)**: Milky Way Galaxy, Large Magellanic Cloud (LMC), Andromeda Galaxy (M31), and Triangulum Galaxy (M33) with H II starburst knots and volumetric nebular spiral arms.

### 2.5 Dual-Difficulty Learning Pedagogy
Every celestial object in `src/nasaData.js` carries two complete educational profiles toggled at any time via `L` or the `LEVEL` button:
- **Explorer Mode (K–12)**: Visual, curiosity-driven explanations, relatable scale analogies, and foundational astronomy quiz questions.
- **Astrophysicist Mode (General / Advanced)**: Quantitative orbital mechanics, spectral classifications, nuclear/relativistic physics, telescope instrumentation (JWST, Hubble, Juno, Cassini, MAVEN, EHT, Gaia), and advanced comprehension quizzes.
- **Data Grounding**: Offline-safe verified NASA metrics and direct deep links to official NASA Science, JPL Solar System Dynamics, and NASA Exoplanet Catalog pages, plus an optional live **NASA APOD** modal.

### 2.6 Cockpit UI & HUD Architecture
- **Non-Overlapping 3-Row CSS Grid**: `grid-template-rows: auto 1fr auto` ensures the left **Cosmic Atlas** drawer and right **Science Scanner** drawer never overlap the top navigation bar or bottom cockpit controls. Both side drawers are collapsible (`◀` / `▶`).
- **Pilot HUD Mode (`H` / `VIEW`)**: Hides the educational side drawers for an unobstructed windshield view while keeping the center **Pilot Pitch/Heading Sight**, **3D Flight Path**, **Flight Plan Bar** (Target, Remaining Distance, ETA, Fuel %), and **Cockpit Control Deck** visible.
- **Dual Flight & Camera Controls**: Supports both **Arcade** (default auto-leveling bank-and-turn) and **Manual 6-DOF** (`M`) flight modes, **Chase** and **Orbit** (`C`) cameras, click-to-select 3D raycasting, and click-to-lock mouse steering (`K`).
