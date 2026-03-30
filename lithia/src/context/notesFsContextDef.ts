import { createContext } from 'react';

export type FolderStatus = 'unavailable' | 'disconnected' | 'needs-permission' | 'connected';

export type NotesFsValue = {
  status: FolderStatus;
  dirName: string | null;
  dirHandle: FileSystemDirectoryHandle | null;
  pickFolder: () => Promise<void>;
  reconnect: () => Promise<void>;
};

export const NotesFsContext = createContext<NotesFsValue>({
  status: 'disconnected',
  dirName: null,
  dirHandle: null,
  pickFolder: async () => {},
  reconnect: async () => {},
});
