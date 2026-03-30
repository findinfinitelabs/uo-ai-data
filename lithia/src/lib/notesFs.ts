// File System Access API wrapper with IndexedDB handle persistence.
// Falls back silently if the API is not available (Firefox, Safari).

const DB_NAME = 'uo-product-studio';
const STORE = 'fs-handles';
const DIR_KEY = 'notes-dir';

// Module-level cache so we only hit IndexedDB once per session.
let _handle: FileSystemDirectoryHandle | null = null;

// ────────────────────────────────────────────────────────────────
// IndexedDB helpers
// ────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putInDB(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(handle, DIR_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getFromDB(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(DIR_KEY);
    req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) ?? null);
    req.onerror = () => reject(req.error);
  });
}

// ────────────────────────────────────────────────────────────────
// Permission helpers (not yet in standard TS DOM lib — cast via unknown)
// ────────────────────────────────────────────────────────────────

type PermState = 'granted' | 'denied' | 'prompt';

async function queryPerm(handle: FileSystemDirectoryHandle): Promise<PermState> {
  try {
    return await (handle as unknown as { queryPermission(d: object): Promise<PermState> })
      .queryPermission({ mode: 'readwrite' });
  } catch {
    return 'prompt';
  }
}

async function requestPerm(handle: FileSystemDirectoryHandle): Promise<PermState> {
  return await (handle as unknown as { requestPermission(d: object): Promise<PermState> })
    .requestPermission({ mode: 'readwrite' });
}

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

export function isFileSysAvailable(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/** Let the user pick a folder and store the handle. */
export async function pickNotesDirectory(): Promise<FileSystemDirectoryHandle> {
  const handle = await (window as unknown as { showDirectoryPicker(o: object): Promise<FileSystemDirectoryHandle> })
    .showDirectoryPicker({ mode: 'readwrite', startIn: 'documents' });
  await putInDB(handle);
  _handle = handle;
  return handle;
}

/** Try to restore a previously-saved handle. Returns null if none stored. */
export async function restoreNotesDirectory(): Promise<{
  handle: FileSystemDirectoryHandle;
  needsPermission: boolean;
} | null> {
  if (_handle) return { handle: _handle, needsPermission: false };
  const handle = await getFromDB();
  if (!handle) return null;
  const perm = await queryPerm(handle);
  if (perm === 'granted') {
    _handle = handle;
    return { handle, needsPermission: false };
  }
  return { handle, needsPermission: true };
}

/** Re-request permission for a restored handle (requires user gesture). */
export async function grantPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const perm = await requestPerm(handle);
  if (perm === 'granted') {
    _handle = handle;
    return true;
  }
  return false;
}

export function getCachedHandle(): FileSystemDirectoryHandle | null {
  return _handle;
}

export function clearCachedHandle(): void {
  _handle = null;
}

/** Write a single note as a JSON file into the chosen folder. */
export async function writeNote(
  handle: FileSystemDirectoryHandle,
  key: string,
  title: string,
  html: string,
): Promise<void> {
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileHandle = await handle.getFileHandle(`${safeKey}.json`, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(
    JSON.stringify({ key, title, html, savedAt: new Date().toISOString() }, null, 2),
  );
  await writable.close();
}
