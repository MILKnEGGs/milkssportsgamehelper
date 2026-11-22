// Local storage. Each game keeps its saves in this browser's IndexedDB (one database per game);
// nothing is sent anywhere. A "doc" is one whole save (for example a career) stored as plain JSON.

export interface Doc {
  id: string;
}

export interface DocStore<T extends Doc> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  put(doc: T): Promise<void>;
  remove(id: string): Promise<void>;
}

export function openDocStore<T extends Doc>(game: string, store = 'docs'): DocStore<T> {
  let dbp: Promise<IDBDatabase> | undefined;
  const db = () =>
    (dbp ??= new Promise((resolve, reject) => {
      const req = indexedDB.open(`milks-${game}`, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(store, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));

  function run<R>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<R>): Promise<R> {
    return db().then(
      (d) =>
        new Promise<R>((resolve, reject) => {
          const tx = d.transaction(store, mode);
          const req = fn(tx.objectStore(store));
          tx.oncomplete = () => resolve(req.result);
          tx.onerror = () => reject(tx.error);
        }),
    );
  }

  return {
    list: () => run<T[]>('readonly', (s) => s.getAll()),
    get: (id) => run<T | undefined>('readonly', (s) => s.get(id)),
    // $state proxies can't be structured-cloned; store a plain copy.
    put: (doc) => run('readwrite', (s) => s.put(JSON.parse(JSON.stringify(doc)))).then(() => {}),
    remove: (id) => run('readwrite', (s) => s.delete(id)).then(() => {}),
  };
}

/** Asks the browser not to evict our data when storage runs low (best effort). */
export function requestPersistence(): void {
  navigator.storage?.persist?.().catch(() => {});
}
