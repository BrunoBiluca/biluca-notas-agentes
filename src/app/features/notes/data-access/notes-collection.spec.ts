import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import {
  configureNotesApplication,
  InMemoryNoteRepository,
  sampleNotes,
} from './notes-testing.fixtures';

describe('notes collection', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads 100 items at a time without duplicates and supports view selection', async () => {
    const app = configureNotesApplication(new InMemoryNoteRepository(sampleNotes(105)));
    await app.loadInitial();
    expect(app.notes()).toHaveLength(100);
    expect(app.hasMore()).toBe(true);
    app.setViewMode('list');
    expect(app.viewMode()).toBe('list');
    await app.loadNextPage();
    expect(app.notes()).toHaveLength(105);
    expect(new Set(app.notes().map((note) => note.id)).size).toBe(105);
    expect(app.hasMore()).toBe(false);
  });

  it('shows an empty state after loading an empty collection', async () => {
    const app = configureNotesApplication(new InMemoryNoteRepository());
    await app.loadInitial();
    expect(app.notes()).toEqual([]);
    expect(app.hasMore()).toBe(false);
  });
});
