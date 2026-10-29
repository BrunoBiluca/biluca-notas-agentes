import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Note, NoteSortMode, NoteViewMode } from '../domain/note.model';

export interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | undefined;
  viewMode: NoteViewMode;
  sortMode: NoteSortMode;
  query: string;
  hasMore: boolean;
  searchResults: Note[] | undefined;
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: undefined,
  viewMode: 'grid',
  sortMode: 'updated',
  query: '',
  hasMore: true,
  searchResults: undefined,
};

export const NotesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    updateState: (state: Partial<NotesState>) => patchState(store, state),
  })),
);
