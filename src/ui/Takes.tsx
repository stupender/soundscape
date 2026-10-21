// 04 TAKES — every recording, newest first. Open one to mix and export it.
import { stopTake } from '../audio/takePlayer.ts';
import { deleteTake, type Take } from '../store/db.ts';
import { TakeRow } from './TakeRow.tsx';

interface Props {
  takes: Take[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onDeleted: (id: string) => void;
}

export function Takes({ takes, openId, setOpenId, onDeleted }: Props) {
  async function remove(id: string) {
    stopTake();
    await deleteTake(id);
    onDeleted(id);
  }

  return (
    <section className="panel" aria-labelledby="takes-h">
      <header className="panel-head">
        <span className="panel-num">04</span>
        <h2 id="takes-h">Takes</h2>
        <span className="panel-credit">{takes.length ? `${takes.length} on this device` : ''}</span>
      </header>
      {takes.length === 0 ? (
        <p className="quiet empty">
          Your takes appear here, voice and soundscape kept as two tracks, ready to balance and export.
        </p>
      ) : (
        <ul className="takes">
          {takes.map((t) => (
            <TakeRow
              key={t.id}
              take={t}
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
