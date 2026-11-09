// SUBSCRIBE — the one place this app asks for anything.
//
// Carried over from Fretboard Constellations (src/ui/Subscribe.tsx there),
// which follows the same rules. Posts an email address to Stu's Kit list: the
// same list and the same form as the Being Sound site, tagged with Kit's
// `source` field ("soundscape", or "soundscape-voxmundi" etc., see
// store/asked.ts) so Kit can send each door its own welcome email.
//
// NO API KEY, and none is missing: Kit's form endpoint is public by design.
//
// WHERE IT'S ASKED MATTERS. There's no signup wall in front of this app: the
// app itself is the gift. It appears in two places, both after someone has
// decided they care:
//   invitation — once, right after the FIRST take is saved, because then the
//                reason is true: takes live in this browser only.
//   footer     — quiet and permanent, for everyone else.
// Asked once, then never again: joining or dismissing is remembered.
import { useState } from 'react';
import { listSource, markSubscribed } from '../store/asked.ts';

const ENDPOINT = 'https://app.kit.com/forms/9739307/subscriptions';

/** Deliberately loose: catch typos, never reject a real address. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type Status = 'idle' | 'sending' | 'done' | 'error';

export function Subscribe({ variant, onClose }: { variant: 'invitation' | 'footer'; onClose?: () => void }) {
  const [email, setEmail] = useState('');
  // The honeypot: a field no person can see, so anything in it came from a bot.
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending' || status === 'done') return;
    if (trap !== '') { setStatus('done'); return; }
    if (!looksLikeEmail(email)) { setStatus('error'); return; }

    setStatus('sending');
    const body = new URLSearchParams();
    body.set('email_address', email.trim());
    body.set('fields[source]', listSource());
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        // `Accept` is NOT optional: without it Kit answers with an HTML page and
        // a signup that worked looks like a failure. (Learned on the website.)
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: body.toString(),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus('done');
      markSubscribed();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className={`subscribe subscribe--${variant} subscribe--done`}>
        <p className="subscribe-thanks">
          {variant === 'invitation'
            ? 'You’re on the list. Thank you. Look out for a welcome note from Stu.'
            : 'You’re on the list. Thank you.'}
        </p>
        {onClose && <button className="text-btn" onClick={onClose}>Close</button>}
      </div>
    );
  }

  return (
    <form className={`subscribe subscribe--${variant}`} onSubmit={submit} noValidate>
      {variant === 'invitation' && (
        <>
          <div className="subscribe-head">
            <span className="label">Saved, on this device</span>
            {onClose && <button type="button" className="text-btn" onClick={onClose}>Not now</button>}
          </div>
          <p className="subscribe-blurb">
            Your takes live in this browser only. Leave your email and Stu will write
            when they can follow you, with a practice now and then, and invitations to
            workshops and Sound Sessions.
          </p>
        </>
      )}
      <div className="subscribe-row">
        <input
          className="line-field subscribe-field"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Your email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
        />
        {/* The honeypot: hidden from people, filled by bots. */}
        <input className="subscribe-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} />
        <button className="btn btn--small btn--primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Join'}
        </button>
      </div>
      {status === 'error' && <p className="error">Please check the address and try again.</p>}
    </form>
  );
}
