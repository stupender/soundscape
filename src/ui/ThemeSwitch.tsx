// DAY / NIGHT — a switch in the top bar, like the moon in the Raga Practice
// Library's.
//
// Until you press it, the app follows the device (light by day, dark at
// night, if the phone is set that way). Pressing it chooses the other theme
// and remembers it on this device. The colours themselves are in
// styles/index.css: every token is defined for both, and
// <html data-theme="light|dark"> picks one.
import { useState } from 'react';
import { readPref, writePref } from '../store/prefs.ts';

type Theme = 'light' | 'dark';

function current(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>(() => readPref<Theme | null>('theme', null) ?? current());

  function flip() {
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    // The phone's status bar colour follows too.
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', next === 'dark' ? '#141414' : '#e0e0e0');
    });
    writePref('theme', next);
    setTheme(next);
  }

  const toNight = theme === 'light';
  return (
    <button className="chip chip--icon" onClick={flip} aria-label={toNight ? 'Switch to night' : 'Switch to day'} title={toNight ? 'Night' : 'Day'}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        {toNight ? (
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
