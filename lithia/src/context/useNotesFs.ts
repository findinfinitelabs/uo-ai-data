import { useContext } from 'react';
import { NotesFsContext } from './notesFsContextDef';

export function useNotesFs() {
  return useContext(NotesFsContext);
}
