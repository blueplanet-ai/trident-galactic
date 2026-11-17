const ZONE_AMBIENCE = {
  solar: {
    freqs: [55.0, 82.41, 110.0, 164.81, 246.94],
    cutoff: 340,
    lfoRate: 0.09,
    lfoDepth: 135
  },
  stellar: {
    freqs: [65.41, 98.0, 146.83, 196.0, 293.66],
    cutoff: 430,
    lfoRate: 0.13,
    lfoDepth: 165
  },
  milkyway: {
    freqs: [49.0, 73.42, 98.0, 146.83, 220.0],
    cutoff: 270,
    lfoRate: 0.06,
    lfoDepth: 110
  },
  intergalactic: {
    freqs: [43.65, 65.41, 103.83, 130.81, 196.0],
    cutoff: 310,
    lfoRate: 0.05,
    lfoDepth: 120
  }
};

export class SpaceAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.volume = 0.75;
    this.zone = 'solar';

    this.masterGain = null;
    this.reverbGain = null;
    this.padOscs = [];
    this.padFilter = null;
    this.padLfo = null;
    this.padLfoGain = null;

    this.subOsc1 = null;
    this.subOsc2 = null;
    this.subGain = null;
    this.turbineFilter = null;
    this.turbineGain = null;
    this.boostFilter = null;
    this.boostGain = null;

    this.retroFilter = null;
    this.retroBodyOsc = null;
    this.retroBodyGain = null;
    this.retroGain = null;

    this.gravOsc = null;
    this.gravGain = null;

    this.pinkNoiseBuffer = null;
    this.wasBoosting = false;
    this._suspendTimer = null;
    this._lastRcsAt = 0;
    this._lastPulsarAt = 0;
    this._lastFuelWarnAt = 0;
    this._lastShieldAt = 0;
  }

  toggle() {
    if (!this.ctx) {
      this._init();
    }
    this.enabled = !this.enabled;
    clearTimeout(this._suspendTimer);

    if (this.enabled) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this._applyZoneAmbience(0.15);
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(this.volume * 0.42, this.ctx.currentTime, 0.14);
      }
    } else {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      }
      this._suspendTimer = setTimeout(() => {
        if (!this.enabled && this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      }, 320);
    }
    return this.enabled;
  }

  setVolume(normVol) {
    this.volume = Math.max(0, Math.min(1, normVol));
    if (this.masterGain && this.ctx && this.enabled) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.42, this.ctx.currentTime, 0.06);
    }
  }

  setZone(zoneId) {
    if (!ZONE_AMBIENCE[zoneId]) return;
    this.zone = zoneId;
    this._applyZoneAmbience(0.65);
  }

  _applyZoneAmbience(tau = 0.65) {
    if (!this.ctx || this.padOscs.length === 0) return;
    const preset = ZONE_AMBIENCE[this.zone] || ZONE_AMBIENCE.solar;
    const now = this.ctx.currentTime;
    this.padOscs.forEach((osc, i) => {
      if (preset.freqs[i]) {
        osc.frequency.setTargetAtTime(preset.freqs[i], now, tau);
      }
    });
    if (this.padFilter) {
      this.padFilter.frequency.setTargetAtTime(preset.cutoff, now, tau);
    }
    if (this.padLfo) {
      this.padLfo.frequency.setTargetAtTime(preset.lfoRate, now, tau);
    }
    if (this.padLfoGain) {
      this.padLfoGain.gain.setTargetAtTime(preset.lfoDepth, now, tau);
    }
  }

  _createImpulseResponse(duration = 2.8, decay = 2.4) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  _createPinkNoiseBuffer() {
    const rate = this.ctx.sampleRate;
    const length = rate * 4;
    const buffer = this.ctx.createBuffer(1, length, rate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  _init() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;

    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.ratio.value = 3.5;
    this.masterGain.connect(compressor);
    compressor.connect(this.ctx.destination);

    const convolver = this.ctx.createConvolver();
    convolver.buffer = this._createImpulseResponse(3.0, 2.5);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.34;
    convolver.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    // 1. Zone-Reactive Cosmic Ambient Pad
    const preset = ZONE_AMBIENCE[this.zone] || ZONE_AMBIENCE.solar;
    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = preset.cutoff;
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.17;
    this.padFilter.connect(padGain);
    padGain.connect(this.masterGain);
    padGain.connect(convolver);

    this.padOscs = [];
    preset.freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (idx - 2) * 4.5;
      const g = this.ctx.createGain();
      g.gain.value = 0.18 / (idx * 0.4 + 1);
      osc.connect(g);
      g.connect(this.padFilter);
      osc.start();
      this.padOscs.push(osc);
    });

    this.padLfo = this.ctx.createOscillator();
    this.padLfo.frequency.value = preset.lfoRate;
    this.padLfoGain = this.ctx.createGain();
    this.padLfoGain.gain.value = preset.lfoDepth;
    this.padLfo.connect(this.padLfoGain);
    this.padLfoGain.connect(this.padFilter.frequency);
    this.padLfo.start();

    // 2. Main Ion Drive Sub-Bass Reactor
    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.value = 140;
    this.subGain = this.ctx.createGain();
    this.subGain.gain.value = 0.06;
    subFilter.connect(this.subGain);
    this.subGain.connect(this.masterGain);

    this.subOsc1 = this.ctx.createOscillator();
    this.subOsc1.type = 'sawtooth';
    this.subOsc1.frequency.value = 44;
    this.subOsc1.detune.value = -6;

    this.subOsc2 = this.ctx.createOscillator();
    this.subOsc2.type = 'triangle';
    this.subOsc2.frequency.value = 66;
    this.subOsc2.detune.value = 6;

    this.subOsc1.connect(subFilter);
    this.subOsc2.connect(subFilter);
    this.subOsc1.start();
    this.subOsc2.start();

    // Shared Pink Noise Loop
    this.pinkNoiseBuffer = this._createPinkNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.pinkNoiseBuffer;
    noiseSource.loop = true;

    // 3. Main Ion Turbine Bandpass
    this.turbineFilter = this.ctx.createBiquadFilter();
    this.turbineFilter.type = 'bandpass';
    this.turbineFilter.frequency.value = 210;
    this.turbineFilter.Q.value = 2.2;

    this.turbineGain = this.ctx.createGain();
    this.turbineGain.gain.value = 0.02;

    noiseSource.connect(this.turbineFilter);
    this.turbineFilter.connect(this.turbineGain);
    this.turbineGain.connect(this.masterGain);
    this.turbineGain.connect(convolver);

    // 4. Hyper-Boost Lowpass Surge
    this.boostFilter = this.ctx.createBiquadFilter();
    this.boostFilter.type = 'lowpass';
    this.boostFilter.frequency.value = 720;
    this.boostGain = this.ctx.createGain();
    this.boostGain.gain.value = 0.0;

    noiseSource.connect(this.boostFilter);
    this.boostFilter.connect(this.boostGain);
    this.boostGain.connect(this.masterGain);

    // 5. Front Wing Retro-Thruster / RCS Damper Voice (higher-pitched crisp jet hiss)
    this.retroFilter = this.ctx.createBiquadFilter();
    this.retroFilter.type = 'bandpass';
    this.retroFilter.frequency.value = 920;
    this.retroFilter.Q.value = 1.8;

    this.retroGain = this.ctx.createGain();
    this.retroGain.gain.value = 0.0;

    noiseSource.connect(this.retroFilter);
    this.retroFilter.connect(this.retroGain);
    this.retroGain.connect(this.masterGain);
    this.retroGain.connect(convolver);

    this.retroBodyOsc = this.ctx.createOscillator();
    this.retroBodyOsc.type = 'triangle';
    this.retroBodyOsc.frequency.value = 112;
    this.retroBodyGain = this.ctx.createGain();
    this.retroBodyGain.gain.value = 0.0;
    this.retroBodyOsc.connect(this.retroBodyGain);
    this.retroBodyGain.connect(this.masterGain);
    this.retroBodyOsc.start();

    noiseSource.start();

    // 6. Gravitational Sub-Harmonic Proximity Drone (Black Hole / Massive Objects)
    this.gravOsc = this.ctx.createOscillator();
    this.gravOsc.type = 'sine';
    this.gravOsc.frequency.value = 34;
    this.gravGain = this.ctx.createGain();
    this.gravGain.gain.value = 0.0;
    this.gravOsc.connect(this.gravGain);
    this.gravGain.connect(this.masterGain);
    this.gravOsc.start();
  }

  _triggerBoostIgnition() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.45);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  _triggerRcsPuff(pan = 0) {
    if (!this.ctx || !this.enabled || !this.pinkNoiseBuffer) return;
    const now = this.ctx.currentTime;
    if (now - this._lastRcsAt < 0.15) return;
    this._lastRcsAt = now;

    const src = this.ctx.createBufferSource();
    src.buffer = this.pinkNoiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1480;
    filter.Q.value = 2.6;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    src.connect(filter);
    filter.connect(gain);
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-0.9, Math.min(0.9, pan)), now);
      gain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      gain.connect(this.masterGain);
    }

    src.start(now, Math.random() * 2.5, 0.09);
  }

  _triggerPulsarTick(proximity) {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    if (now - this._lastPulsarAt < 0.62) return;
    this._lastPulsarAt = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1320, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.045);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04 * proximity, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  _triggerLowFuelPing() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    if (now - this._lastFuelWarnAt < 3.6) return;
    this._lastFuelWarnAt = now;

    [0, 0.14].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, now + offset);
      gain.gain.setValueAtTime(0.001, now + offset);
      gain.gain.linearRampToValueAtTime(0.055, now + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  playDiscoveryChime() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.11, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.48);
    });
  }

  playQuizWrong() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    [293.66, 246.94].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.11);
      gain.gain.setValueAtTime(0.075, now + i * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.24);
    });
  }

  playUiClick(variant = 'on') {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const startHz = variant === 'off' || variant === 'coast' ? 680 : 880;
    const endHz = variant === 'off' || variant === 'coast' ? 460 : 1180;
    osc.frequency.setValueAtTime(startHz, now);
    osc.frequency.exponentialRampToValueAtTime(endHz, now + 0.055);
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playAutopilotEngage() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    [587.33, 880.0].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.075);
      gain.gain.setValueAtTime(0.07, now + i * 0.075);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.075 + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.075);
      osc.stop(now + i * 0.075 + 0.2);
    });
  }

  playOrbitLock() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    [392.0, 587.33].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.38);
    });
  }

  playWarpJump() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(84, now + 0.44);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.48);

    if (this.pinkNoiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.pinkNoiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(240, now + 0.45);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.18, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);
      src.start(now, 0, 0.48);
    }
  }

  playShieldBump() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    if (now - this._lastShieldAt < 0.42) return;
    this._lastShieldAt = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.exponentialRampToValueAtTime(46, now + 0.18);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  update(state, proximity = null) {
    if (!this.enabled || !this.ctx || !state) return;
    const now = this.ctx.currentTime;

    const isBoosting = Boolean(state.isBoosting);
    if (isBoosting && !this.wasBoosting) {
      this._triggerBoostIgnition();
    }
    this.wasBoosting = isBoosting;

    const fwd = state.forwardThrust || 0;
    const retro = state.retroThrust || 0;
    const speedRatio = Math.min(1, (state.speedMag || 0) / 80);
    const drive = Math.max(fwd, isBoosting ? 1.0 : 0);

    // Main Ion Drive: quiet standby hum when coasting (COAST OFF), rich harmonic roar when thrusting
    const baseFreq = 42 + drive * 20 + speedRatio * 14 + (isBoosting ? 24 : 0);
    this.subOsc1.frequency.setTargetAtTime(baseFreq, now, 0.12);
    this.subOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.12);
    this.subGain.gain.setTargetAtTime(0.055 + drive * 0.23 + (isBoosting ? 0.14 : 0), now, 0.1);

    const jetCutoff = 200 + drive * 360 + speedRatio * 140 + (isBoosting ? 480 : 0);
    this.turbineFilter.frequency.setTargetAtTime(jetCutoff, now, 0.1);
    this.turbineGain.gain.setTargetAtTime(0.015 + drive * 0.26 + (isBoosting ? 0.16 : 0), now, 0.1);

    this.boostGain.gain.setTargetAtTime(isBoosting ? 0.32 : 0.0, now, 0.14);

    // Front Wing Retro-Thrusters / RCS Damper hiss
    this.retroFilter.frequency.setTargetAtTime(840 + retro * 520, now, 0.08);
    this.retroGain.gain.setTargetAtTime(retro > 0.03 ? 0.04 + retro * 0.25 : 0.0, now, 0.07);
    this.retroBodyGain.gain.setTargetAtTime(retro > 0.03 ? retro * 0.065 : 0.0, now, 0.07);

    // Stereo-panned RCS Attitude Thruster Puffs
    if (state.steerActive) {
      this._triggerRcsPuff(state.steerPan || 0);
    }

    if (state.shieldBump) {
      this.playShieldBump();
    }

    if (state.fuel < 15 && (fwd > 0.1 || retro > 0.1)) {
      this._triggerLowFuelPing();
    }

    // Destination Proximity Signatures
    let gravLevel = 0;
    if (proximity && proximity.id === 'sagittarius-a' && proximity.dist < 520) {
      gravLevel = (1 - proximity.dist / 520) * 0.16;
    } else if (proximity && proximity.visualType === 'star' && proximity.dist < 260) {
      gravLevel = (1 - proximity.dist / 260) * 0.07;
    }
    this.gravGain.gain.setTargetAtTime(gravLevel, now, 0.2);

    if (proximity && proximity.id === 'crab-nebula' && proximity.dist < 420) {
      this._triggerPulsarTick(1 - proximity.dist / 420);
    }
  }
}
