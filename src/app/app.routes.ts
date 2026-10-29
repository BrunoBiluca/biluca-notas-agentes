import { Routes } from '@angular/router';
import { NoteEditorPage } from './features/notes/pages/note-editor.page';
import { NotesPageComponent } from './features/notes/pages/notes-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  { path: 'notes', component: NotesPageComponent },
  { path: 'notes/new', component: NoteEditorPage },
  { path: 'notes/:id/edit', component: NoteEditorPage },
  { path: 'notes/:id', component: NotesPageComponent },
  { path: '**', redirectTo: 'notes' },
];
