// NOW PLAYING — what the phone's lock screen and Control Center show.
//
// The Media Session API lets a page say what's playing (a title, an artist,
// a picture) and answer the lock screen's play and pause buttons. Here, the
// title is the layers that are sounding; pause quiets them all and play
// brings them back, the same as the speaker button in the Soundscape panel.
//
// On an iPhone this appears while the page's sound counts as music playback
// (see iosSession.ts). Browsers without the API simply skip it.

interface NowPlaying {
  /** Names of the layers that are sounding (empty when it's all quiet). */
  layers: string[];
  keyName: string;
  /** Lock-screen pause: quiet everything. */
  onPause: () => void;
  /** Lock-screen play: bring back what was playing. */
  onPlay: () => void;
}

export function showNowPlaying({ layers, keyName, onPause, onPlay }: NowPlaying): void {
  if (!('mediaSession' in navigator)) return;
  const ms = navigator.mediaSession;
  const playing = layers.length > 0;
  const base = import.meta.env.BASE_URL;
  ms.metadata = new MediaMetadata({
    title: playing ? layers.join(' · ') : 'Soundscape',
    artist: 'Soundscape · Being Sound Studio',
    album: `Key ${keyName}`,
    artwork: [{ src: `${base}images/point-reyes.jpg`, sizes: '1200x900', type: 'image/jpeg' }],
  });
  ms.playbackState = playing ? 'playing' : 'paused';
  try {
    ms.setActionHandler('pause', onPause);
    ms.setActionHandler('stop', onPause);
    ms.setActionHandler('play', onPlay);
  } catch {
    /* an older browser that doesn't know one of these actions */
  }
}
