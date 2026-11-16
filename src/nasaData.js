export const ZONES = [
  {
    id: 'solar',
    name: 'Solar System',
    unit: 'AU',
    badge: 'ZONE 1 • HELIOSPHERE (0 – 30 AU • VISUAL SCALE)',
    description: 'Our home star system governed by Keplerian orbital mechanics (NASA JPL Ephemerides).'
  },
  {
    id: 'stellar',
    name: 'Nearby Stars & Exoplanets',
    unit: 'ly',
    badge: 'ZONE 2 • SOLAR NEIGHBORHOOD (4 – 650 ly)',
    description: 'Our local stellar neighborhood including confirmed rocky worlds from the NASA Exoplanet Archive.'
  },
  {
    id: 'milkyway',
    name: 'Milky Way Sector',
    unit: 'ly',
    badge: 'ZONE 3 • ORION ARM TO GALACTIC CORE (1,300 – 26,670 ly)',
    description: 'Stellar nurseries, supernova remnants, and the supermassive black hole at the center of our galaxy.'
  },
  {
    id: 'intergalactic',
    name: 'Local Group Galaxies',
    unit: 'Mly',
    badge: 'ZONE 4 • INTERGALACTIC SPACE (0.16 – 2.73 Mly)',
    description: 'The Local Group of galaxies bound together across millions of light-years.'
  }
];

export const ASTRONOMY_CATALOG = [
  // ================= ZONE 1: SOLAR SYSTEM =================
  {
    id: 'sun',
    zone: 'solar',
    name: 'The Sun (Sol)',
    category: 'G2V Main-Sequence Star',
    radius: 52,
    orbitRadius: 0,
    orbitPeriodDays: 0,
    inclinationDeg: 0,
    eccentricity: 0,
    rotationSpeed: 0.015,
    visualType: 'star',
    palette: ['#fff7d6', '#fbbf24', '#f59e0b'],
    coronaColor: 'rgba(255, 190, 75, 0.58)',
    nasaUrl: 'https://science.nasa.gov/sun/',
    nasaSourceLabel: 'NASA Science — The Sun',
    metrics: {
      distanceLabel: '0.00 AU (149.6M km from Earth)',
      radiusKm: '696,340 km (109 × Earth)',
      gravity: '274.0 m/s² (27.9 g)',
      temp: '5,772 K surface • 15,000,000 K core',
      period: '25.05 days (equatorial rotation)'
    },
    explorer: {
      headline: 'A giant glowing sphere of hydrogen and helium that holds 99.86% of all mass in the Solar System!',
      bullets: [
        'Every second, the Sun fuses about 600 million tons of hydrogen into helium in its core.',
        'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
        'More than 1.3 million Earths could fit inside the Sun.'
      ],
      quiz: {
        question: 'How long does sunlight take to travel from the Sun to Earth?',
        options: ['About 8 minutes 20 seconds', 'Instantly (0 seconds)', 'About 24 hours'],
        answerIndex: 0,
        explanation: 'At 299,792 km/s, photons cross the 149.6 million km (1 AU) gap in ~499 seconds (8 min 19 sec).'
      }
    },
    advanced: {
      headline: 'G2V yellow dwarf powered by proton–proton (p–p) chain nuclear fusion in hydrostatic equilibrium.',
      bullets: [
        'Spectral Type: G2V • Absolute Magnitude: +4.83 • Luminosity: 3.828 × 10²⁶ W.',
        'Core density reaches ~162.2 g/cm³ at T ≈ 1.57 × 10⁷ K, sustaining p–p chain fusion (0.7% mass-energy conversion).',
        'Differential rotation twists magnetic flux tubes through the tachocline, driving the 11-year solar Schwabe cycle.'
      ],
      quiz: {
        question: 'Which nuclear fusion pathway dominates energy production in the Sun’s core?',
        options: ['Proton–proton (p–p) chain', 'CNO (Carbon–Nitrogen–Oxygen) cycle', 'Triple-alpha helium process'],
        answerIndex: 0,
        explanation: 'At the Sun’s core temperature (~15.7 MK), the proton–proton chain produces ~99% of solar fusion power; the CNO cycle dominates only in stars above ~1.3 solar masses.'
      }
    }
  },
  {
    id: 'mercury',
    zone: 'solar',
    name: 'Mercury',
    category: 'Terrestrial Planet',
    radius: 6.5,
    orbitRadius: 240,
    orbitPeriodDays: 87.97,
    inclinationDeg: 7.0,
    eccentricity: 0.2056,
    initialAngle: 0.8,
    rotationSpeed: 0.008,
    visualType: 'rocky',
    palette: ['#9ca3af', '#6b7280', '#4b5563', '#374151'],
    cratered: true,
    nasaUrl: 'https://science.nasa.gov/mercury/',
    nasaSourceLabel: 'NASA Science — Mercury',
    metrics: {
      distanceLabel: '0.39 AU from Sun (3.2 light-min)',
      radiusKm: '2,439.7 km (0.38 × Earth)',
      gravity: '3.70 m/s² (0.38 g)',
      temp: '100 K night to 700 K day (-173°C to 427°C)',
      period: '87.97 Earth days'
    },
    explorer: {
      headline: 'The smallest and fastest planet in our Solar System—zipping around the Sun in just 88 days!',
      bullets: [
        'Even though Mercury is closest to the Sun, its night side drops to -180°C because it has almost no atmosphere to trap heat.',
        'Inside permanently shadowed craters at its poles, NASA’s MESSENGER spacecraft discovered water ice!',
        'Mercury has a giant metallic core that makes up 85% of the planet’s radius.'
      ],
      quiz: {
        question: 'Why does Mercury freeze at night even though it is closest to the Sun?',
        options: ['It has almost no atmosphere to hold heat', 'It is covered in oceans', 'The Sun turns off at night'],
        answerIndex: 0,
        explanation: 'Without a thick atmosphere, heat radiates straight back into space as soon as the surface rotates into darkness.'
      }
    },
    advanced: {
      headline: 'High-density iron-core silicate world locked in a 3:2 spin–orbit resonance with the highest eccentricity (e = 0.2056) of any major planet.',
      bullets: [
        'Semi-major axis a = 0.3871 AU • Orbital inclination i = 7.005° • Sidereal rotation = 58.646 days (exact 3:2 resonance).',
        'Unusually high bulk density (5.427 g/cm³) indicates an iron–nickel core occupying ~85% of the planetary radius, including a liquid outer dynamo layer.',
        'Relativistic perihelion precession of 43 arcseconds/century provided a classic experimental confirmation of Einstein’s General Relativity.'
      ],
      quiz: {
        question: 'What is Mercury’s spin–orbit resonance ratio (rotations per orbital revolution)?',
        options: ['3 : 2', '1 : 1 synchronous', '2 : 1'],
        answerIndex: 0,
        explanation: 'Mercury completes exactly 3 sidereal rotations (58.65 d each) for every 2 orbital revolutions (87.97 d each), so a solar day lasts 176 Earth days.'
      }
    }
  },
  {
    id: 'venus',
    zone: 'solar',
    name: 'Venus',
    category: 'Terrestrial Planet',
    radius: 11,
    orbitRadius: 420,
    orbitPeriodDays: 224.7,
    inclinationDeg: 3.39,
    eccentricity: 0.0067,
    initialAngle: 2.1,
    rotationSpeed: -0.004,
    visualType: 'venus',
    palette: ['#fde68a', '#f59e0b', '#d97706', '#b45309'],
    atmosphereColor: '#fcd34d',
    nasaUrl: 'https://science.nasa.gov/venus/',
    nasaSourceLabel: 'NASA Science — Venus',
    metrics: {
      distanceLabel: '0.72 AU from Sun (6.0 light-min)',
      radiusKm: '6,051.8 km (0.95 × Earth)',
      gravity: '8.87 m/s² (0.90 g)',
      temp: '737 K (464°C — hottest planet)',
      period: '224.70 Earth days'
    },
    explorer: {
      headline: 'Earth’s twin in size, wrapped in thick golden clouds that trap heat in a runaway greenhouse effect!',
      bullets: [
        'Venus is hotter than Mercury—hot enough to melt lead—because its thick carbon dioxide atmosphere traps solar heat.',
        'Venus spins backward (retrograde), so the Sun rises in the west and sets in the east.',
        'One slow rotation on Venus takes 243 Earth days—longer than its 225-day year!'
      ],
      quiz: {
        question: 'Which planet has the hottest surface in our Solar System?',
        options: ['Venus', 'Mercury', 'Mars'],
        answerIndex: 0,
        explanation: 'Venus’s dense 92-bar CO₂ atmosphere creates a runaway greenhouse effect, keeping the surface at ~464°C day and night.'
      }
    },
    advanced: {
      headline: 'Super-pressurized CO₂ greenhouse world (92 bar, 96.5% CO₂) with retrograde axial rotation (obliquity 177.36°) and super-rotating H₂SO₄ cloud decks.',
      bullets: [
        'Semi-major axis a = 0.7233 AU • Eccentricity e = 0.0068 (lowest of all planets) • Sidereal rotation = -243.02 days.',
        'Upper sulfuric acid clouds (50–70 km altitude) yield a Bond albedo of 0.77 and super-rotate around the planet in ~4 Earth days despite slow surface rotation.',
        'Radar mapping by NASA’s Magellan mission revealed coronae, pancake domes, and global basaltic resurfacing with minimal plate tectonics.'
      ],
      quiz: {
        question: 'What is the approximate surface atmospheric pressure on Venus compared to Earth?',
        options: ['~92 bar (equivalent to 900 m underwater on Earth)', '~1 bar (same as Earth)', '~0.01 bar (thin like Mars)'],
        answerIndex: 0,
        explanation: 'Venus’s atmosphere exerts ~9.2 MPa (92 bar) at the surface, composed of 96.5% CO₂ and 3.5% N₂ in a supercritical fluid state near the surface.'
      }
    }
  },
  {
    id: 'earth',
    zone: 'solar',
    name: 'Earth',
    category: 'Ocean Biosphere World',
    radius: 14,
    orbitRadius: 640,
    orbitPeriodDays: 365.25,
    inclinationDeg: 0.0,
    eccentricity: 0.0167,
    initialAngle: 3.6,
    rotationSpeed: 0.05,
    visualType: 'earth',
    palette: ['#0284c7', '#1d4ed8', '#0ea5e9', '#1e3a8a'],
    atmosphereColor: '#38bdf8',
    nasaUrl: 'https://science.nasa.gov/earth/',
    nasaSourceLabel: 'NASA Science — Earth',
    metrics: {
      distanceLabel: '1.00 AU from Sun (8.3 light-min)',
      radiusKm: '6,371.0 km (1.00 × Earth)',
      gravity: '9.807 m/s² (1.00 g)',
      temp: '288 K mean (15°C)',
      period: '365.256 days'
    },
    explorer: {
      headline: 'Our home world—the only known planet with liquid surface oceans, plate tectonics, and life!',
      bullets: [
        'Liquid water covers 71% of Earth’s surface, while our nitrogen–oxygen atmosphere and magnetic field shield life from solar radiation.',
        'Earth’s axial tilt of 23.4° is what gives us spring, summer, autumn, and winter.',
        'Our Moon is 1/4 the width of Earth and stabilizes our planet’s tilt and ocean tides.'
      ],
      quiz: {
        question: 'What causes the four seasons on Earth?',
        options: ['Earth’s 23.4° axial tilt as it orbits the Sun', 'Earth moving much closer to the Sun in summer', 'The Moon blocking sunlight'],
        answerIndex: 0,
        explanation: 'Earth’s 23.44° obliquity changes the angle and duration of sunlight hitting each hemisphere throughout the year.'
      }
    },
    advanced: {
      headline: 'Silicate ocean world at 1.000 AU inside the circumstellar habitable zone, featuring active carbonate–silicate geochemical cycling and a dipolar magnetosphere.',
      bullets: [
        'Semi-major axis a = 1.00000102 AU (149,597,870.7 km, exact IAU definition) • Obliquity = 23.439° • Escape velocity = 11.186 km/s.',
        'Outer liquid iron–nickel core convects via Coriolis forces to generate a 25–65 μT geomagnetic field, deflecting the solar wind at ~10 Earth radii.',
        'The Earth–Moon system (mass ratio 81.3:1) formed via a Mars-sized protoplanetary impact (Theia) ~4.5 Ga ago and exhibits tidal angular momentum transfer.'
      ],
      quiz: {
        question: 'By exact IAU definition, 1 Astronomical Unit (AU) equals:',
        options: ['149,597,870.7 km', '100,000,000.0 km', '299,792,458.0 km'],
        answerIndex: 0,
        explanation: 'Since the 2012 IAU resolution, 1 AU is defined as an exact fixed constant of 149,597,870,700 meters.'
      }
    }
  },
  {
    id: 'moon',
    parentId: 'earth',
    zone: 'solar',
    name: 'The Moon (Luna)',
    category: 'Natural Satellite of Earth',
    radius: 4.5,
    moonOrbitDist: 44,
    moonOrbitSpeed: 0.35,
    moonPhase: 0.8,
    moonInclinationDeg: 5.14,
    rotationSpeed: 0.04,
    visualType: 'moon',
    palette: ['#cbd5e1', '#94a3b8', '#64748b'],
    nasaUrl: 'https://science.nasa.gov/moon/',
    nasaSourceLabel: 'NASA Science — Earth’s Moon & Artemis',
    metrics: {
      distanceLabel: '384,400 km from Earth (1.28 light-sec)',
      radiusKm: '1,737.4 km (0.273 × Earth)',
      gravity: '1.62 m/s² (0.165 g — 1/6 Earth)',
      temp: '95 K night to 390 K day (-178°C to 117°C)',
      period: '27.32 days (1:1 synchronous rotation)'
    },
    explorer: {
      headline: 'Earth’s constant rocky companion—the only other world humans have walked on, mapped in 3D by NASA’s Lunar Reconnaissance Orbiter!',
      bullets: [
        'The Moon is in "synchronous rotation" (tidally locked): it spins on its axis once every 27.3 days—the exact same time it takes to orbit Earth!',
        'Dark flat plains called "maria" (Latin for seas) are actually ancient basins filled with hardened volcanic basalt lava.',
        'NASA’s Artemis program is returning astronauts to the lunar South Pole, where water ice hides in permanently shadowed craters!'
      ],
      quiz: {
        question: 'Why do we always see the same "near side" face of the Moon from Earth?',
        options: ['The Moon rotates on its axis in the exact same time (27.3 days) it takes to orbit Earth', 'The Moon never rotates on its axis at all', 'Earth’s clouds block the other side'],
        answerIndex: 0,
        explanation: 'Because of tidal locking (1:1 synchronous rotation), the Moon completes one full axial spin per orbital revolution around Earth.'
      }
    },
    advanced: {
      headline: 'Differentiated anorthositic-crust satellite (R = 1,737.4 km) formed via the Giant Impact (Theia) hypothesis, exhibiting 1:1 spin–orbit tidal lock and secular tidal recession.',
      bullets: [
        'Mean semi-major axis a = 384,399 km • Orbital inclination to ecliptic i = 5.145° • Recedes from Earth at 3.83 cm/yr due to tidal torque dissipation (LLR measurements).',
        'Near-side KREEP-enriched Procellarum basin hosts extensive mare flood basalts (3.1–3.9 Ga), whereas the thicker far-side feldspathic highlands contain the 2,500-km South Pole–Aitken impact basin.',
        'LRO Diviner and LCROSS confirmed cold-trapped volatile water ice (~5.6 wt%) within permanently shadowed regions (PSRs) at <40 K near the lunar poles.'
      ],
      quiz: {
        question: 'At what rate is the Moon receding from Earth due to tidal angular momentum transfer, as measured by Apollo Lunar Laser Ranging?',
        options: ['~3.8 cm per year', '~10 meters per year', '0 cm per year (fixed orbit)'],
        answerIndex: 0,
        explanation: 'Earth’s faster rotation drags its tidal bulge ahead of the Moon, transferring angular momentum that expands the lunar orbit by 38.3 mm/yr while slowing Earth’s day.'
      }
    }
  },
  {
    id: 'mars',
    zone: 'solar',
    name: 'Mars',
    category: 'Terrestrial Planet',
    radius: 8.5,
    orbitRadius: 880,
    orbitPeriodDays: 686.98,
    inclinationDeg: 1.85,
    eccentricity: 0.0934,
    initialAngle: 5.1,
    rotationSpeed: 0.048,
    visualType: 'mars',
    palette: ['#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
    atmosphereColor: '#fb923c',
    nasaUrl: 'https://science.nasa.gov/mars/',
    nasaSourceLabel: 'NASA Science — Mars Exploration',
    metrics: {
      distanceLabel: '1.52 AU from Sun (12.7 light-min)',
      radiusKm: '3,389.5 km (0.53 × Earth)',
      gravity: '3.721 m/s² (0.38 g)',
      temp: '210 K mean (-63°C)',
      period: '686.98 Earth days (1.88 yrs)'
    },
    explorer: {
      headline: 'The Red Planet—home to the largest volcano and deepest canyon in the Solar System, explored by NASA rovers!',
      bullets: [
        'Iron oxide (rust) dust in the soil gives Mars its signature red-orange color.',
        'Olympus Mons on Mars is a shield volcano three times taller than Mount Everest!',
        'NASA’s Perseverance and Curiosity rovers are exploring ancient lakebeds that once held liquid water billions of years ago.'
      ],
      quiz: {
        question: 'Why does Mars look red from space?',
        options: ['Iron oxide (rust) in its rocks and dust', 'Active lava rivers covering the planet', 'Red clouds of neon gas'],
        answerIndex: 0,
        explanation: 'Oxidized iron minerals (hematite and ferric oxides) in the Martian regolith scatter reddish light.'
      }
    },
    advanced: {
      headline: 'Cold desert world (a = 1.5237 AU, e = 0.0934) with a 6.36 mbar CO₂ atmosphere, crustal dichotomy, and Noachian fluvial mineralogy.',
      bullets: [
        'Solar day (sol) = 24h 39m 35.244s • Axial obliquity = 25.19° (experiences chaotic long-term obliquity swings up to 60° due to lack of a large stabilizing moon).',
        'Loss of global core dynamo ~4.0 Ga allowed solar wind sputtering and photochemical escape to strip its early thicker atmosphere (measured by NASA MAVEN).',
        'Jezero Crater delta phyllosilicates and sulfates sampled by Perseverance preserve habitable lacustrine environments from >3.5 Ga.'
      ],
      quiz: {
        question: 'Which NASA orbiter mission specifically measured how the solar wind stripped Mars’s early atmosphere?',
        options: ['MAVEN (Mars Atmosphere and Volatile EvolutioN)', 'Magellan', 'Cassini'],
        answerIndex: 0,
        explanation: 'NASA’s MAVEN spacecraft (arrived 2014) directly measured ion escape rates and isotope enrichment (such as Argon-38/36) in the upper Martian atmosphere.'
      }
    }
  },
  {
    id: 'jupiter',
    zone: 'solar',
    name: 'Jupiter',
    category: 'Gas Giant Planet',
    radius: 28,
    orbitRadius: 1400,
    orbitPeriodDays: 4332.59,
    inclinationDeg: 1.30,
    eccentricity: 0.0489,
    initialAngle: 1.4,
    rotationSpeed: 0.11,
    visualType: 'banded',
    palette: ['#fef3c7', '#d97706', '#b45309', '#92400e', '#f59e0b'],
    hasMoons: 4,
    nasaUrl: 'https://science.nasa.gov/jupiter/',
    nasaSourceLabel: 'NASA Science — Jupiter & Juno',
    metrics: {
      distanceLabel: '5.20 AU from Sun (43.2 light-min)',
      radiusKm: '69,911 km (11.0 × Earth)',
      gravity: '24.79 m/s² (2.53 g)',
      temp: '165 K (-108°C at 1 bar)',
      period: '11.86 Earth years'
    },
    explorer: {
      headline: 'The king of planets—twice as massive as all other planets combined, with a storm bigger than Earth!',
      bullets: [
        'Jupiter spins faster than any other planet: a full day on Jupiter lasts just under 10 hours!',
        'The Great Red Spot is a giant anticyclonic storm that has been raging for over 300 years.',
        'Its icy moon Europa hides a global saltwater ocean beneath its crust with twice as much water as Earth.'
      ],
      quiz: {
        question: 'What is Jupiter’s famous Great Red Spot?',
        options: ['A giant spinning storm larger than Earth', 'A solid mountain of red rock', 'A crater from a recent asteroid'],
        answerIndex: 0,
        explanation: 'The Great Red Spot is a high-pressure anticyclonic vortex in Jupiter’s southern hemisphere with winds exceeding 430 km/h.'
      }
    },
    advanced: {
      headline: '317.8-Earth-mass H₂/He gas giant with a liquid metallic hydrogen dynamo, 20,000× Earth’s magnetic moment, and Laplace-resonant Galilean moons.',
      bullets: [
        'Semi-major axis a = 5.2038 AU • Sidereal rotation = 9h 55m 29.7s (causing an oblateness flattening f = 0.06487).',
        'NASA Juno gravity harmonics revealed a "dilute/fuzzy" heavy-element core extending out to nearly 50% of Jupiter’s radius.',
        'Io, Europa, and Ganymede orbit in a 4:2:1 Laplace mean-motion resonance, driving intense tidal heating in Io’s mantle and Europa’s subsurface ocean.'
      ],
      quiz: {
        question: 'What orbital mean-motion resonance locks Jupiter’s inner moons Io, Europa, and Ganymede?',
        options: ['4 : 2 : 1 Laplace resonance', '3 : 2 spin–orbit resonance', '1 : 1 Trojan co-orbital resonance'],
        answerIndex: 0,
        explanation: 'For every 1 orbit of Ganymede, Europa completes 2 and Io completes 4, maintaining forced orbital eccentricities and tidal flexing.'
      }
    }
  },
  {
    id: 'io',
    parentId: 'jupiter',
    zone: 'solar',
    name: 'Io',
    category: 'Galilean Volcanic Moon',
    radius: 3.8,
    moonOrbitDist: 44,
    moonOrbitSpeed: 0.9,
    moonPhase: 0.4,
    moonInclinationDeg: 0.05,
    rotationSpeed: 0.045,
    visualType: 'io',
    palette: ['#fef08a', '#facc15', '#ea580c', '#7c2d12'],
    nasaUrl: 'https://science.nasa.gov/jupiter/jupiter-moons/io/',
    nasaSourceLabel: 'NASA Science — Io (Volcanic Moon)',
    metrics: {
      distanceLabel: '421,700 km from Jupiter (5.20 AU)',
      radiusKm: '1,821.6 km (1.05 × Moon)',
      gravity: '1.796 m/s² (0.183 g)',
      temp: '110 K surface • >1,600 K lava lakes',
      period: '1.769 Earth days (4:2:1 Laplace resonance)'
    },
    explorer: {
      headline: 'The most volcanically active world in the Solar System—covered in over 400 erupting sulfur volcanoes and glowing lava lakes!',
      bullets: [
        'Jupiter’s immense gravity and neighboring moons Europa and Ganymede stretch and squeeze Io like a rubber ball, melting its interior!',
        'Volcanic plumes on Io shoot umbrella-shaped fountains of sulfur gas 500 kilometers (300 miles) into space.',
        'Yellow, orange, red, and black sulfur frost gives Io its famous "pizza moon" appearance.'
      ],
      quiz: {
        question: 'What powers the 400+ hyper-active volcanoes on Jupiter’s moon Io?',
        options: ['Tidal heating from Jupiter’s gravity and the 4:2:1 orbital tug of Europa & Ganymede', 'Heat from being close to the Sun', 'Coal burning on the surface'],
        answerIndex: 0,
        explanation: 'Forced orbital eccentricity from the 4:2:1 Laplace resonance causes continuous gravitational flexing (tidal dissipation) inside Io’s silicate mantle.'
      }
    },
    advanced: {
      headline: 'Silicate-iron Galilean satellite generating ~10¹⁴ W of global tidal heat flux (~2.5 W/m²) driven by forced eccentricity (e = 0.0041) in the Laplace resonance.',
      bullets: [
        'Semi-major axis a = 421,700 km (5.9 R_J) • Bulk density ρ = 3.528 g/cm³ (highest of any outer-planet moon, completely desiccated of water ice).',
        'Erupts ultramafic/komatiitic silicate lavas (>1,600 K at Loki Patera and Pele) and feeds a 2-ton/sec ionized SO₂ plasma torus inside Jupiter’s magnetosphere.',
        'Drives a 3-million-ampere Alfvénic flux tube current connecting Io directly to ultraviolet auroral footprints in Jupiter’s polar ionosphere.'
      ],
      quiz: {
        question: 'How does Io’s volcanic activity directly interact with Jupiter’s giant magnetosphere?',
        options: ['It supplies an ionized SO₂ plasma torus and drives a 3-MA Alfvénic auroral current tube', 'It blocks Jupiter’s magnetic field completely', 'It freezes Jupiter’s cloud belts'],
        answerIndex: 0,
        explanation: 'Volcanic SO₂ escaping Io is ionized into the Io Plasma Torus and couples to Jupiter’s rotating magnetic field via a powerful Alfvén current loop.'
      }
    }
  },
  {
    id: 'europa',
    parentId: 'jupiter',
    zone: 'solar',
    name: 'Europa',
    category: 'Galilean Subsurface-Ocean Moon',
    radius: 3.6,
    moonOrbitDist: 62,
    moonOrbitSpeed: 0.45,
    moonPhase: 2.3,
    moonInclinationDeg: 0.47,
    rotationSpeed: 0.04,
    visualType: 'europa',
    palette: ['#f8fafc', '#e0f2fe', '#93c5fd', '#b45309'],
    nasaUrl: 'https://science.nasa.gov/jupiter/jupiter-moons/europa/',
    nasaSourceLabel: 'NASA Science — Europa & Europa Clipper',
    metrics: {
      distanceLabel: '671,100 km from Jupiter (5.20 AU)',
      radiusKm: '1,560.8 km (0.90 × Moon)',
      gravity: '1.315 m/s² (0.134 g)',
      temp: '102 K mean surface (-171°C)',
      period: '3.551 Earth days (4:2:1 Laplace resonance)'
    },
    explorer: {
      headline: 'An icy world crisscrossed by reddish fractures that hides a global saltwater ocean with twice as much liquid water as all of Earth’s oceans!',
      bullets: [
        'Europa’s bright water-ice shell is only 15 to 25 km thick—and beneath it lies a liquid ocean 100 km deep!',
        'Because Europa has almost no impact craters, its icy surface is geological young and constantly reshaped from below.',
        'NASA’s Europa Clipper spacecraft was launched to study whether Europa’s hidden ocean has the ingredients needed for life!'
      ],
      quiz: {
        question: 'Why is Jupiter’s moon Europa one of NASA’s top targets in the search for life beyond Earth?',
        options: ['It hides a deep global liquid saltwater ocean beneath its icy crust', 'It has tropical rainforests on the surface', 'It is hotter than Venus'],
        answerIndex: 0,
        explanation: 'Tidal flexing keeps a ~60–150 km deep global liquid ocean warm beneath Europa’s ice shell, in direct contact with a rocky seafloor.'
      }
    },
    advanced: {
      headline: 'High-albedo (0.67) silicate-core world with a 15–25 km ice-I shell overlying a ~100-km-deep global briny ocean detected via Galileo induced magnetic field measurements.',
      bullets: [
        'Galileo magnetometer detected an induced dipole magnetic field responding to Jupiter’s 11.2-hour synodic field rotation, requiring a global electrically conductive (salty liquid) layer.',
        'Surface lineae (cycloidal ridges and bands) record diurnal tidal tensile stresses combined with non-synchronous shell rotation and chaos terrain diapirism.',
        ' reddish-brown non-ice material along double ridges consists of radiolytically processed hydrated magnesium sulfates and sulfuric acid hydrates.'
      ],
      quiz: {
        question: 'What key geophysical measurement by NASA’s Galileo spacecraft provided the strongest proof of a global salty ocean inside Europa?',
        options: ['An induced magnetic field generated by electrical currents in a conductive subsurface ocean', 'Direct sonar echoes from Earth', 'Optical photographs of open waves'],
        answerIndex: 0,
        explanation: 'As Jupiter’s tilted magnetic field sweeps past Europa, it induces eddy currents in Europa’s salty ocean, creating a secondary magnetic dipole measured by Galileo.'
      }
    }
  },
  {
    id: 'saturn',
    zone: 'solar',
    name: 'Saturn',
    category: 'Ringed Gas Giant',
    radius: 23,
    orbitRadius: 1880,
    orbitPeriodDays: 10759.22,
    inclinationDeg: 2.49,
    eccentricity: 0.0565,
    initialAngle: 4.3,
    rotationSpeed: 0.095,
    visualType: 'ringed',
    palette: ['#fef08a', '#eab308', '#ca8a04', '#a16207', '#fde047'],
    nasaUrl: 'https://science.nasa.gov/saturn/',
    nasaSourceLabel: 'NASA Science — Saturn & Cassini',
    metrics: {
      distanceLabel: '9.58 AU from Sun (79.3 light-min)',
      radiusKm: '58,232 km (9.1 × Earth)',
      gravity: '10.44 m/s² (1.07 g)',
      temp: '134 K (-139°C at 1 bar)',
      period: '29.45 Earth years'
    },
    explorer: {
      headline: 'The jewel of the Solar System—famous for its dazzling rings of pure water ice and its hazy moon Titan!',
      bullets: [
        'Saturn’s rings stretch 282,000 km across, yet in most places they are only about 10 meters (30 feet) thick!',
        'Saturn’s average density is 0.687 g/cm³—less dense than liquid water.',
        'Its moon Enceladus shoots geysers of water ice into space, while Titan has lakes of liquid methane and ethane.'
      ],
      quiz: {
        question: 'What are Saturn’s bright rings mostly made of?',
        options: ['Billions of chunks of water ice (99% ice)', 'Solid sheets of shiny metal', 'Hot glowing gas'],
        answerIndex: 0,
        explanation: 'Cassini spectroscopy showed Saturn’s main rings are ~99% pure crystalline water ice ranging from micrometer grains to house-sized boulders.'
      }
    },
    advanced: {
      headline: 'Low-density oblate gas giant (ρ = 0.687 g/cm³) featuring a Roche-limit ice ring disk, a north polar hexagonal Rossby wave, and axisymmetric magnetic field.',
      bullets: [
        'Semi-major axis a = 9.5826 AU • Obliquity = 26.73° • Ring system spans D, C, B, Cassini Division (4,800 km gap driven by 2:1 Mimas resonance), A, F, G, and E rings.',
        'North polar jet stream at ~78°N forms a persistent six-sided standing Rossby wave (~29,000 km wide) with a central eyewall vortex.',
        'Enceladus’s south polar tiger-stripe cryovolcanic plumes feed the diffuse E ring and contain H₂, silica nanoparticles, and organics indicative of hydrothermal vents.'
      ],
      quiz: {
        question: 'Which moon’s 2:1 orbital resonance clears the 4,800-km-wide Cassini Division in Saturn’s rings?',
        options: ['Mimas', 'Titan', 'Phoebe'],
        answerIndex: 0,
        explanation: 'Ring particles in the Cassini Division orbit twice for every one orbit of Mimas, experiencing periodic gravitational perturbations that sweep the gap clear.'
      }
    }
  },
  {
    id: 'enceladus',
    parentId: 'saturn',
    zone: 'solar',
    name: 'Enceladus',
    category: 'Cryovolcanic Geyser Moon',
    radius: 3.2,
    moonOrbitDist: 62,
    moonOrbitSpeed: 0.55,
    moonPhase: 1.1,
    moonInclinationDeg: 0.02,
    rotationSpeed: 0.04,
    visualType: 'europa',
    palette: ['#ffffff', '#e0f2fe', '#bae6fd', '#38bdf8'],
    nasaUrl: 'https://science.nasa.gov/saturn/moons/enceladus/',
    nasaSourceLabel: 'NASA Science — Enceladus & Cassini',
    metrics: {
      distanceLabel: '238,020 km from Saturn (E-Ring source)',
      radiusKm: '252.1 km (~1/7 of Earth’s Moon)',
      gravity: '0.113 m/s² (0.0115 g)',
      temp: '75 K mean (-198°C) • >360 K seafloor vents',
      period: '1.370 Earth days (2:1 Dione resonance)'
    },
    explorer: {
      headline: 'The brightest world in the Solar System—an icy moon that shoots giant geysers of ocean water and organic molecules straight into space!',
      bullets: [
        'Freshly fallen snow from its south-polar geysers makes Enceladus reflect almost 100% of the sunlight that hits it!',
        'NASA’s Cassini spacecraft flew directly through the plumes and tasted water vapor, salt, and building blocks of life.',
        'Those icy plumes create Saturn’s wide, glowing outer E-ring!'
      ],
      quiz: {
        question: 'What did NASA’s Cassini spacecraft discover erupting from the "Tiger Stripe" fractures at Enceladus’s south pole?',
        options: ['Geysers of liquid ocean water, ice grains, molecular hydrogen, and organics', 'Molten iron lava', 'Clouds of pure gold'],
        answerIndex: 0,
        explanation: 'Cassini’s Ion and Neutral Mass Spectrometer (INMS) and Cosmic Dust Analyzer directly sampled salty water ice, organics, and H₂ from a subsurface ocean.'
      }
    },
    advanced: {
      headline: ' Geometric albedo 1.38 icy satellite in a 2:1 mean-motion resonance with Dione, venting alkaline subsurface ocean plumes with hydrothermal H₂, CH₄, Phosphates, and SiO₂ nanoparticles.',
      bullets: [
        'Physical libration amplitude measurements by Cassini confirmed the ice shell (5–35 km thick) is mechanically decoupled from the silicate core by a global ocean.',
        'South Polar Terrain (SPT) "Tiger Stripes" (Alexandria, Cairo, Baghdad, Damascus sulci) radiate ~15 GW of endogenic heat and vent >200 kg/s of H₂O at ~400 m/s.',
        'Detection of native molecular H₂, nanometer-sized silica (requiring T > 90°C alkaline water–rock reactions), and sodium phosphates confirms active serpentinization.'
      ],
      quiz: {
        question: 'Why was the Cassini detection of nanometer-sized silica (SiO₂) grains and molecular H₂ in Enceladus’s plumes a breakthrough for astrobiology?',
        options: ['They require active high-temperature (>90°C) alkaline hydrothermal vents on the rocky seafloor', 'They prove Enceladus has no rocky core', 'They only form in solar flares'],
        answerIndex: 0,
        explanation: 'Colloidal silica nanoparticles of 2–8 nm radius only precipitate when alkaline hydrothermal fluids (>90°C) from serpentinizing seafloor rock mix with cold ocean water.'
      }
    }
  },
  {
    id: 'titan',
    parentId: 'saturn',
    zone: 'solar',
    name: 'Titan',
    category: 'Atmosphere & Methane-Lake Moon',
    radius: 4.6,
    moonOrbitDist: 82,
    moonOrbitSpeed: 0.24,
    moonPhase: 4.2,
    moonInclinationDeg: 0.35,
    rotationSpeed: 0.035,
    visualType: 'venus',
    palette: ['#fde68a', '#f59e0b', '#d97706', '#78350f'],
    atmosphereColor: '#38bdf8',
    nasaUrl: 'https://science.nasa.gov/saturn/moons/titan/',
    nasaSourceLabel: 'NASA Science — Titan & Dragonfly',
    metrics: {
      distanceLabel: '1,221,870 km from Saturn (9.58 AU)',
      radiusKm: '2,574.7 km (Larger than Mercury!)',
      gravity: '1.352 m/s² (0.138 g)',
      temp: '93.7 K surface (-179.5°C)',
      period: '15.945 Earth days'
    },
    explorer: {
      headline: 'A moon bigger than the planet Mercury—wrapped in a thick golden atmosphere with rain, rivers, and lakes of liquid methane!',
      bullets: [
        'Titan is the only moon in the Solar System with a thick atmosphere (even denser than Earth’s!) and the only world besides Earth with liquid rivers and seas on its surface.',
        'Because Titan is so cold (-180°C), water is frozen hard as rock, while methane and ethane flow as liquid rain and lakes!',
        'NASA’s nuclear-powered Dragonfly rotorcraft will fly through Titan’s thick air to explore its organic dunes and craters.'
      ],
      quiz: {
        question: 'What liquid fills the rivers, rain clouds, and lakes on Saturn’s giant moon Titan?',
        options: ['Liquid methane and ethane (hydrocarbons)', 'Liquid water', 'Molten lava'],
        answerIndex: 0,
        explanation: 'At Titan’s surface temperature of 93.7 K (-179.5°C) and 1.45 bar pressure, methane exists near its triple point, driving an active hydrocarbon hydrological cycle.'
      }
    },
    advanced: {
      headline: '1.45-bar N₂/CH₄ atmosphere-bearing satellite (R = 2,574.7 km) with photochemical tholin aerosols, polar hydrocarbon seas (Kraken/Ligeia Mare), and a subsurface water–ammonia ocean.',
      bullets: [
        'Atmosphere is 94.2% N₂ and 5.65% CH₄ • UV photolysis and magnetospheric electrons polymerize CH₄/N₂ into complex organic tholin haze layers.',
        'Cassini RADAR altimetry and bathymetry mapped Kraken Mare and Ligeia Mare (>150 m deep transparent liquid ethane/methane seas) in the northern polar basin.',
        'Low gravity (0.138 g) + high atmospheric density (4.4× Earth sea-level density) enables rotorcraft flight by NASA’s upcoming Dragonfly New Frontiers lander.'
      ],
      quiz: {
        question: 'How does Titan’s surface atmospheric pressure and density compare to Earth’s at sea level?',
        options: ['~1.45 bar pressure and ~4.4× higher air density than Earth', 'A near-vacuum like the Moon', '92 bar like Venus'],
        answerIndex: 0,
        explanation: 'Titan’s nitrogen-rich atmosphere has a surface pressure of 1.45 atm and, due to its cold temperature (94 K), a gas density ~4.4 times higher than Earth’s sea-level air.'
      }
    }
  },
  {
    id: 'uranus',
    zone: 'solar',
    name: 'Uranus',
    category: 'Ice Giant Planet',
    radius: 15.5,
    orbitRadius: 2360,
    orbitPeriodDays: 30688.5,
    inclinationDeg: 0.77,
    eccentricity: 0.0457,
    initialAngle: 0.3,
    rotationSpeed: -0.06,
    visualType: 'icy',
    palette: ['#cffafe', '#67e8f9', '#22d3ee', '#0891b2'],
    atmosphereColor: '#67e8f9',
    nasaUrl: 'https://science.nasa.gov/uranus/',
    nasaSourceLabel: 'NASA Science — Uranus',
    metrics: {
      distanceLabel: '19.22 AU from Sun (2.66 light-hours)',
      radiusKm: '25,362 km (4.0 × Earth)',
      gravity: '8.69 m/s² (0.89 g)',
      temp: '76 K (-197°C at 1 bar)',
      period: '84.01 Earth years'
    },
    explorer: {
      headline: 'The sideways Ice Giant—tilted almost 98 degrees so it rolls around the Sun like a ball!',
      bullets: [
        'Methane gas in the upper atmosphere absorbs red light and reflects blue-green light back into space.',
        'Because Uranus is tipped on its side, each pole gets 42 years of continuous sunlight followed by 42 years of darkness!',
        'Uranus has 13 faint dark rings and 28 moons named after characters from Shakespeare and Alexander Pope.'
      ],
      quiz: {
        question: 'What makes Uranus’s spin unique among all planets in the Solar System?',
        options: ['It is tilted ~98° on its side', 'It doesn’t rotate at all', 'It spins faster than Jupiter'],
        answerIndex: 0,
        explanation: 'Uranus’s 97.77° axial tilt places its rotation axis nearly in its orbital plane, likely caused by a giant protoplanetary impact early in its history.'
      }
    },
    advanced: {
      headline: 'Sub-Neptune/Ice Giant (14.54 M⊕) with a supercritical H₂O–NH₃–CH₄ ionic mantle, 97.77° obliquity, and a 59°-tilted, offset quadrupole magnetosphere.',
      bullets: [
        'Semi-major axis a = 19.191 AU • Exhibits anomalously low internal heat flux (radiates almost no excess primordial heat compared to Neptune).',
        'Interior consists of ~80% by mass hot dense "icy" fluids (water, ammonia, methane) above a small silicate/iron core.',
        'Voyager 2 measured a magnetic dipole tilted 58.6° from the rotational axis and offset by 0.31 R_U from the planet’s center.'
      ],
      quiz: {
        question: 'Unlike Jupiter and Saturn, the bulk interior mass (~80%) of Ice Giants like Uranus and Neptune consists of:',
        options: ['Supercritical water, ammonia, and methane fluids', 'Liquid metallic hydrogen', 'Solid iron-nickel metal'],
        answerIndex: 0,
        explanation: 'Ice giants lack the immense pressures required to metallize large volumes of hydrogen, instead containing deep mantles of high-pressure ionic H₂O, NH₃, and CH₄.'
      }
    }
  },
  {
    id: 'neptune',
    zone: 'solar',
    name: 'Neptune',
    category: 'Ice Giant Planet',
    radius: 15,
    orbitRadius: 2840,
    orbitPeriodDays: 60182,
    inclinationDeg: 1.77,
    eccentricity: 0.0113,
    initialAngle: 2.8,
    rotationSpeed: 0.065,
    visualType: 'icy',
    palette: ['#60a5fa', '#2563eb', '#1d4ed8', '#1e3a8a'],
    atmosphereColor: '#3b82f6',
    nasaUrl: 'https://science.nasa.gov/neptune/',
    nasaSourceLabel: 'NASA Science — Neptune',
    metrics: {
      distanceLabel: '30.07 AU from Sun (4.16 light-hours)',
      radiusKm: '24,622 km (3.88 × Earth)',
      gravity: '11.15 m/s² (1.14 g)',
      temp: '72 K (-201°C at 1 bar)',
      period: '164.8 Earth years'
    },
    explorer: {
      headline: 'The windiest world in the Solar System—an azure Ice Giant 30 times farther from the Sun than Earth!',
      bullets: [
        'Neptune was the first planet found using math before anyone saw it through a telescope (in 1846)!',
        'Supersonic winds in Neptune’s atmosphere reach over 2,000 km/h (1,200 mph).',
        'Its largest moon, Triton, orbits backward and erupts nitrogen ice geysers—it’s a captured Kuiper Belt world!'
      ],
      quiz: {
        question: 'How was Neptune first discovered in 1846?',
        options: ['By mathematical predictions from Uranus’s orbit', 'By an unmanned space probe', 'It was visible to the naked eye in ancient times'],
        answerIndex: 0,
        explanation: 'Urbain Le Verrier and John Couch Adams calculated Neptune’s position from gravitational perturbations in Uranus’s orbit before Johann Galle observed it.'
      }
    },
    advanced: {
      headline: '17.15-Earth-mass dynamic Ice Giant at 30.07 AU radiating 2.61× the energy it receives from the Sun, orbited by the retrograde captured KBO Triton.',
      bullets: [
        'Completed its first full 164.79-year orbit since its 1846 discovery in July 2011 • Equatorial winds reach ~580 m/s (Mach ~1.5).',
        'Strong internal heat source (2.61× insolation) drives active convective methane clouds and transient dark anticyclonic vortices.',
        'Triton (i = 156.87° retrograde) exhibits active nitrogen geysers, cantaloupe terrain, and tidal orbital decay that will bring it inside Neptune’s Roche limit in ~3.6 Gyr.'
      ],
      quiz: {
        question: 'Why do planetary scientists conclude that Neptune’s largest moon, Triton, is a captured Kuiper Belt Object?',
        options: ['It orbits in a steep retrograde (backward) inclination of 157°', 'It is made entirely of iron', 'It orbits outside Neptune’s Hill sphere'],
        answerIndex: 0,
        explanation: 'Moons that form in situ within a planet’s circumplanetary disk orbit prograde near the equatorial plane; Triton’s retrograde, inclined orbit is a signature of gravitational capture.'
      }
    }
  },
  {
    id: 'triton',
    parentId: 'neptune',
    zone: 'solar',
    name: 'Triton',
    category: 'Retrograde Captured Kuiper Belt Moon',
    radius: 3.8,
    moonOrbitDist: 44,
    moonOrbitSpeed: -0.38,
    moonPhase: 1.5,
    moonInclinationDeg: 23,
    rotationSpeed: -0.04,
    visualType: 'triton',
    palette: ['#f1f5f9', '#fecdd3', '#cbd5e1', '#64748b'],
    nasaUrl: 'https://science.nasa.gov/neptune/neptune-moons/triton/',
    nasaSourceLabel: 'NASA Science — Triton (Voyager 2)',
    metrics: {
      distanceLabel: '354,759 km from Neptune (Retrograde)',
      radiusKm: '1,353.4 km (Larger than Pluto!)',
      gravity: '0.779 m/s² (0.079 g)',
      temp: '38 K (-235°C — coldest measured surface)',
      period: '-5.877 days (Retrograde synchronous)'
    },
    explorer: {
      headline: 'A captured Kuiper Belt dwarf planet larger than Pluto that orbits Neptune backward and shoots 8-km-tall nitrogen geysers!',
      bullets: [
        'Triton is the only large moon in the Solar System that orbits in the opposite direction of its planet’s spin (retrograde)!',
        'Voyager 2 discovered dark geysers of nitrogen gas erupting through Triton’s pinkish frozen nitrogen polar cap.',
        'Strange dimpled "cantaloupe terrain" covers its surface from ancient icy slush volcanism.'
      ],
      quiz: {
        question: 'What is unusual about the direction Triton orbits around Neptune?',
        options: ['It orbits backward (retrograde) compared to Neptune’s spin', 'It orbits in a square', 'It stops every 10 days'],
        answerIndex: 0,
        explanation: 'Triton’s retrograde orbit (inclined 157°) proves it did not form alongside Neptune, but was gravitationally captured from the Kuiper Belt.'
      }
    },
    advanced: {
      headline: 'Retrograde (i = 156.87°), zero-eccentricity (e < 0.00002) captured Kuiper Belt planetesimal (ρ = 2.061 g/cm³) with solid N₂ frost geysers and diapiric cantaloupe terrain.',
      bullets: [
        'Binary-exchange or gas-drag capture dissipated massive orbital energy via tidal heating, circularizing Triton’s orbit and melting its interior for ~1 Gyr.',
        'Voyager 2 imaged solar-driven solid-state greenhouse geysers lofting dark organic/silicate dust 8 km high into a 14-μbar N₂ atmosphere.',
        'Retrograde tidal torque transfers angular momentum from Triton to Neptune, causing orbital decay into the Roche limit in ~3.6 Gyr.'
      ],
      quiz: {
        question: 'What drives the 8-km-high nitrogen gas plumes observed by Voyager 2 on Triton’s southern polar cap?',
        options: ['Subsurface solar heating (solid-state greenhouse effect) or internal heat vaporizing basal N₂ ice', 'Silicate basalt volcanoes', 'Impact craters from meteors'],
        answerIndex: 0,
        explanation: 'Sunlight penetrates transparent surface nitrogen ice and heats a dark substrate (or endogenic heat warms the base), pressurizing N₂ gas until it vents explosively.'
      }
    }
  },

  // ================= ZONE 2: STELLAR NEIGHBORHOOD =================
  {
    id: 'proxima-b',
    zone: 'stellar',
    name: 'Proxima Centauri b',
    category: 'Confirmed Habitable-Zone Exoplanet',
    radius: 22,
    position: [120, -25, -340],
    rotationSpeed: 0.02,
    visualType: 'exoplanet',
    palette: ['#fb7185', '#9f1239', '#4c0519', '#0f172a'],
    atmosphereColor: '#fda4af',
    nasaUrl: 'https://science.nasa.gov/exoplanet-catalog/proxima-centauri-b/',
    nasaSourceLabel: 'NASA Exoplanet Catalog — Proxima b',
    metrics: {
      distanceLabel: '4.2465 light-years (1.30 pc)',
      radiusKm: '~6,880 km (~1.08 × Earth est.)',
      gravity: '~10.5 m/s² (M sin i = 1.07 M⊕)',
      temp: '234 K equilibrium (-39°C)',
      period: '11.186 Earth days (at 0.0485 AU)'
    },
    explorer: {
      headline: 'The closest known exoplanet outside our Solar System—orbiting a red dwarf star just 4.24 light-years away!',
      bullets: [
        'Proxima Centauri b orbits in its star’s "Goldilocks Zone," where temperatures could allow liquid water.',
        'Because its red dwarf star is much dimmer than our Sun, Proxima b orbits 20 times closer than Earth does, finishing a year in just 11 days!',
        'It is likely tidally locked, with one side in permanent red-orange daylight and the other in endless starry night.'
      ],
      quiz: {
        question: 'How far away is Proxima Centauri b, the nearest exoplanet to Earth?',
        options: ['4.24 light-years', '100,000 light-years', '1.5 Astronomical Units'],
        answerIndex: 0,
        explanation: 'Proxima Centauri is the closest star to the Sun at 4.2465 light-years (1.302 parsecs).'
      }
    },
    advanced: {
      headline: 'Terrestrial-mass planet (M sin i = 1.07 M⊕) detected via radial velocity (ESPRESSO/HARPS) in the habitable zone of the M5.5Ve flare star Proxima Centauri.',
      bullets: [
        'Semi-major axis a = 0.04856 AU • Orbital period P = 11.18427 d • Instellation S ≈ 0.65 S⊕.',
        'Host star Proxima Centauri (M = 0.122 M☉, L = 0.0017 L☉) subjects the planet to intense XUV radiation and stellar flares ~400× stronger than Earth experiences.',
        'Prime target for future high-contrast + high-resolution spectroscopy (ELT/HWO) to test whether M-dwarf terrestrial worlds retain high-mean-molecular-weight atmospheres.'
      ],
      quiz: {
        question: 'By which detection method was Proxima Centauri b discovered in 2016?',
        options: ['Doppler radial velocity (stellar wobble)', 'Planetary transit photometry', 'Gravitational microlensing'],
        answerIndex: 0,
        explanation: 'Proxima b does not transit from Earth’s line of sight; it was discovered via a ~1.4 m/s radial-velocity reflex motion using ESO’s HARPS spectrograph.'
      }
    }
  },
  {
    id: 'sirius',
    zone: 'stellar',
    name: 'Sirius A & B',
    category: 'A1V Binary Star + White Dwarf',
    radius: 52,
    position: [-380, 60, -680],
    rotationSpeed: 0.025,
    visualType: 'star',
    palette: ['#e0f2fe', '#7dd3fc', '#38bdf8'],
    coronaColor: 'rgba(125, 211, 252, 0.68)',
    nasaUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/',
    nasaSourceLabel: 'NASA Hubble — Sirius Binary System',
    metrics: {
      distanceLabel: '8.60 light-years (2.64 pc)',
      radiusKm: '1,190,000 km (1.71 × Sun)',
      gravity: 'Sirius B: ~4,000,000 m/s²',
      temp: '9,940 K (Sirius A) • 25,200 K (Sirius B)',
      period: '50.13-year binary orbit'
    },
    explorer: {
      headline: 'The brightest star in Earth’s night sky—actually a pair of stars: a dazzling blue-white star and a tiny, super-dense White Dwarf!',
      bullets: [
        'Sirius A shines 25 times brighter than our Sun.',
        'Its companion, Sirius B ("The Pup"), packs the mass of our entire Sun into a sphere the size of Earth!',
        'A single teaspoon of material from Sirius B would weigh about 5 tons on Earth.'
      ],
      quiz: {
        question: 'What kind of object is Sirius B, the companion orbiting Sirius A?',
        options: ['An Earth-sized White Dwarf star', 'A gas giant planet', 'A red supergiant'],
        answerIndex: 0,
        explanation: 'Sirius B is the nearest known white dwarf to Earth—the dense carbon–oxygen core remnant of a star that originally had ~5 solar masses.'
      }
    },
    advanced: {
      headline: 'Visual binary at 2.64 pc comprising an A0mA1Va metallic-line main-sequence star (2.063 M☉, 25.4 L☉) and a DA2 white dwarf (1.018 M☉, R = 0.0084 R☉).',
      bullets: [
        'Apparent magnitude V = -1.46 • Binary semi-major axis a ≈ 20 AU with eccentricity e = 0.5914 and period P = 50.128 years.',
        'Sirius B sits near the Chandrasekhar electron-degeneracy mass limit (1.018 M☉ vs. ~1.44 M☉), producing a measurable gravitational redshift of ~80.65 km/s.',
        'Progenitor of Sirius B was a ~5 M☉ B-type star that shed ~4 M☉ on the asymptotic giant branch ~120 Myr ago, enriching Sirius A with s-process metals.'
      ],
      quiz: {
        question: 'What physical pressure supports Sirius B against gravitational collapse?',
        options: ['Electron degeneracy pressure (Pauli exclusion principle)', 'Hydrogen core fusion thermal pressure', 'Neutron degeneracy pressure'],
        answerIndex: 0,
        explanation: 'White dwarfs have exhausted nuclear fusion and are supported against gravity by quantum-mechanical electron degeneracy pressure.'
      }
    }
  },
  {
    id: 'trappist-1',
    zone: 'stellar',
    name: 'TRAPPIST-1 System (1e)',
    category: '7-Planet Ultra-Cool Dwarf System',
    radius: 26,
    position: [520, 110, -960],
    rotationSpeed: 0.03,
    visualType: 'earth',
    palette: ['#0f766e', '#0ea5e9', '#1e40af', '#111827'],
    atmosphereColor: '#2dd4bf',
    nasaUrl: 'https://science.nasa.gov/exoplanets/trappist1/',
    nasaSourceLabel: 'NASA Exoplanets — TRAPPIST-1 System',
    metrics: {
      distanceLabel: '40.66 light-years (12.47 pc)',
      radiusKm: 'TRAPPIST-1e: 5,860 km (0.92 × Earth)',
      gravity: '8.01 m/s² (0.82 g on 1e)',
      temp: '251 K equilibrium (-22°C on 1e)',
      period: '6.10 Earth days (TRAPPIST-1e)'
    },
    explorer: {
      headline: 'Seven Earth-sized rocky planets packed tightly around a tiny star no bigger than Jupiter!',
      bullets: [
        'All seven TRAPPIST-1 planets orbit closer to their star than Mercury orbits our Sun!',
        'Three of the planets (e, f, and g) sit inside the habitable zone where liquid water could exist.',
        'If you stood on TRAPPIST-1e, the neighboring planets in the sky would look bigger than the full Moon looks from Earth!'
      ],
      quiz: {
        question: 'How many Earth-sized rocky planets orbit the star TRAPPIST-1?',
        options: ['Seven (with 3 in the habitable zone)', 'One gas giant', 'Twelve ice giants'],
        answerIndex: 0,
        explanation: 'NASA’s Spitzer Space Telescope and ground observatories confirmed 7 rocky planets (b through h), all comparable in size and density to Earth.'
      }
    },
    advanced: {
      headline: 'Compact resonant chain of 7 terrestrial planets (b–h) orbiting an M8V ultra-cool dwarf (0.0898 M☉, 0.1192 R☉) observed via transit photometry and TTVs + JWST.',
      bullets: [
        'Near-resonant Laplace chain with period ratios 8:5, 5:3, 3:2, 3:2, 4:3, and 3:2, enabling precise mass measurements (0.326 to 1.321 M⊕) via Transit Timing Variations (TTVs).',
        'JWST MIRI 15 μm secondary-eclipse photometry of TRAPPIST-1b and 1c ruled out thick CO₂-rich atmospheres on the innermost two worlds.',
        'TRAPPIST-1e (0.692 M⊕, 0.920 R⊕, ρ = 4.90 g/cm³) receives S = 0.66 S⊕ and remains the highest-priority target for JWST transmission spectroscopy.'
      ],
      quiz: {
        question: 'How did astronomers measure the exact masses and densities of the seven TRAPPIST-1 planets?',
        options: ['Transit Timing Variations (TTVs) from mutual gravitational tugs', 'Direct surface radar', 'Astrometric proper motion'],
        answerIndex: 0,
        explanation: 'Because the 7 planets orbit in a tight Laplace resonant chain, their mutual gravitational pulls slightly speed up or delay each transit (TTVs), revealing their masses.'
      }
    }
  },
  {
    id: 'betelgeuse',
    zone: 'stellar',
    name: 'Betelgeuse (Alpha Orionis)',
    category: 'M1-M2Ia Red Supergiant',
    radius: 78,
    position: [-340, -130, -1420],
    rotationSpeed: 0.008,
    visualType: 'star',
    palette: ['#fef08a', '#f97316', '#dc2626', '#7f1d1d'],
    coronaColor: 'rgba(249, 115, 22, 0.65)',
    nasaUrl: 'https://science.nasa.gov/missions/hubble/hubble-sees-red-supergiant-star-betelgeuse-slowly-recovering-after-blowing-its-top/',
    nasaSourceLabel: 'NASA Hubble — Betelgeuse Supergiant',
    metrics: {
      distanceLabel: '~548 light-years (~168 pc)',
      radiusKm: '~530,000,000 km (~764 × Sun)',
      gravity: '~0.003 m/s² (ultra-diffuse envelope)',
      temp: '3,600 K surface',
      period: '~400-day fundamental pulsation'
    },
    explorer: {
      headline: 'A colossal Red Supergiant star in Orion—so enormous that if placed at our Sun, it would swallow Mercury, Venus, Earth, and Mars!',
      bullets: [
        'Betelgeuse is over 700 times wider than our Sun and shines 100,000 times brighter!',
        'In 2019–2020, Hubble watched Betelgeuse burp out a huge cloud of surface gas that cooled into dust—the "Great Dimming."',
        'Within the next 100,000 years, Betelgeuse will run out of fuel and explode as a spectacular supernova visible in daytime!'
      ],
      quiz: {
        question: 'What caused Betelgeuse’s famous "Great Dimming" observed by NASA’s Hubble Space Telescope in 2019–2020?',
        options: ['A giant surface mass ejection that cooled into a dust cloud', 'An alien megastructure', 'A black hole passing in front of it'],
        answerIndex: 0,
        explanation: 'Hubble spectroscopy showed Betelgeuse ejected a massive convective plume that cooled into silicate dust, temporarily blocking light from its southern hemisphere.'
      }
    },
    advanced: {
      headline: 'Evolved core-helium/carbon-burning M1–2Ia-Iab red supergiant (~16.5–19 M☉, R ≈ 764 R☉) destined for a Type II-P core-collapse supernova.',
      bullets: [
        'Bolometric luminosity L ≈ 1.26 × 10⁵ L☉ • Exhibits giant convective cells spanning >30% of the stellar disk and a ~400 d radial fundamental pulsation mode.',
        'The 2019–2020 Great Dimming dropped visual magnitude from V ≈ 0.5 to 1.61 when a convective surface mass ejection (SME) condensed into optically thick dust.',
        'When its iron core exceeds the Chandrasekhar limit, collapse will release ~10⁴⁶ J primarily in MeV neutrinos, leaving a neutron star remnant.'
      ],
      quiz: {
        question: 'What type of supernova will Betelgeuse produce at the end of its nuclear burning lifecycle?',
        options: ['Type II Core-Collapse Supernova', 'Type Ia Thermonuclear White Dwarf Supernova', 'Kilonova'],
        answerIndex: 0,
        explanation: 'Massive red supergiants (>8 M☉) with hydrogen-rich envelopes undergo iron-core collapse, producing a Type II-P supernova and a neutron star.'
      }
    }
  },

  // ================= ZONE 3: MILKY WAY SECTOR =================
  {
    id: 'orion-nebula',
    zone: 'milkyway',
    name: 'Orion Nebula (M42)',
    category: 'Diffuse H II Emission Nebula',
    radius: 95,
    position: [260, -60, -480],
    rotationSpeed: 0.005,
    visualType: 'nebula',
    palette: ['#ec4899', '#a855f7', '#38bdf8'],
    nasaUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/',
    nasaSourceLabel: 'NASA Hubble & Webb — Messier 42',
    metrics: {
      distanceLabel: '1,344 light-years (412 pc)',
      radiusKm: '~12 light-years radius (24 ly across)',
      gravity: 'Self-gravitating molecular cloud (~2,000 M☉)',
      temp: '~10,000 K ionized H II gas',
      period: 'Trapezium cluster age: < 2 million yrs'
    },
    explorer: {
      headline: 'The closest massive star-making factory to Earth—glowing clouds where thousands of baby stars and planets are being born right now!',
      bullets: [
        'M42 is so bright you can spot it with the naked eye as the middle "star" in Orion’s sword.',
        'At its heart, four super-hot young stars called the Trapezium blast ultraviolet light that makes the gas glow pink and teal.',
        'Hubble and Webb discovered over 150 "proplyds"—spinning disks of dust around baby stars forming new solar systems!'
      ],
      quiz: {
        question: 'What are the "proplyds" discovered inside the Orion Nebula by NASA’s Hubble and Webb telescopes?',
        options: ['Protoplanetary disks forming new solar systems around young stars', 'Ancient dead galaxies', 'Frozen comets from our Oort Cloud'],
        answerIndex: 0,
        explanation: 'Proplyds (protoplanetary disks) are dense cocoons of gas and dust around newborn T Tauri stars where planets are actively accreting.'
      }
    },
    advanced: {
      headline: 'Blister H II region on the near face of the Orion A Giant Molecular Cloud photoionized by the O6Vp star θ¹ Orionis C in the Trapezium Cluster.',
      bullets: [
        'Distance d = 412 ± 10 pc (VLBA trigonometric parallax) • Linear diameter ≈ 7.4 pc (24 ly) • Electron density n_e ≈ 10³–10⁴ cm⁻³ in the Huygens Region.',
        'Optical emission is dominated by Balmer Hα (656.3 nm, red/pink), Hβ (486.1 nm), and forbidden doubly ionized oxygen [O III] (495.9 / 500.7 nm, teal-green).',
        'JWST NIRCam observations of the Orion Bar Photodissociation Region (PDR) resolved polycyclic aromatic hydrocarbon (PAH) filaments and UV-evaporating proplyds.'
      ],
      quiz: {
        question: 'Which forbidden atomic emission lines give H II nebulae like M42 their characteristic teal-green glow?',
        options: ['Doubly ionized oxygen [O III] at 495.9 and 500.7 nm', 'Neutral iron at 527 nm', 'Molecular nitrogen in the infrared'],
        answerIndex: 0,
        explanation: 'In low-density nebular gas, metastable [O III] transitions at 495.9 nm and 500.7 nm emit strongly without collisional de-excitation, producing the signature teal hue.'
      }
    }
  },
  {
    id: 'crab-nebula',
    zone: 'milkyway',
    name: 'Crab Nebula & Pulsar (M1)',
    category: 'Supernova Remnant & Pulsar Wind Nebula',
    radius: 75,
    position: [-380, 120, -960],
    rotationSpeed: 0.02,
    visualType: 'nebula',
    palette: ['#38bdf8', '#818cf8', '#f43f5e'],
    nasaUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-1/',
    nasaSourceLabel: 'NASA Hubble/Chandra/Webb — Messier 1',
    metrics: {
      distanceLabel: '6,500 light-years (2.0 kpc)',
      radiusKm: '5.5 light-years radius (expanding at 1,500 km/s)',
      gravity: 'Central Pulsar: ~1.4 M☉ in 20 km sphere',
      temp: 'Pulsar surface ~1,600,000 K',
      period: '33.08 milliseconds (30.2 spins/sec!)'
    },
    explorer: {
      headline: 'The glowing wreckage of a star that exploded in the year 1054 AD—powered by a city-sized neutron star spinning 30 times every second!',
      bullets: [
        'Astronomers in China, Japan, and the Americas recorded this "guest star" in 1054 AD—it was bright enough to see in broad daylight for 23 days!',
        'Today, the cloud is 11 light-years wide and still expanding at 1,500 kilometers per second.',
        'At the center sits the Crab Pulsar, a super-magnetic neutron star flashing twin beams of X-rays and light like a cosmic lighthouse 30 times a second.'
      ],
      quiz: {
        question: 'What sits at the very center of the Crab Nebula (M1), powering its eerie blue glow?',
        options: ['A rapidly spinning neutron star (pulsar) rotating 30 times per second', 'A red dwarf star', 'A cold rogue planet'],
        answerIndex: 0,
        explanation: 'The Crab Pulsar (PSR B0531+21) is a magnetized neutron star with a 33-millisecond period whose relativistic wind lights up the nebula.'
      }
    },
    advanced: {
      headline: ' Archetypal Pulsar Wind Nebula (PWN) from SN 1054, energized by magnetohydrodynamic synchrotron radiation from PSR B0531+21 (P = 33.08 ms).',
      bullets: [
        'Spin-down luminosity L_sd = -I Ω dΩ/dt ≈ 4.6 × 10³¹ W (1.2 × 10⁵ L☉) accelerates e⁻/e⁺ pairs to PeV energies across the termination shock.',
        'Interior bluish continuum from optical to X-rays (imaged by Chandra and JWST) is polarized synchrotron radiation from relativistic electrons spiraling in a ~0.3 mG magnetic field.',
        'Outer filamentary cage consists of photoionized ejecta enriched in He, C, O, Ne, S, and Fe expanding homologously at ~1,500 km/s.'
      ],
      quiz: {
        question: 'What physical mechanism produces the smooth bluish interior glow of the Crab Nebula across optical and X-ray wavelengths?',
        options: ['Synchrotron radiation from relativistic electrons spiraling in magnetic fields', 'Thermal blackbody radiation from cool dust', '21-cm neutral hydrogen hyperfine emission'],
        answerIndex: 0,
        explanation: 'Relativistic electrons and positrons injected by the Crab Pulsar spiral around nebular magnetic field lines, emitting polarized synchrotron continuum radiation.'
      }
    }
  },
  {
    id: 'sagittarius-a',
    zone: 'milkyway',
    name: 'Sagittarius A* (Galactic Center)',
    category: 'Supermassive Black Hole (SMBH)',
    radius: 68,
    position: [0, 30, -1620],
    rotationSpeed: 0.06,
    visualType: 'blackhole',
    palette: ['#fb923c', '#f59e0b', '#fef08a'],
    nasaUrl: 'https://science.nasa.gov/universe/black-holes/',
    nasaSourceLabel: 'NASA Universe — Sagittarius A* Black Hole',
    metrics: {
      distanceLabel: '26,670 light-years (8.178 kpc)',
      radiusKm: '12,000,000 km Schwarzschild radius (~17 × Sun)',
      gravity: '4,297,000 Solar Masses (4.3 × 10⁶ M☉)',
      temp: 'Accretion plasma: ~10¹⁰ K (10 billion K)',
      period: 'Star S2 orbits in 16.05 years (at 2.5% c!)'
    },
    explorer: {
      headline: 'The monster at the heart of our Milky Way—a Supermassive Black Hole 4.3 million times heavier than our Sun!',
      bullets: [
        'Even though Sagittarius A* has the mass of 4.3 million Suns, its event horizon fits inside the orbit of Mercury!',
        'Astronomers proved it was a black hole by watching nearby stars (like Star S2) whip around an invisible point at 7,650 km/s—2.5% the speed of light!',
        'In 2022, the Event Horizon Telescope captured the first direct image of the glowing orange ring of superheated gas around its shadow.'
      ],
      quiz: {
        question: 'How many times more massive than our Sun is Sagittarius A*, the supermassive black hole at the center of the Milky Way?',
        options: ['About 4.3 million times the mass of the Sun', 'About 10 times the mass of the Sun', 'Equal to the mass of Earth'],
        answerIndex: 0,
        explanation: 'Precision astrometry of the S-star cluster (GRAVITY/Keck) measured the mass of Sgr A* at 4.297 × 10⁶ solar masses.'
      }
    },
    advanced: {
      headline: '4.297 × 10⁶ M☉ supermassive black hole at the dynamical center of the Milky Way (d = 8.178 kpc), imaged at 230 GHz by the Event Horizon Telescope.',
      bullets: [
        'Schwarzschild radius R_s = 2GM/c² ≈ 1.27 × 10⁷ km (0.085 AU) • Shadow angular diameter = 51.8 ± 2.3 microarcseconds (EHT 2022).',
        'B-type star S2 (S0-2) reaches pericenter at 120 AU (~1,400 R_s) with orbital velocity v = 7,650 km/s (β = 0.0255), confirming General Relativistic gravitational redshift and Schwarzschild precession.',
        'Radiatively inefficient Advection-Dominated Accretion Flow (ADAF / MAD) accretes at a sub-Eddington rate (~10⁻⁸ M☉/yr) with frequent X-ray/NIR magnetic reconnection flares.'
      ],
      quiz: {
        question: 'What is the approximate Schwarzschild event-horizon radius (R_s = 2GM/c²) of the 4.3-million-solar-mass black hole Sagittarius A*?',
        options: ['~12.7 million km (0.085 AU — well inside Mercury’s orbit)', '~1 light-year', '~10 kilometers'],
        answerIndex: 0,
        explanation: 'Since R_s ≈ 2.95 km × (M / M☉), a 4.3 × 10⁶ M☉ black hole has an event horizon radius of ~12.7 million km (about 17 solar radii).'
      }
    }
  },

  // ================= ZONE 4: LOCAL GROUP GALAXIES =================
  {
    id: 'milkyway-overview',
    zone: 'intergalactic',
    name: 'Milky Way Galaxy',
    category: 'SBbc Barred Spiral Galaxy',
    radius: 260,
    position: [0, -30, -380],
    rotationSpeed: 0.008,
    visualType: 'galaxy',
    galaxyConfig: { count: 22000, radius: 280, arms: 4, spin: 3.6, coreColor: '#fde68a', armColor: '#38bdf8' },
    nasaUrl: 'https://science.nasa.gov/universe/galaxies/',
    nasaSourceLabel: 'NASA Universe — Our Milky Way Galaxy',
    metrics: {
      distanceLabel: '0.00 Mly (Home Galaxy)',
      radiusKm: '~52,850 light-years radius (~105,700 ly disk)',
      gravity: 'Total mass ~1.15 × 10¹² Solar Masses (with Dark Matter)',
      temp: '100–400 billion stars',
      period: 'Galactic Year: ~225–250 million years (at Sun)'
    },
    explorer: {
      headline: 'Our cosmic island—a giant barred spiral galaxy of 100 to 400 billion stars where our Solar System lives in the Orion Arm!',
      bullets: [
        'Light takes over 100,000 years just to cross from one edge of the Milky Way’s disk to the other!',
        'Our Sun sits about 26,670 light-years from the center and orbits the galaxy at 828,000 km/h—taking 230 million years for one "Galactic Year."',
        'Most of the Milky Way’s mass (~85%) is invisible Dark Matter that holds the spinning spiral arms together.'
      ],
      quiz: {
        question: 'How long does it take our Solar System to complete one full orbit around the Milky Way ("one Galactic Year")?',
        options: ['About 225 to 250 million years', '365 days', 'About 10,000 years'],
        answerIndex: 0,
        explanation: 'Traveling at ~230 km/s at a galactocentric radius of 8.18 kpc, the Sun completes one revolution every ~225–250 Myr (the dinosaurs had just appeared one Galactic Year ago!).'
      }
    },
    advanced: {
      headline: 'SBbc barred spiral galaxy (M_vir ≈ 1.15 × 10¹² M☉, M_★ ≈ 6 × 10¹⁰ M☉) with a 27°-inclined central stellar bar and flat dark-matter rotation curve.',
      bullets: [
        'Solar galactocentric distance R₀ = 8.178 kpc • Local circular velocity Θ₀ ≈ 233 km/s • Thin-disk scale length ≈ 2.6 kpc, scale height ≈ 300 pc.',
        'Four primary logarithmic spiral arms (Perseus, Scutum–Centaurus, Sagittarius–Carina, Norma–Outer) plus the local Orion–Cygnus spur.',
        'ESA Gaia astrometry revealed ancient phase-space merger remnants including the Gaia–Sausage–Enceladus (GSE) dwarf galaxy accretion event (~8–11 Gyr ago).'
      ],
      quiz: {
        question: 'What observation of the Milky Way’s outer rotation curve (v ≈ 220–240 km/s at large radii) provides key evidence for a Dark Matter halo?',
        options: ['Orbital velocities remain flat at large radii instead of falling off as r⁻¹/²', 'Outer stars orbit backward', 'All stars stop moving beyond the Sun’s orbit'],
        answerIndex: 0,
        explanation: 'Under Newtonian gravity from visible stars alone, orbital velocity beyond the optical disk should decline as v ∝ r⁻¹/² (Keplerian falloff); a flat rotation curve implies M(r) ∝ r inside an extended dark matter halo.'
      }
    }
  },
  {
    id: 'lmc',
    zone: 'intergalactic',
    name: 'Large Magellanic Cloud (LMC)',
    category: 'SB(s)m Dwarf Satellite Galaxy',
    radius: 130,
    position: [360, -140, -760],
    rotationSpeed: 0.01,
    visualType: 'galaxy',
    galaxyConfig: { count: 10000, radius: 135, arms: 2, spin: 1.8, coreColor: '#f472b6', armColor: '#60a5fa' },
    nasaUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/',
    nasaSourceLabel: 'NASA Hubble — Large Magellanic Cloud',
    metrics: {
      distanceLabel: '0.163 Million light-years (49.97 kpc)',
      radiusKm: '~16,100 light-years radius (~32,200 ly across)',
      gravity: '~1.38 × 10¹¹ Solar Masses (~10% of Milky Way)',
      temp: '~20 billion stars + Tarantula Nebula',
      period: '~1.5-billion-year infall trajectory'
    },
    explorer: {
      headline: 'The largest satellite galaxy orbiting the Milky Way—home to the giant Tarantula Nebula and Supernova 1987A!',
      bullets: [
        'Visible to the naked eye from Earth’s Southern Hemisphere, the LMC is 163,000 light-years away.',
        'It contains the Tarantula Nebula (30 Doradus), the most active starburst region in the entire Local Group!',
        'In 1987, a blue supergiant in the LMC exploded as Supernova 1987A—the closest supernova seen in almost 400 years.'
      ],
      quiz: {
        question: 'What famous starburst region inside the Large Magellanic Cloud is the largest star-forming nursery in our Local Group?',
        options: ['The Tarantula Nebula (30 Doradus)', 'The Crab Nebula', 'The Kuiper Belt'],
        answerIndex: 0,
        explanation: '30 Doradus (the Tarantula Nebula) spans nearly 1,000 light-years across—if it were as close as the Orion Nebula, it would cast visible shadows on Earth at night!'
      }
    },
    advanced: {
      headline: 'Gas-rich magellanic spiral satellite (d = 49.97 ± 1.11 kpc) on its first infall past the Milky Way, trailing the 200-kpc Magellanic Stream.',
      bullets: [
        'Distance calibrated to 1% precision via detached eclipsing binaries (Pietrzyński et al., 49.59 kpc), anchoring the Cepheid period–luminosity cosmic distance ladder (H₀).',
        'Hosts 30 Doradus (R136 core cluster contains stars up to ~200–250 M☉) and SN 1987A, whose 24 MeV neutrino burst was detected by Kamiokande II, IMB, and Baksan.',
        'Gravitational wake of the ~1.4 × 10¹¹ M☉ LMC induces a ~30 km/s reflex motion of the inner Milky Way disk relative to the outer stellar halo.'
      ],
      quiz: {
        question: 'Why is the Large Magellanic Cloud critical to measuring the Hubble Constant (H₀) and the expansion rate of the universe?',
        options: ['It calibrates the zero-point of the Cepheid variable period–luminosity distance ladder', 'It is the farthest galaxy ever seen', 'It has zero dark matter'],
        answerIndex: 0,
        explanation: 'Geometric detached eclipsing binary distances to the LMC calibrate the absolute luminosity of Cepheid variables, which in turn calibrate Type Ia supernovae in distant galaxies.'
      }
    }
  },
  {
    id: 'andromeda',
    zone: 'intergalactic',
    name: 'Andromeda Galaxy (M31)',
    category: 'SA(s)b Spiral Galaxy',
    radius: 340,
    position: [-260, 140, -1350],
    rotationSpeed: 0.007,
    visualType: 'galaxy',
    galaxyConfig: { count: 28000, radius: 360, arms: 4, spin: 3.8, coreColor: '#ffe4a3', armColor: '#60a5fa' },
    nasaUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/',
    nasaSourceLabel: 'NASA Hubble — Messier 31 (Andromeda)',
    metrics: {
      distanceLabel: '2.537 Million light-years (778 kpc)',
      radiusKm: '~76,000 light-years radius (~152,000 ly disk)',
      gravity: '~1.5 × 10¹² Solar Masses (~1 Trillion stars)',
      temp: 'Central SMBH: ~1.1–2.3 × 10⁸ M☉',
      period: 'Approaching Milky Way at 110 km/s (collision in ~4.5 Gyr)'
    },
    explorer: {
      headline: 'Our giant spiral neighbor—home to 1 trillion stars and hurtling toward the Milky Way at 400,000 km/h!',
      bullets: [
        'At 2.54 million light-years away, Andromeda (M31) is the farthest object you can see with the naked eye on a dark night.',
        'While most galaxies are rushing away from us as the universe expands, gravity is pulling Andromeda and the Milky Way together at 110 km/s!',
        'In about 4.5 billion years, our two galaxies will merge into a giant elliptical galaxy nicknamed "Milkomeda" (and stars are so far apart they almost never collide!).'
      ],
      quiz: {
        question: 'What will happen between the Andromeda Galaxy (M31) and our Milky Way in about 4.5 billion years?',
        options: ['Gravity will pull them together to merge into one giant galaxy', 'Andromeda will shrink into a planet', 'Nothing—they never interact'],
        answerIndex: 0,
        explanation: 'Hubble proper-motion measurements confirmed that M31 is on a head-on gravitational trajectory toward the Milky Way at ~110 km/s, merging in ~4.5 billion years.'
      }
    },
    advanced: {
      headline: 'Largest galaxy of the Local Group (d = 778 ± 17 kpc, ~10¹² stars), exhibiting a blueshifted heliocentric radial velocity of -300 km/s and a double-peakedP1/P2 nucleus.',
      bullets: [
        'Galactocentric approach velocity v_rad ≈ -109.3 km/s with low transverse velocity (measured via HST multi-epoch astrometry by van der Marel et al.), predicting pericenter passage in ~4.3 Gyr.',
        'Central supermassive black hole M31* has M ≈ (1.1–2.3) × 10⁸ M☉—roughly 30–50× more massive than Sagittarius A*—surrounded by an eccentric apsidally aligned stellar disk (P1/P2).',
        'PAndAS survey mapped giant stellar streams in M31’s halo spanning >150 kpc, recording active cannibalization of dwarf satellites.'
      ],
      quiz: {
        question: 'Why does the spectrum of the Andromeda Galaxy (M31) show a blueshift instead of the cosmological redshift seen in distant galaxies?',
        options: ['Local Group gravitational attraction pulls M31 toward the Milky Way faster than cosmic expansion on this scale', 'Andromeda is younger than the Milky Way', 'Blue stars absorb all red light'],
        answerIndex: 0,
        explanation: 'Within the virialized Local Group (~1 Mpc radius), mutual gravitational attraction overcomes the Hubble flow, giving M31 a net approach velocity of ~110 km/s toward the Milky Way.'
      }
    }
  },
  {
    id: 'triangulum',
    zone: 'intergalactic',
    name: 'Triangulum Galaxy (M33)',
    category: 'SA(s)cd Spiral Galaxy',
    radius: 195,
    position: [340, 210, -1850],
    rotationSpeed: 0.009,
    visualType: 'galaxy',
    galaxyConfig: { count: 18000, radius: 210, arms: 3, spin: 2.9, coreColor: '#bae6fd', armColor: '#a855f7' },
    nasaUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-33/',
    nasaSourceLabel: 'NASA Hubble — Messier 33 (Triangulum)',
    metrics: {
      distanceLabel: '2.73 Million light-years (837 kpc)',
      radiusKm: '~30,500 light-years radius (~61,000 ly disk)',
      gravity: '~5 × 10¹⁰ Solar Masses (~40 billion stars)',
      temp: 'Pure bulgeless spiral (no central SMBH > 1,500 M☉)',
      period: 'Rotates every ~190 million years'
    },
    explorer: {
      headline: 'The third-largest member of our Local Group—a pure spiral galaxy packed with glowing star nurseries and no central supermassive black hole!',
      bullets: [
        'At 2.73 million light-years away, Triangulum (M33) holds about 40 billion stars in loose, open spiral arms.',
        'Unlike the Milky Way and Andromeda, M33 has almost no central bulge and no giant black hole at its core!',
        'It hosts NGC 604, a monster star-forming nebula 1,500 light-years across—nearly 40 times wider than the Orion Nebula!'
      ],
      quiz: {
        question: 'How does the center of the Triangulum Galaxy (M33) differ from the Milky Way and Andromeda?',
        options: ['It has no central bulge and no detected supermassive black hole', 'It has three supermassive black holes', 'It is made entirely of ice'],
        answerIndex: 0,
        explanation: 'Hubble STIS spectroscopy of M33’s nuclear star cluster set an upper limit of <1,500 solar masses on any central black hole, making it a pure bulgeless disk galaxy.'
      }
    },
    advanced: {
      headline: 'Late-type SA(s)cd bulgeless spiral galaxy (d = 837 kpc) with a tight upper limit on any central black hole (M_BH < 1,500 M☉) and intense H II starburst complexes.',
      bullets: [
        'Third-largest Local Group galaxy (M_★ ≈ 4.8 × 10⁹ M☉, M_halo ≈ 5 × 10¹⁰ M☉) • Likely gravitationally bound to the M31 halo.',
        'HST STIS kinematics of the compact nuclear star cluster rule out any supermassive black hole above ~1.5 × 10³ M☉, making M33 a benchmark for pure-disk galaxy evolution.',
        'Contains NGC 604, a giant H II region (~460 pc diameter) ionized by >200 O-type and Wolf–Rayet stars.'
      ],
      quiz: {
        question: 'What upper limit did Hubble Space Telescope kinematics place on a central black hole in M33?',
        options: ['Less than ~1,500 solar masses (no supermassive black hole)', '10 billion solar masses', 'Exactly 4.3 million solar masses'],
        answerIndex: 0,
        explanation: 'Gebhardt et al. used HST/STIS stellar velocity dispersions to show M33 lacks a supermassive black hole, with an upper bound of ~1,500 M☉.'
      }
    }
  }
];
