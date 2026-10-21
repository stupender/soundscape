// "HEADPHONES ON?" — asked before recording, until you say not to.
//
// Browsers can't reliably tell whether headphones are plugged in, so we ask.
// Recording without them is allowed (sometimes you want the room in the
// take), but we say plainly what will happen.
import { useState } from 'react';
import { HeadphonesIcon } from './Icons.tsx';

interface Props {
  onAnswer: (go: boolean, dontAskAgain: boolean) => void;
}

export function HeadphonesPrompt({ onAnswer }: Props) {
  const [remember, setRemember] = useState(false);
  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="hp-title">
      <div className="dialog">
        <div className="dialog-icon"><HeadphonesIcon /></div>
        <h3 id="hp-title">Headphones on?</h3>
        <p>
          The soundscape plays in your headphones while the mic hears only your voice. That keeps the two
          tracks apart, so you can balance them afterwards.
        </p>
        <p className="dialog-quiet">
          Without headphones, the soundscape plays out loud and the mic records it into your voice track too.
          On a phone with Bluetooth headphones, the phone may switch to their mic. Wired is best.
        </p>
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Don't ask again on this device
        </label>
        <div className="dialog-actions">
          <button className="btn btn--primary" onClick={() => onAnswer(true, remember)} autoFocus>
            They're on: record
          </button>
          <button className="btn" onClick={() => onAnswer(true, false)}>Record without</button>
          <button className="text-btn" onClick={() => onAnswer(false, false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
