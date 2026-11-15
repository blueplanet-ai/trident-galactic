# Trident Galactic

An interactive 3D space-flight and astronomy learning experience built with Three.js and Vite. Pilot the custom *Trident Galactic* biosphere spacecraft across four cosmic scales grounded in NASA data.

## Features

- **4 Cosmic Zones**:
  1. **Solar System (0 - 30 AU)**: The Sun and all 8 planets with Keplerian elliptical and inclined orbits, toggleable orbit paths (`O`), and an orbital time-lapse slider (`0-60 days/sec`).
  2. **Nearby Stars & Exoplanets (4 - 650 ly)**: *Proxima Centauri b*, *Sirius A & B*, *TRAPPIST-1 (1e)*, and *Betelgeuse*.
  3. **Milky Way Sector (1,300 - 26,670 ly)**: *Orion Nebula (M42)*, *Crab Nebula & Pulsar (M1)*, and *Sagittarius A**.
  4. **Local Group Galaxies (0.16 - 2.73 Mly)**: *Milky Way*, *Large Magellanic Cloud*, *Andromeda (M31)*, and *Triangulum (M33)*.
- **Dual Learning Difficulty Modes (`L`)**: Switch between **Explorer (K-12)** and **Astrophysicist**, each with telemetry, science cards, and an interactive Quick Check quiz.
- **Dual Flight & Camera Modes**: Fly with **Arcade** (default) or **Manual 6-DOF** (`M`) controls, switch between **Chase** and **Orbit** (`C`) cameras, engage **Hyper-Boost** (`Shift`), brake (`Space`), or park in **Stationary Hover** (`X`).
- **Procedural Space Audio (`V`) & NASA APOD Briefing**: Multi-layered Web Audio synthesizer and live [NASA APOD](https://science.nasa.gov/apod/) briefing modal.

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
