// SAVED TAKES — kept in the browser's own database (IndexedDB) on this device.
//
// Nothing is uploaded anywhere. Each take is its two tracks as WAV files plus
// a few facts about it. They survive closing the tab and restarting; they're
// lost only if you clear this site's data in the browser, so download the
// takes you love.
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

export const saveTake = (take: Take) => run<IDBValidKey>('readwrite', (s) => s.put(take));
export const deleteTake = (id: string) => run<undefined>('readwrite', (s) => s.delete(id));
