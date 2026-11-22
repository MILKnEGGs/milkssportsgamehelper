// Backups and sharing. A save can leave the app two ways:
//  - a .json file (download, then send it however you like), or
//  - a share code: one line of text, "<PREFIX>:" + compressed JSON in base64url, that pastes into a chat.
// Both carry the same envelope, so either can be imported.

export interface Envelope<T> {
  app: string;
  /** Bumped when the save format changes in a way old versions can't read. */
  format: number;
  exported: string;
  items: T[];
}

export function envelope<T>(app: string, format: number, items: T[]): Envelope<T> {
  return { app, format, exported: new Date().toISOString(), items };
}

function toBase64Url(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const b = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function toShareCode(prefix: string, data: unknown): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(data));
  return `${prefix}:${toBase64Url(await pipe(raw, new CompressionStream('deflate-raw')))}`;
}

/**
 * Reads whatever was pasted or picked: a share code with this prefix, or JSON text.
 * Throws an Error with a message fit to show the user.
 */
export async function readShared<T>(prefix: string, app: string, text: string): Promise<Envelope<T>> {
  const t = text.trim();
  let data: unknown;
  if (t.toUpperCase().startsWith(prefix.toUpperCase() + ':')) {
    try {
      const bytes = await pipe(fromBase64Url(t.slice(prefix.length + 1).replace(/\s+/g, '')), new DecompressionStream('deflate-raw'));
      data = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      throw new Error('That share code is incomplete or damaged. Copy the whole code and try again.');
    }
  } else {
    try {
      data = JSON.parse(t);
    } catch {
      throw new Error(`That isn't a backup file or a ${prefix}: share code.`);
    }
  }
  const env = data as Partial<Envelope<T>>;
  if (!env || env.app !== app || !Array.isArray(env.items)) throw new Error('That backup is from a different app.');
  return env as Envelope<T>;
}

export function downloadJson(filename: string, data: unknown): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Opens the file picker and resolves with the chosen file's text (or undefined if cancelled). */
export function pickTextFile(accept = '.json,application/json,text/plain'): Promise<string | undefined> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) f.text().then(resolve, () => resolve(undefined));
      else resolve(undefined);
    };
    input.oncancel = () => resolve(undefined);
    input.click();
  });
}

/** A file-name-safe version of a save's name. */
export function fileSafe(name: string): string {
  return name.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'save';
}
