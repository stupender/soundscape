// ONE TAKE — listen, balance, export, share.
//
// The two faders (voice, soundscape) move live while it plays. Auto-balance
// sets them for you as a starting point. Export renders the mix you hear.
// Share opens the device's share sheet (Google Drive, Files, AirDrop…).
// Each take remembers its own mix on this device.
import { useEffect, useState } from 'react';
import { autoBalance, canShareFiles, mixFile, shareFile, type Format, type MixSettings } from '../audio/mixdown.ts';
import { decodeTake, playTake, positionOf, stopTake, updateMix } from '../audio/takePlayer.ts';
import { download } from '../audio/wav.ts';
import type { Take } from '../store/db.ts';
import { readPref, writePref } from '../store/prefs.ts';
import { dbText } from './format.ts';

interface Props {
  take: Take;
  /** Its number, oldest = 01, like the Raga Practice Library's rows. */
  number: number;
  open: boolean;
  onOpen: () => void;
  onDelete: () => void;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const fileBase = (t: Take) => `${t.name.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-')}-${new Date(t.createdAt).toISOString().slice(0, 10)}`;

export function TakeRow({ take, number, open, onOpen, onDelete }: Props) {
  const [mix, setMix] = useState<MixSettings>(() => readPref(`mix.${take.id}`, { voiceDb: 0, bedDb: 0, tidy: false }));
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [busy, setBusy] = useState('');
  const [format, setFormat] = useState<Format>(() => readPref('export.format', 'mp3'));
  const [confirmDelete, setConfirmDelete] = useState(false);
  // A mix rendered for sharing. Phones only open the share sheet straight
  // after a tap, so a slow render is kept here and "Share now" sends it.
  const [ready, setReady] = useState<Blob | null>(null);

  function change(next: Partial<MixSettings>) {
    const m = { ...mix, ...next };
    setMix(m);
    setReady(null);
    writePref(`mix.${take.id}`, m);
    updateMix(m);
  }

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const p = positionOf(take.id);
      if (p === null) { setPlaying(false); return; }
      setPos(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, take.id]);

  async function play(from = pos) {
    await playTake(take, mix, from >= take.seconds - 0.1 ? 0 : from, () => { setPlaying(false); setPos(0); });
    setPlaying(true);
  }

  function stop() {
    stopTake();
    setPlaying(false);
  }

  function seek(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const at = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * take.seconds;
    setPos(at);
    if (playing) void play(at);
  }

  async function balance() {
    setBusy('listening…');
    const { voice, bed } = await decodeTake(take);
    change({ ...autoBalance(voice, bed) });
    setBusy('');
  }

  async function makeMix(): Promise<Blob> {
    const { voice, bed } = await decodeTake(take);
    return mixFile(voice, bed, mix, format);
  }

  async function exportMix() {
    setBusy('mixing…');
    try { download(await makeMix(), `${fileBase(take)}.${format}`); } finally { setBusy(''); }
  }

  async function share() {
    const name = `${fileBase(take)}.${format}`;
    if (ready) {
      await shareFile(ready, name, take.name);
      return;
    }
    setBusy('mixing…');
    const started = performance.now();
    try {
      const blob = await makeMix();
      // Quick enough that the tap still counts: share straight away.
      if (performance.now() - started < 900) await shareFile(blob, name, take.name);
      else setReady(blob);
    } finally {
      setBusy('');
    }
  }

  function chooseFormat(f: Format) {
    setReady(null);
    setFormat(f);
    writePref('export.format', f);
  }

  const when = new Date(take.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <li className={`take ${open ? 'take--open' : ''}`}>
      <div className="take-head">
        <span className="take-num">{String(number).padStart(2, '0')}</span>
        <button className={`take-play ${playing ? 'take-play--on' : ''}`} onClick={() => (playing ? stop() : play())} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 1.5 L3.5 10.5 M8.5 1.5 L8.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5 L10.5 6 L3 10.5 Z" fill="currentColor" /></svg>
          )}
        </button>
        <button className="take-title" onClick={onOpen} aria-expanded={open}>
          <span className="take-name">{take.name}</span>
          <span className="take-meta">{when} · {clock(take.seconds)}</span>
        </button>
        <button className={`take-toggle ${open ? 'take-toggle--open' : ''}`} onClick={onOpen} aria-expanded={open} aria-label={open ? 'Close the mixer' : 'Open the mixer'}>
          <span>Mix</span>
          <svg className="caret" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
      </div>
      <div className="take-bar" onPointerDown={seek} role="slider" aria-label="Position" aria-valuemin={0} aria-valuemax={take.seconds} aria-valuenow={pos}>
        <div className="take-bar-fill" style={{ width: `${(pos / take.seconds) * 100}%` }} />
      </div>

      {open && (
        <div className="take-body">
          <label className="fader-row">
            <span className="label">Voice</span>
            <input type="range" min={-30} max={18} step={0.5} value={mix.voiceDb} onChange={(e) => change({ voiceDb: Number(e.target.value) })} className="slider slider--voice" />
            <span className="value">{dbText(mix.voiceDb, 1)}</span>
          </label>
          <label className="fader-row">
            <span className="label">Soundscape</span>
            <input type="range" min={-30} max={18} step={0.5} value={mix.bedDb} onChange={(e) => change({ bedDb: Number(e.target.value) })} className="slider" />
            <span className="value">{dbText(mix.bedDb, 1)}</span>
          </label>
          <div className="switches">
            <button className="btn btn--small" onClick={balance} disabled={!!busy}>Auto-balance</button>
            <label className="switch">
              <input type="checkbox" checked={mix.tidy} onChange={(e) => change({ tidy: e.target.checked })} />
              <span className="switch-text">
                <span>Low cut · 80 Hz</span>
                <span className="switch-hint">High-pass filter on the voice: removes rumble, wind and handling noise</span>
              </span>
            </label>
          </div>

          <div className="export-row">
            <div className="seg" role="radiogroup" aria-label="File type">
              {(['mp3', 'wav'] as Format[]).map((f) => (
                <button key={f} role="radio" aria-checked={format === f} className={`seg-btn ${format === f ? 'seg-btn--on' : ''}`} onClick={() => chooseFormat(f)}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="btn btn--primary btn--small" onClick={exportMix} disabled={!!busy}>Export mix</button>
            {canShareFiles() && (
              <button className="btn btn--small" onClick={share} disabled={!!busy}>{ready ? 'Share now' : 'Share…'}</button>
            )}
            {busy && <span className="quiet">{busy}</span>}
          </div>
          <div className="export-row export-row--quiet">
            <span className="label">Separate tracks</span>
            <button className="text-btn" onClick={() => download(take.voice, `${fileBase(take)}-voice.wav`)}>Voice.wav</button>
            <button className="text-btn" onClick={() => download(take.bed, `${fileBase(take)}-soundscape.wav`)}>Soundscape.wav</button>
            <span className="spacer" />
            {confirmDelete ? (
              <>
                <button className="text-btn text-btn--danger" onClick={onDelete}>Delete for good</button>
                <button className="text-btn" onClick={() => setConfirmDelete(false)}>Keep</button>
              </>
            ) : (
              <button className="text-btn" onClick={() => setConfirmDelete(true)}>Delete</button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
