// LITTLE PREFERENCES — remembered in this browser (localStorage).
//
// Things like the key you chose, your layer levels, which mic you used, and
// whether you've said you're wearing headphones. If the browser won't store
// them (a private window), the app still works; it just forgets.

const PREFIX = 'soundscape.';

export function readPref<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writePref<T>(name: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value));
  } catch {
    /* storage unavailable: forget quietly */
  }
}
