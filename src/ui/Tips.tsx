// THE TIPS DRAWER — best practices for recording on whatever you have.
// Content is in data/tips.ts. Opens on the section that fits your device.
import { useEffect } from 'react';
import { TIPS } from '../data/tips.ts';

interface Props {
  section: string;
  setSection: (id: string) => void;
  onClose: () => void;
}

/** A first guess at which section fits this device. */
export function guessSection(): string {
  const ua = navigator.userAgent;
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ipad';
  if (/iPhone|Android/.test(ua)) return 'phone';
  return 'laptop';
}

export function Tips({ section, setSection, onClose }: Props) {
  const current = TIPS.find((t) => t.id === section) ?? TIPS[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="scrim scrim--drawer" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="tips-h" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-head">
          <span className="panel-num">?</span>
          <h2 id="tips-h">Recording well</h2>
          <button className="text-btn" onClick={onClose} autoFocus>Close</button>
        </header>
        <nav className="tip-tabs" aria-label="Topics">
          {TIPS.map((t) => (
            <button key={t.id} className={`chip ${t.id === current.id ? 'chip--on' : ''}`} onClick={() => setSection(t.id)} aria-pressed={t.id === current.id}>
              {t.name}
            </button>
          ))}
        </nav>
        <p className="tip-intro">{current.intro}</p>
        <ol className="tip-list">
          {current.tips.map((tip, i) => (
            <li key={tip.title}>
              <span className="tip-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{tip.title}</h3>
                <p>{tip.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
