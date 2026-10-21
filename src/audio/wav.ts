// WAV FILES — turning arrays of samples into a file you can open anywhere.
//
// A WAV file is a 44-byte header (what the file holds: how many channels, how
// many samples a second, how many bits per sample) followed by the samples
// themselves, left-right-left-right. We write 24-bit, which is what studios
// use: plenty of room for a quiet take to be turned up later without hiss.

export function encodeWav(channels: Float32Array[], sampleRate: number, bits: 16 | 24 = 24): Blob {
  const n = channels[0].length;
  const ch = channels.length;
  const bytes = bits / 8;
  const dataSize = n * ch * bytes;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const text = (at: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(at + i, s.charCodeAt(i)); };

  text(0, 'RIFF');
  v.setUint32(4, 36 + dataSize, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  v.setUint32(16, 16, true); // size of this "fmt" section
  v.setUint16(20, 1, true); // 1 = plain PCM samples
  v.setUint16(22, ch, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * ch * bytes, true); // bytes per second
  v.setUint16(32, ch * bytes, true); // bytes per frame
  v.setUint16(34, bits, true);
  text(36, 'data');
  v.setUint32(40, dataSize, true);

  let at = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      if (bits === 16) {
        v.setInt16(at, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      } else {
        const x = Math.round(s < 0 ? s * 0x800000 : s * 0x7fffff);
        v.setUint8(at, x & 0xff);
        v.setUint8(at + 1, (x >> 8) & 0xff);
        v.setUint8(at + 2, (x >> 16) & 0xff);
      }
      at += bytes;
    }
  }
  return new Blob([buf], { type: 'audio/wav' });
}

/** Offer a Blob to the person as a file to save. */
export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
