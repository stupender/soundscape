// ASKED ONCE — remembering that we already invited someone to the list, and
// where they came from.
//
// Carried over from Fretboard Constellations (src/ui/asked.ts there): the
// invitation to join the mailing list appears ONCE. Two marks in this browser,
// one for "joined" and one for "said no"; either means don't ask again. Storage
// that never throws, so a private window just means being asked another day,
// never a page that fails.
//
// WHERE THEY CAME FROM: a link like soundscapes.beingsound.studio/?from=voxmundi
// (the one Silvia's students get) is remembered on this device, so that if they
// join the list later, Kit tags them "soundscape-voxmundi" instead of plain
// "soundscape". That's how Stu sees which room each person came through.

const SUBSCRIBED_KEY = 'soundscape.subscribed.v1';
const DISMISSED_KEY = 'soundscape.invited.v1';
const FROM_KEY = 'soundscape.from.v1';

function mark(key: string, value = String(Date.now())): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private window, or storage switched off */
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Have they already joined, or already said no? Then don't ask again. */
export function alreadyAsked(): boolean {
  return read(SUBSCRIBED_KEY) !== null || read(DISMISSED_KEY) !== null;
}

export function hasSubscribed(): boolean {
  return read(SUBSCRIBED_KEY) !== null;
}

export function markSubscribed(): void {
  mark(SUBSCRIBED_KEY);
}

export function markDismissed(): void {
  mark(DISMISSED_KEY);
}

/**
 * Remember ?from=… from the address the first time it's seen (letters,
 * numbers and dashes only, so nothing odd reaches Kit). Call once on load.
 */
export function rememberArrival(): void {
  if (read(FROM_KEY) !== null) return;
  const from = new URLSearchParams(window.location.search).get('from');
  if (!from) return;
  const clean = from.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
  if (clean) mark(FROM_KEY, clean);
}

/** Kit's `source` tag for this device: "soundscape", or "soundscape-<from>". */
export function listSource(): string {
  const from = read(FROM_KEY);
  return from ? `soundscape-${from}` : 'soundscape';
}
