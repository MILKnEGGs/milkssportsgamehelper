// App state: every career on this device, which one is open, and saving.

import { openDocStore, requestPersistence } from '@milk/core/db';
import { downloadJson, envelope, fileSafe, readShared, toShareCode } from '@milk/core/share';
import { APP, FORMAT, SHARE_PREFIX, asCopy, normalize, type Career } from './model';

const db = openDocStore<Career>('eafc27');
const LAST = 'milks-eafc27-last';

export const app = $state({
  careers: [] as Career[],
  currentId: undefined as string | undefined,
  loaded: false,
  toast: '',
});

export function current(): Career | undefined {
  return app.careers.find((c) => c.id === app.currentId);
}

export async function load(): Promise<void> {
  requestPersistence();
  const list = await db.list();
  app.careers = list.map(normalize).sort((a, b) => b.updated.localeCompare(a.updated));
  for (const c of app.careers) saved.set(c.id, fingerprint(c));
  const last = localStorage.getItem(LAST);
  if (last && app.careers.some((c) => c.id === last)) app.currentId = last;
  app.loaded = true;
}

export function open(id: string | undefined): void {
  app.currentId = id;
  if (id) localStorage.setItem(LAST, id);
  else localStorage.removeItem(LAST);
  scrollTo(0, 0);
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();
/** Last saved content per career (ignoring the timestamp), so opening or re-stamping a career doesn't re-save it. */
const saved = new Map<string, string>();
const fingerprint = (c: Career) => JSON.stringify({ ...c, updated: '' });

/** Saves a career shortly after the last change (called from an effect that watches it). */
export function scheduleSave(c: Career): void {
  const fp = fingerprint(c);
  if (saved.get(c.id) === fp) return;
  saved.set(c.id, fp);
  clearTimeout(timers.get(c.id));
  timers.set(
    c.id,
    setTimeout(() => {
      timers.delete(c.id);
      c.updated = new Date().toISOString();
      db.put(c).catch((e) => toast(`Couldn't save: ${e?.message ?? e}`));
    }, 400),
  );
}

export async function add(c: Career): Promise<void> {
  app.careers.unshift(c);
  saved.set(c.id, fingerprint(c));
  await db.put(c);
}

export async function remove(id: string): Promise<void> {
  app.careers = app.careers.filter((c) => c.id !== id);
  if (app.currentId === id) open(undefined);
  await db.remove(id);
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string): void {
  app.toast = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (app.toast = ''), 2600);
}

// ---- Backup and sharing ---------------------------------------------------------------------------

const plain = (c: Career) => JSON.parse(JSON.stringify(c)) as Career;

export function exportFile(careers: Career[]): void {
  const name = careers.length === 1 ? fileSafe(careers[0].name) : 'all-careers';
  const day = new Date().toISOString().slice(0, 10);
  downloadJson(`fc27-${name}-${day}.json`, envelope(APP, FORMAT, careers.map(plain)));
}

export async function shareCode(c: Career): Promise<string> {
  return toShareCode(SHARE_PREFIX, envelope(APP, FORMAT, [plain(c)]));
}

export interface Incoming {
  career: Career;
  /** A career with this id is already on this device. */
  clash?: Career;
}

/** Reads a backup file's text or a pasted share code. Throws a user-facing Error. */
export async function readIncoming(text: string): Promise<Incoming[]> {
  const env = await readShared<Career>(SHARE_PREFIX, APP, text);
  if (env.format > FORMAT) throw new Error('That was saved by a newer version of the app. Reload to update, then try again.');
  if (!env.items.length) throw new Error('That backup has no careers in it.');
  return env.items.map((raw) => {
    const career = normalize(raw);
    return { career, clash: app.careers.find((c) => c.id === career.id) };
  });
}

/** Adds incoming careers: "replace" overwrites a career with the same id, "copy" keeps both. */
export async function acceptIncoming(list: Incoming[], onClash: 'replace' | 'copy'): Promise<void> {
  for (const { career, clash } of list) {
    if (clash && onClash === 'replace') {
      const k = app.careers.findIndex((c) => c.id === clash.id);
      app.careers[k] = career;
      saved.set(career.id, fingerprint(career));
      await db.put(career);
    } else {
      await add(clash ? asCopy(career) : career);
    }
  }
}
