export class SpaceAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.masterGain = null;
    this.subOsc1 = null;
    this.subOsc2 = null;
    this.turbineFilter = null;
    this.turbineGain = null;
    this.boostFilter = null;
    this.boostGain = null;
    this.wasBoosting = false;
  }

  toggle() {
    if (!this.ctx) {
      this._init();
    }
    this.enabled = !this.enabled;
    if (this.enabled && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.enabled ? 0.32 : 0, this.ctx.currentTime, 0.18);
    }
    return this.enabled;
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
    compressor.threshold.value = -16;
    compressor.ratio.value = 3;
    this.masterGain.connect(compressor);
    compressor.connect(this.ctx.destination);

    const convolver = this.ctx.createConvolver();
    convolver.buffer = this._createImpulseResponse(3.2, 2.5);
    const reverbGain = this.ctx.createGain();
    reverbGain.value = 0.38;
    convolver.connect(reverbGain);
    reverbGain.connect(this.masterGain);

    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 340;
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.16;
    padFilter.connect(padGain);
    padGain.connect(this.masterGain);
    padGain.connect(convolver);

    const padFreqs = [55.0, 82.41, 110.0, 164.81, 246.94];
    padFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (idx - 2) * 4.5;
      const g = this.ctx.createGain();
      g.gain.value = 0.18 / (idx * 0.4 + 1);
      osc.connect(g);
      g.connect(padFilter);
      osc.start();
    });

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);
    lfo.start();

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.value = 135;
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.28;
    subFilter.connect(subGain);
    subGain.connect(this.masterGain);

    this.subOsc1 = this.ctx.createOscillator();
    this.subOsc1.type = 'sawtooth';
    this.subOsc1.frequency.value = 46;
    this.subOsc1.detune.value = -6;

    this.subOsc2 = this.ctx.createOscillator();
    this.subOsc2.type = 'triangle';
    this.subOsc2.frequency.value = 46;
    this.subOsc2.detune.value = 6;

    this.subOsc1.connect(subFilter);
    this.subOsc2.connect(subFilter);
    this.subOsc1.start();
    this.subOsc2.start();

    const noiseBuffer = this._createPinkNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    this.turbineFilter = this.ctx.createBiquadFilter();
    this.turbineFilter.type = 'bandpass';
    this.turbineFilter.frequency.value = 220;
    this.turbineFilter.Q.value = 2.4;

    this.turbineGain = this.ctx.createGain();
    this.turbineGain.gain.value = 0.22;

    noiseSource.connect(this.turbineFilter);
    this.turbineFilter.connect(this.turbineGain);
    this.turbineGain.connect(this.masterGain);
    this.turbineGain.connect(convolver);

    this.boostFilter = this.ctx.createBiquadFilter();
    this.boostFilter.type = 'lowpass';
    this.boostFilter.frequency.value = 680;
    this.boostGain = this.ctx.createGain();
    this.boostGain.gain.value = 0.0;

    noiseSource.connect(this.boostFilter);
    this.boostFilter.connect(this.boostGain);
    this.boostGain.connect(this.masterGain);

    noiseSource.start();
  }

  _triggerBoostIgnition() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.45);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  playDiscoveryChime() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.12, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.48);
    });
  }

  update(speedRatio, isBoosting) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (isBoosting && !this.wasBoosting) {
      this._triggerBoostIgnition();
    }
    this.wasBoosting = isBoosting;

    const baseFreq = 44 + speedRatio * 28 + (isBoosting ? 24 : 0);
    this.subOsc1.frequency.setTargetAtTime(baseFreq, now, 0.12);
    this.subOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.12);

    const jetCutoff = 180 + speedRatio * 420 + (isBoosting ? 520 : 0);
    this.turbineFilter.frequency.setTargetAtTime(jetCutoff, now, 0.1);
    this.turbineGain.gain.setTargetAtTime(0.14 + speedRatio * 0.24 + (isBoosting ? 0.18 : 0), now, 0.1);

    this.boostGain.gain.setTargetAtTime(isBoosting ? 0.34 : 0.0, now, 0.15);
  }
}
