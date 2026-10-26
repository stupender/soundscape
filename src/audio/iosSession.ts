// PLAYING THROUGH THE SILENT SWITCH — so the soundscape is heard on an iPhone
// with its ringer off, the way Spotify or Apple Music are.
//
// iOS sorts sound into kinds. A web page's sound is "ambient" by default (like
// a game's sound effects), and the ring/silent switch mutes ambient sound.
// Music apps declare themselves "playback", which the switch leaves alone.
//
//   NEW WAY (Safari on iOS 16.4 and later): the Audio Session API lets the page
//   say so itself: navigator.audioSession.type = 'playback'. While the mic is
//   on it becomes 'play-and-record' instead (set in mic.ts), which is also
//   unaffected by the switch.
//
//   OLDER IPHONES: a tiny silent sound playing through an <audio> element on a
//   loop. An <audio> element counts as media playback, and while one plays the
//   whole page, Web Audio included, is treated as playback too.
//
// Both must start from a tap; getEngine() (engine.ts) is always called from
// one, and it calls playThroughSilentSwitch().
import { encodeWav } from './wav.ts';

type SessionType = 'playback' | 'play-and-record' | 'auto';
type Nav = Navigator & { audioSession?: { type: string } };

let keepAlive: HTMLAudioElement | null = null;

/** Tell iOS which kind of sound this is, where the browser allows it. */
export function setAudioSessionType(type: SessionType): void {
  const nav = navigator as Nav;
  if (nav.audioSession) nav.audioSession.type = type;
}

/** Call from a tap: make the page's sound play even with the ringer off. */
export function playThroughSilentSwitch(): void {
  const nav = navigator as Nav;
  if (nav.audioSession) {
    setAudioSessionType('playback');
    return;
  }
  // Only iPhones and iPads need the fallback.
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  if (!ios || keepAlive) return;
  // Half a second of silence, as a WAV, looping quietly forever.
  const silence = encodeWav([new Float32Array(22050)], 44100, 16);
  keepAlive = new Audio(URL.createObjectURL(silence));
  keepAlive.loop = true;
  keepAlive.setAttribute('playsinline', '');
  void keepAlive.play().catch(() => { keepAlive = null; });
}
