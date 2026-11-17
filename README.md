# Trident Galactic

An interactive 3D space-flight and astronomy learning experience built with Three.js and Vite. Pilot the custom *Trident Galactic* biosphere spacecraft across four cosmic scales grounded in NASA data.

**Live Application**: [https://blueplanet-ai.github.io/trident-galactic/](https://blueplanet-ai.github.io/trident-galactic/)

## Features

- **4 Cosmic Zones (26 Visitable Destinations including 6 Moons)**:
  1. **Solar System (0 - 30 AU)**: The Sun, all 8 planets, and 6 visitable Moon sub-destinations (`↳ The Moon (Luna)`, `↳ Io`, `↳ Europa`, `↳ Enceladus`, `↳ Titan`, `↳ Triton`) with real 2K NASA textures, Keplerian elliptical and inclined orbits, synchronous moon station-keeping, toggleable orbit paths (`O`), and independent **Orbital Speed** (`0-60 days/sec`) and **Rotation Speed** (`0.0×-2.0×`) sliders.
  2. **Nearby Stars & Exoplanets (4 - 650 ly)**: *Proxima Centauri b*, *Sirius A & B*, *TRAPPIST-1 (1e)*, and *Betelgeuse* with photorealistic 2K multi-layer biome shaders, cloud spheres, and host red-dwarf systems.
  3. **Milky Way Sector (1,300 - 26,670 ly)**: *Orion Nebula (M42)*, *Crab Nebula & Pulsar (M1)*, and *Sagittarius A**.
  4. **Local Group Galaxies (0.16 - 2.73 Mly)**: *Milky Way*, *Large Magellanic Cloud*, *Andromeda (M31)*, and *Triangulum (M33)*.
- **Dual Learning Difficulty Modes (`L`)**: Switch between **Explorer (K-12)** and **Astrophysicist**, each with telemetry, science cards, and an interactive Quick Check quiz with balanced, deterministically shuffled answer choices and persistent progress (`RESET` button to clear).
- **Dual Flight & Camera Modes**: Fly with **Arcade** (default) or **Manual 6-DOF** (`M`) controls, forward (`F`) and reverse (`R`) thrust, switch between **Chase** and **Orbit** (`C`) cameras (`1.8m - 3,200m` logarithmic zoom), engage **Hyper-Boost** (`Shift`), park in **Stationary Orbit / Hover** (`Space`, `X`, or `0`), or press `Escape` to close modals / cancel autopilot.
- **Procedural Space Audio (`V`) & NASA APOD Briefing**: Multi-layered Web Audio synthesizer and live [NASA APOD](https://science.nasa.gov/apod/) briefing modal supporting both daily astronomy images and video thumbnails.
- **Responsive Classroom & Desktop Design**: Adapts across widescreen desktops, `1366×768` K–12 Chromebooks, `1024×768` tablets, and mobile viewports, complete with custom vector favicon (`favicon.svg`) and social media Open Graph preview card (`og-image.png`).

## Local Development

Run `npm install` and `npm run dev` in the project directory, or double-click `launch.command` on macOS to start the preview server.

## GitHub Pages Deployment

The workflow in `.github/workflows/deploy.yml` builds and deploys `dist/` on every push to `main`. In your GitHub repository, set **Settings -> Pages -> Source** to **GitHub Actions**.

## Astronomical Data Sources

- [NASA Science](https://science.nasa.gov/)
- [NASA JPL Solar System Dynamics](https://ssd.jpl.nasa.gov/)
- [NASA Exoplanet Catalog](https://science.nasa.gov/exoplanets/)
- [NASA Open APIs & APOD](https://api.nasa.gov/)

## License

Licensed under the [MIT License](LICENSE).
