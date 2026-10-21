// 02 VOICE — the mic, its level, and the record button.
//
// 1. "Turn on the mic" asks the browser for permission. Only after that does
//    the browser reveal the names of your mics, so the picker fills in then.
// 2. Choose a mic (the phone's, the laptop's, a USB mic, an interface) and,
//    for a two-input interface, which input.
// 3. Watch the meter, set the trim, glance at the "space" picture.
// 4. Record (or press the space bar). The headphones question comes first,
//    until you tell it not to ask.
import { useCallback, useEffect, useState } from 'react';
import { canPickOutput, getEngine, glide, setOutputDevice } from '../audio/engine.ts';
import { closeMic, listDevices, openMic, setTrim, type MicInfo } from '../audio/mic.ts';
import { readyPads, setPadInputLatency } from '../audio/pads.ts';
import { recordingSeconds, startRecording, stopRecording } from '../audio/record.ts';
import type { Take } from '../store/db.ts';
import { readPref, writePref } from '../store/prefs.ts';
import { HeadphonesPrompt } from './HeadphonesPrompt.tsx';
import { Meter } from './Meter.tsx';
import { Space } from './Space.tsx';

interface Props {
  keyName: string;
  onTake: (take: Take) => void;
  onMic: (open: boolean) => void;
  openTips: (section: string) => void;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function Voice({ keyName, onTake, onMic, openTips }: Props) {
  const [mic, setMic] = useState<MicInfo | null>(null);
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState(() => readPref('mic.device', ''));
  const [outputId, setOutputId] = useState('');
  const [channel, setChannel] = useState(() => readPref('mic.channel', 0));
  const [cleanup, setCleanup] = useState(() => readPref('mic.cleanup', false));
  const [trim, setTrimState] = useState(() => readPref('mic.trim', 1));
  const [hearSelf, setHearSelf] = useState(false);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');

  const refreshDevices = useCallback(async () => {
    const d = await listDevices();
    setInputs(d.inputs);
    setOutputs(d.outputs);
  }, []);

  async function open(opts?: { deviceId?: string; channel?: number; cleanup?: boolean }) {
    setError('');
    getEngine();
    try {
      const info = await openMic({
        deviceId: opts?.deviceId ?? deviceId,
        channel: opts?.channel ?? channel,
        cleanup: opts?.cleanup ?? cleanup,
        trim,
      });
      setMic(info);
      onMic(true);
      setPadInputLatency(info.latency);
      await readyPads();
      await refreshDevices();
    } catch (err) {
      const name = (err as Error).name;
      setError(
        name === 'NotAllowedError'
          ? 'The browser wasn\'t allowed to use the mic. Allow it in the address bar (or Settings › Safari › Microphone) and try again.'
          : name === 'OverconstrainedError' || name === 'NotFoundError'
            ? 'That mic isn\'t available. Pick another, or plug it in and press "Look again".'
            : 'The mic couldn\'t be opened. This page needs to be on https (or localhost).',
      );
    }
  }

  function close() {
    closeMic();
    setMic(null);
    onMic(false);
  }

  // Re-open when the mic choice changes while it's on.
  function choose(next: { deviceId?: string; channel?: number; cleanup?: boolean }) {
    if (next.deviceId !== undefined) { setDeviceId(next.deviceId); writePref('mic.device', next.deviceId); }
    if (next.channel !== undefined) { setChannel(next.channel); writePref('mic.channel', next.channel); }
    if (next.cleanup !== undefined) { setCleanup(next.cleanup); writePref('mic.cleanup', next.cleanup); }
    if (mic) void open(next);
  }

  function changeTrim(v: number) {
    setTrimState(v);
    writePref('mic.trim', v);
    setTrim(v);
  }

  function changeHearSelf(on: boolean) {
    setHearSelf(on);
    glide(getEngine().monitor.gain, on ? 1 : 0, 0.05);
  }

  async function changeOutput(id: string) {
    setOutputId(id);
    try { await setOutputDevice(id); } catch { setError('Couldn\'t switch output.'); }
  }

  async function begin() {
    setRecording(true);
    setElapsed(0);
    await startRecording();
  }

  async function finish() {
    setRecording(false);
    setSaving(true);
    const take = await stopRecording(keyName, mic?.latency ?? 0);
    setSaving(false);
    if (take) onTake(take);
  }

  const toggleRecord = useCallback(() => {
    if (!mic || saving) return;
    if (recording) { void finish(); return; }
    if (readPref('headphones.ok', false)) void begin();
    else setAsking(true);
  }, [mic, recording, saving]); // eslint-disable-line react-hooks/exhaustive-deps

  // The space bar records and stops, unless you're typing or on a control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const t = e.target;
      if (t instanceof Element && t.closest('input, textarea, select, button, [contenteditable]')) return;
      e.preventDefault();
      toggleRecord();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleRecord]);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setElapsed(recordingSeconds()), 250);
    return () => clearInterval(id);
  }, [recording]);

  return (
    <section className="panel" aria-labelledby="voice-h">
      <header className="panel-head">
        <span className="panel-num">02</span>
        <h2 id="voice-h">Voice</h2>
        <span className={`led ${mic ? 'led--on' : ''}`} aria-hidden="true" />
        <button className="text-btn" onClick={() => openTips('headphones')}>Tips</button>
      </header>

      {!mic ? (
        <div className="mic-off">
          <button className="btn btn--primary" onClick={() => open()}>Turn on the mic</button>
          <p className="quiet">Any mic works: your phone's, your laptop's, a USB mic, or an audio interface.</p>
        </div>
      ) : (
        <div className="mic-on">
          <div className="field-row">
            <label className="field">
              <span className="label">Mic</span>
              <select value={mic.deviceId} onChange={(e) => choose({ deviceId: e.target.value })}>
                {inputs.map((d, i) => <option key={d.deviceId || i} value={d.deviceId}>{d.label || `Mic ${i + 1}`}</option>)}
              </select>
            </label>
            {mic.channels > 1 && (
              <label className="field field--narrow">
                <span className="label">Input</span>
                <select value={channel} onChange={(e) => choose({ channel: Number(e.target.value) })}>
                  <option value={0}>1</option>
                  <option value={1}>2</option>
                </select>
              </label>
            )}
            <button className="text-btn" onClick={refreshDevices}>Look again</button>
          </div>
          {canPickOutput() && outputs.length > 1 && (
            <label className="field">
              <span className="label">Headphones</span>
              <select value={outputId} onChange={(e) => changeOutput(e.target.value)}>
                {outputs.map((d, i) => <option key={d.deviceId || i} value={d.deviceId === 'default' ? '' : d.deviceId}>{d.label || `Output ${i + 1}`}</option>)}
              </select>
            </label>
          )}

          <Meter active={!!mic} />

          <div className="field-row">
            <label className="fader-row fader-row--inline">
              <span className="label">Trim</span>
              <input type="range" min={0.25} max={4} step={0.01} value={trim} onChange={(e) => changeTrim(Number(e.target.value))} className="slider" />
              <span className="value">{trim >= 1 ? '+' : ''}{(20 * Math.log10(trim)).toFixed(0)} dB</span>
            </label>
          </div>
          <div className="switches">
            <label className="switch">
              <input type="checkbox" checked={hearSelf} onChange={(e) => changeHearSelf(e.target.checked)} />
              <span>Hear yourself</span>
            </label>
            <label className="switch">
              <input type="checkbox" checked={cleanup} onChange={(e) => choose({ cleanup: e.target.checked })} />
              <span>Call cleanup</span>
            </label>
            <button className="text-btn" onClick={close}>Mic off</button>
          </div>

          <Space active={!!mic} />
        </div>
      )}

      <div className="record-row">
        <button
          className={`rec ${recording ? 'rec--on' : ''}`}
          onClick={toggleRecord}
          disabled={!mic || saving}
          aria-pressed={recording}
          aria-label={recording ? 'Stop recording' : 'Record'}
        >
          <span className="rec-dot" />
        </button>
        <div className="rec-text">
          <span className="rec-clock">{recording ? clock(elapsed) : saving ? 'saving…' : '0:00'}</span>
          <span className="quiet">
            {!mic ? 'turn on the mic to record' : recording ? 'recording voice + soundscape · space to stop' : 'record · or press space'}
          </span>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {asking && (
        <HeadphonesPrompt
          onAnswer={(go, remember) => {
            setAsking(false);
            if (remember) writePref('headphones.ok', true);
            if (go) void begin();
          }}
        />
      )}
    </section>
  );
}
