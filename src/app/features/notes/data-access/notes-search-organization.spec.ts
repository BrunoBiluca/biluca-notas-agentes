import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import {
  configureNotesApplication,
  InMemoryNoteRepository,
  sampleNotes,
} from './notes-testing.fixtures';

describe('note search and organization', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('searches beyond loaded pages in both title and content', async () => {
    const notes = sampleNotes(1000);
    notes[999].content = 'needle in the full collection';
    const app = configureNotesApplication(new InMemoryNoteRepository(notes));
    await app.loadInitial();
    expect(app.notes()).toHaveLength(100);
    await app.search('needle');
    expect(app.notes().map((note) => note.id)).toEqual(['note-999']);
  });

  it('prioritizes pinned notes and persists manual ordering', async () => {
    const repository = new InMemoryNoteRepository(sampleNotes(3));
    const app = configureNotesApplication(repository);
    await app.loadInitial();
    await app.setPinned('note-2', true);
    expect(app.notes()[0].id).toBe('note-2');
    await app.setPinned('note-1', true);
    await app.setSortMode('manual');
    await app.reorder('note-2', 0);
    expect(repository.records.find((note) => note.id === 'note-2')?.manualOrder).toBe(0);
    expect(repository.records.find((note) => note.id === 'note-2')?.updatedAt).toBe(998);
  });
});
