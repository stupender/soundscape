// 03 TAKES — every recording, newest first. Open one to mix and export it.
import { stopTake } from '../audio/takePlayer.ts';
import { deleteTake, type Take } from '../store/db.ts';
import type { ReactNode } from 'react';
import { TakeRow } from './TakeRow.tsx';

interface Props {
  takes: Take[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onDeleted: (id: string) => void;
  /** The once-only mailing-list invitation, shown here after the first take. */
  invite?: ReactNode;
}

export function Takes({ takes, openId, setOpenId, onDeleted, invite }: Props) {
  async function remove(id: string) {
    stopTake();
    await deleteTake(id);
    onDeleted(id);
  }

  return (
    <section className="panel" aria-labelledby="takes-h">
      <header className="panel-head">
        <span className="panel-num">03</span>
        <h2 id="takes-h">Takes</h2>
        <span className="panel-credit">{takes.length ? `${takes.length} on this device` : ''}</span>
      </header>
      {invite}
      {takes.length === 0 ? (
        <p className="quiet empty">
          Your takes appear here, voice and soundscape kept as two tracks, ready to balance and export.
        </p>
      ) : (
        <ul className="takes">
          {takes.map((t, i) => (
            <TakeRow
              key={t.id}
              take={t}
              number={takes.length - i}
              open={openId === t.id}
              onOpen={() => setOpenId(openId === t.id ? null : t.id)}
              onDelete={() => void remove(t.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
