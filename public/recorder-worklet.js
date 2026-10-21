// THE RECORDER WORKLET — runs on the audio thread and catches every sample.
//
// It has two inputs:
//   input 0 — the voice (we keep the first channel: one mic, one track)
//   input 1 — the soundscape (we keep left and right)
// Because both arrive in the same 128-sample block, the two tracks are lined
// up to the sample — the reason this is one worklet with two inputs rather
// than two separate recorders.
//
// Samples are gathered into chunks of 8192 and posted to the page. When told
// to stop, it posts what's left and then { done: true }.
//
// Plain JavaScript (not TypeScript) because the browser loads it directly as
// its own little module, outside the app's build.

const CHUNK = 8192;

class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.recording = false;
    this.fill = 0;
    this.fresh();
    this.port.onmessage = (e) => {
      if (e.data === 'start') {
        this.fresh();
        this.recording = true;
      } else if (e.data === 'stop') {
        this.recording = false;
        this.flush();
        this.port.postMessage({ done: true });
      }
    };
  }

  fresh() {
    this.voice = new Float32Array(CHUNK);
    this.left = new Float32Array(CHUNK);
    this.right = new Float32Array(CHUNK);
    this.fill = 0;
  }

  flush() {
    if (this.fill === 0) return;
    const n = this.fill;
    const voice = this.voice.slice(0, n);
    const left = this.left.slice(0, n);
    const right = this.right.slice(0, n);
    this.port.postMessage({ voice, left, right }, [voice.buffer, left.buffer, right.buffer]);
    this.fresh();
  }

  process(inputs) {
    if (!this.recording) return true;
    const v = inputs[0] && inputs[0][0];
    const bed = inputs[1] || [];
    const l = bed[0];
    const r = bed[1] || bed[0];
    const frames = (v && v.length) || (l && l.length) || 128;
    for (let i = 0; i < frames; i++) {
      this.voice[this.fill] = v ? v[i] : 0;
      this.left[this.fill] = l ? l[i] : 0;
      this.right[this.fill] = r ? r[i] : 0;
      this.fill++;
      if (this.fill === CHUNK) this.flush();
    }
    return true;
  }
}

registerProcessor('recorder', RecorderProcessor);
