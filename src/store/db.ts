// SAVED TAKES — kept in the browser's own database (IndexedDB) on this device.
//
// Nothing is uploaded anywhere. Each take is its two tracks as WAV files plus
// a few facts about it. They survive closing the tab and restarting.
//
// KEEPING THEM: browsers may clear a site's saved data to free space, and
// Safari clears it after 7 days without a visit (home-screen apps are exempt).
// So when the first take is saved we ask the browser to keep this site's data
// ("persistent storage"). Browsers may still say no; exporting the takes you
// love is the only sure way.
//
// IndexedDB's own interface is old and event-based; the four small functions
// here wrap it in Promises so the rest of the app can just `await` them.

export interface Take {
  id: string;
  name: string;
  createdAt: number;
  seconds: number;
  key: string;
  layers: string[];
  voice: Blob;
  bed: Blob;
}

const DB = 'soundscape';
const STORE = 'takes';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Run one request against the takes store and resolve with its result. */
async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

/** Every saved take, newest first. */
export async function listTakes(): Promise<Take[]> {
  const all = await run<Take[]>('readonly', (s) => s.getAll());
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

let askedToKeep = false;

/** Ask the browser, once, to keep this site's data instead of clearing it. */
function askToKeep(): void {
  if (askedToKeep) return;
  askedToKeep = true;
  navigator.storage?.persist?.().catch(() => {});
}

export async function saveTake(take: Take): Promise<IDBValidKey> {
  askToKeep();
  return run<IDBValidKey>('readwrite', (s) => s.put(take));
}

export const deleteTake = (id: string) => run<undefined>('readwrite', (s) => s.delete(id));
