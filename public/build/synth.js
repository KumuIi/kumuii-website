/* synth.js — tiny chiptune engine (Web Audio) shared by all option pages.
   No external assets, no copyrighted audio. Melodies are public-domain /
   original so the player ACTUALLY plays sound on click.            */
(function (global) {
  'use strict';

  // note name -> frequency (equal temperament, A4=440)
  const A4 = 440;
  const NOTE_IDX = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function noteFreq(n) {
    if (n == null || n === 'R') return 0; // rest
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    if (!m) return 0;
    const semis = NOTE_IDX[m[1]] + (parseInt(m[2], 10) + 1) * 12 - 69;
    return A4 * Math.pow(2, semis / 12);
  }

  // ---- Song library. Each: { name, by, tempo(bpm), wave, seq:[ [note,beats], ... ] }
  // Public-domain melodies + originals. Notes are single-voice lead lines.
  const SONGS = {
    odeToJoy: {
      name: 'Ode to Joy', by: 'Beethoven · 1824', tempo: 120, wave: 'square',
      seq: [
        ['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
        ['C4',1],['C4',1],['D4',1],['E4',1],['E4',1.5],['D4',0.5],['D4',2],
        ['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
        ['C4',1],['C4',1],['D4',1],['E4',1],['D4',1.5],['C4',0.5],['C4',2],
      ],
    },
    greensleeves: {
      name: 'Greensleeves', by: 'Trad. · 16th c.', tempo: 90, wave: 'triangle',
      seq: [
        ['A4',1],['C5',1.5],['D5',0.5],['E5',1.5],['F5',0.5],['E5',1],['D5',1.5],['B4',0.5],
        ['G4',1.5],['A4',0.5],['B4',1],['C5',1.5],['A4',0.5],['A4',1],['G#4',0.5],['A4',0.5],['B4',1],['G#4',1],
        ['E4',2],['A4',1],['C5',1.5],['D5',0.5],['E5',1.5],['F5',0.5],['E5',1],['D5',1.5],['B4',0.5],
      ],
    },
    canon: {
      name: 'Canon in D', by: 'Pachelbel · 1680', tempo: 100, wave: 'triangle',
      seq: [
        ['F#5',2],['E5',2],['D5',2],['C#5',2],['B4',2],['A4',2],['B4',2],['C#5',2],
        ['D5',2],['C#5',2],['B4',2],['A4',2],['G4',2],['F#4',2],['G4',2],['E4',2],
      ],
    },
    disputedZone: {
      name: 'DISPUTED_ZONE', by: 'Kumuii · 19XX', tempo: 132, wave: 'sawtooth',
      seq: [
        ['A3',0.5],['R',0.5],['A3',0.5],['C4',0.5],['E4',0.5],['R',0.5],['E4',0.5],['D4',0.5],
        ['F4',0.5],['R',0.5],['E4',0.5],['C4',0.5],['A3',0.5],['R',0.5],['G3',0.5],['A3',0.5],
        ['A3',0.5],['R',0.5],['A3',0.5],['C4',0.5],['E4',0.5],['G4',0.5],['F4',0.5],['E4',0.5],
        ['D4',1],['C4',1],['B3',0.5],['A3',0.5],['A3',1],
      ],
    },
    neonDream: {
      name: 'NEON_DREAM', by: 'Kumuii · 19XX', tempo: 116, wave: 'square',
      seq: [
        ['C5',0.5],['E5',0.5],['G5',0.5],['E5',0.5],['A4',0.5],['C5',0.5],['E5',0.5],['C5',0.5],
        ['F4',0.5],['A4',0.5],['C5',0.5],['A4',0.5],['G4',0.5],['B4',0.5],['D5',0.5],['G5',0.5],
        ['C5',0.5],['E5',0.5],['G5',0.5],['E5',0.5],['A4',0.5],['C5',0.5],['E5',0.5],['C5',0.5],
        ['F4',0.5],['A4',0.5],['D5',1],['G4',0.5],['C5',1.5],
      ],
    },
  };

  function ChipSynth() {
    this.ctx = null;
    this.timer = null;
    this.master = null;
    this.onStep = null;   // (index, total) => void
    this.onEnd = null;
    this.playing = false;
    this.songId = null;
  }
  ChipSynth.prototype._ensure = function () {
    if (!this.ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  };
  ChipSynth.prototype.setVolume = function (v) {
    this._ensure();
    this.master.gain.value = Math.max(0, Math.min(1, v)) * 0.4;
  };
  ChipSynth.prototype._note = function (freq, t, dur, wave) {
    if (!freq) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = wave || 'square';
    o.frequency.setValueAtTime(freq, t);
    const a = 0.01, r = Math.min(0.12, dur * 0.4);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + a);
    g.gain.setValueAtTime(1, t + Math.max(a, dur - r));
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  };
  ChipSynth.prototype.play = function (songId) {
    this._ensure();
    this.stop();
    const song = SONGS[songId];
    if (!song) return;
    this.songId = songId;
    this.playing = true;
    const spb = 60 / song.tempo; // seconds per beat
    const seq = song.seq;
    let i = 0;
    const startBase = this.ctx.currentTime + 0.06;
    let acc = 0;
    const times = [];
    for (let k = 0; k < seq.length; k++) {
      times.push(acc);
      this._note(noteFreq(seq[k][0]), startBase + acc, seq[k][1] * spb * 0.96, song.wave);
      acc += seq[k][1] * spb;
    }
    const total = acc;
    const self = this;
    const t0 = performance.now();
    function tick() {
      if (!self.playing) return;
      const elapsed = (performance.now() - t0) / 1000;
      while (i < times.length && elapsed >= times[i]) {
        if (self.onStep) self.onStep(i, seq.length);
        i++;
      }
      if (elapsed >= total) {
        // loop
        i = 0;
        self.play(self.songId);
        return;
      }
      self.timer = requestAnimationFrame(tick);
    }
    this.timer = requestAnimationFrame(tick);
  };
  ChipSynth.prototype.stop = function () {
    this.playing = false;
    if (this.timer) cancelAnimationFrame(this.timer);
    this.timer = null;
    if (this.onEnd) this.onEnd();
  };

  global.ChipSynth = ChipSynth;
  global.CHIP_SONGS = SONGS;
})(window);
