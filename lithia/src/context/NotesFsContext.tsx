import { useEffect, useState, type ReactNode } from 'react';
import {
  isFileSysAvailable,
  pickNotesDirectory,
  restoreNotesDirectory,
  grantPermission,
  getCachedHandle,
} from '../lib/notesFs';
import { NotesFsContext, type FolderStatus } from './notesFsContextDef';

export function NotesFsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<FolderStatus>(
    !isFileSysAvailable() ? 'unavailable' : 'disconnected',
  );
  const [rawHandle, setRawHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // On mount, try to restore a previously-chosen folder.
  useEffect(() => {
    if (!isFileSysAvailable()) return;
    restoreNotesDirectory().then((result) => {
      if (!result) return;
      setRawHandle(result.handle);
      setStatus(result.needsPermission ? 'needs-permission' : 'connected');
    }).catch(() => {});
  }, []);

  async function pickFolder() {
    try {
      const handle = await pickNotesDirectory();
      setRawHandle(handle);
      setStatus('connected');
    } catch {
      // User cancelled picker — do nothing
    }
  }

  async function reconnect() {
    const handle = rawHandle ?? getCachedHandle();
    if (!handle) return;
    const ok = await grantPermission(handle);
    setStatus(ok ? 'connected' : 'needs-permission');
  }

  const activeHandle = status === 'connected' ? rawHandle : null;

  return (
    <NotesFsContext.Provider
      value={{
        status,
        dirName: rawHandle?.name ?? null,
        dirHandle: activeHandle,
        pickFolder,
        reconnect,
      }}
    >
      {children}
    </NotesFsContext.Provider>
  );
}
