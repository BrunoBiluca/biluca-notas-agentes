import { FormField, form } from '@angular/forms/signals';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NOTES_APPLICATION } from '../data-access/service-contracts';
import { Note, NoteDraft } from '../domain/note.model';
import { validateNoteImage } from '../domain/note-image-validation';
import { NoteCardComponent } from '../ui/note-card.component';
import { NoteDetailPage } from './note-detail.page';

interface CreateDraft {
  title: string;
  content: string;
  backgroundColor: string;
}

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    FormField,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    NoteCardComponent,
  ],
  template: `
    <h1 class="visually-hidden">Suas notas</h1>
    <mat-toolbar class="notes-toolbar" role="toolbar" aria-label="Barra de navegação das notas">
      <div class="toolbar-controls">
        <mat-button-toggle-group
          aria-label="Modo de visualização das notas"
          [value]="app.viewMode()"
          (change)="app.setViewMode($event.value)"
        >
          <mat-button-toggle value="grid" aria-label="Visualização em grade">
            <mat-icon svgIcon="grid_view" />
          </mat-button-toggle>
          <mat-button-toggle value="list" aria-label="Visualização em lista">
            <mat-icon svgIcon="view_list" />
          </mat-button-toggle>
        </mat-button-toggle-group>
        <button
          matIconButton
          type="button"
          class="sort-button"
          [attr.aria-label]="sortLabel()"
          [attr.aria-pressed]="app.sortMode() === 'manual'"
          (click)="toggleSortMode()"
        >
          <mat-icon svgIcon="sort" />
        </button>
      </div>
      <mat-form-field class="search-field" appearance="outline" subscriptSizing="dynamic">
        <mat-label>Buscar por título ou conteúdo</mat-label>
        <input matInput type="search" [value]="app.query()" (input)="search($event)" />
      </mat-form-field>
      <span class="toolbar-balance" aria-hidden="true"></span>
    </mat-toolbar>

    <form class="create-note" (submit)="createNote(); $event.preventDefault()">
      <div class="create-fields">
        <mat-form-field appearance="outline">
          <mat-label>Título</mat-label>
          <input matInput [formField]="createForm.title" autocomplete="off" aria-required="true" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="content-field">
          <mat-label>Conteúdo</mat-label>
          <textarea matInput [formField]="createForm.content" rows="2"></textarea>
        </mat-form-field>
        <label class="color-field">
          <span>Cor de fundo</span>
          <input
            type="color"
            [formField]="createForm.backgroundColor"
            (input)="transparentBackground.set(false)"
          />
        </label>
        <mat-checkbox
          [checked]="transparentBackground()"
          (change)="setTransparentBackground($event.checked)"
        >
          Fundo transparente
        </mat-checkbox>
      </div>
      @if (submitted() && !createDraft().title.trim()) {
        <p class="field-error" role="alert">Informe um título para a nota.</p>
      }
      <div class="create-footer">
        <div class="image-tools">
          <input
            #imagePicker
            class="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            tabindex="-1"
            aria-label="Selecionar imagens para a nota"
            (change)="selectFiles($event)"
          />
          <button matButton type="button" class="add-image" (click)="imagePicker.click()">
            <mat-icon svgIcon="add_photo_alternate" />
            Adicionar imagens
          </button>
          @for (pending of pendingFiles(); track pending.url) {
            <div class="pending-image">
              <img [src]="pending.url" alt="Prévia da imagem selecionada" />
              <button
                matIconButton
                type="button"
                [attr.aria-label]="'Remover imagem selecionada: ' + pending.file.name"
                (click)="removePending(pending.url)"
              >
                <mat-icon svgIcon="remove_circle" />
              </button>
            </div>
          }
        </div>
        <button matButton="filled" type="submit" [disabled]="saving()">
          <mat-icon svgIcon="add" />
          Criar nota
        </button>
      </div>
      @if (imageError()) {
        <p class="field-error" role="alert">{{ imageError() }}</p>
      }
      @if (creationError()) {
        <p class="field-error" role="alert">{{ creationError() }}</p>
      }
      @if (createdMessage()) {
        <p class="success" role="status">{{ createdMessage() }}</p>
      }
    </form>

    @if (pageError() || app.error()) {
      <p class="error" role="alert">{{ pageError() || app.error() }}</p>
    }
    @if (app.loading() && !app.notes().length) {
      <p role="status">Carregando notas…</p>
    } @else if (!app.notes().length) {
      <section class="empty" aria-live="polite">
        <mat-icon svgIcon="edit" aria-hidden="true" />
        <h2>{{ app.query() ? 'Nenhuma nota encontrada' : 'Sua coleção está vazia' }}</h2>
        <p>
          {{ app.query() ? 'Tente outra palavra.' : 'Crie sua primeira nota usando o formulário.' }}
        </p>
      </section>
    } @else {
      @if (pinnedNotes().length) {
        <h2 class="group-title">Notas fixadas</h2>
        <div
          class="notes"
          [class.list]="app.viewMode() === 'list'"
          cdkDropList
          cdkDropListOrientation="mixed"
          [cdkDropListData]="pinnedNotes()"
          (cdkDropListDropped)="drop($event, pinnedNotes())"
        >
          @for (note of pinnedNotes(); track note.id; let i = $index) {
            <app-note-card
              cdkDrag
              [cdkDragData]="note"
              [cdkDragDisabled]="app.sortMode() !== 'manual'"
              [note]="note"
              [position]="i"
              [groupSize]="pinnedNotes().length"
              [sortMode]="app.sortMode()"
              (open)="openNote(note.id)"
            />
          }
        </div>
      }
      @if (unpinnedNotes().length) {
        <h2 class="group-title">Notas livres</h2>
        <div
          class="notes"
          [class.list]="app.viewMode() === 'list'"
          cdkDropList
          cdkDropListOrientation="mixed"
          [cdkDropListData]="unpinnedNotes()"
          (cdkDropListDropped)="drop($event, unpinnedNotes())"
        >
          @for (note of unpinnedNotes(); track note.id; let i = $index) {
            <app-note-card
              cdkDrag
              [cdkDragData]="note"
              [cdkDragDisabled]="app.sortMode() !== 'manual'"
              [note]="note"
              [position]="i"
              [groupSize]="unpinnedNotes().length"
              [sortMode]="app.sortMode()"
              (open)="openNote(note.id)"
            />
          }
        </div>
      }
    }
    @if (app.loading() && app.notes().length) {
      <p class="status" role="status">Carregando mais notas…</p>
    }
    <div class="scroll-sentinel" aria-hidden="true"></div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .visually-hidden {
        clip: rect(0, 0, 0, 0);
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }
      .notes-toolbar {
        background: transparent;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(15rem, 34rem) minmax(0, 1fr);
        gap: 1rem;
        min-height: 4.5rem;
        padding: 0;
      }
      .toolbar-controls {
        align-items: center;
        display: flex;
        gap: 0.6rem;
        justify-self: start;
      }
      .search-field {
        justify-self: center;
        width: min(100%, 34rem);
      }
      .toolbar-balance {
        justify-self: end;
      }
      .create-note {
        background: var(--mat-sys-surface-container);
        border: 1px solid var(--mat-sys-outline);
        border-radius: var(--mat-sys-corner-large);
        margin: 0.75rem 0 2rem;
        padding: 1rem;
      }
      .create-fields {
        align-items: center;
        display: grid;
        gap: 0.75rem;
        grid-template-columns: minmax(12rem, 1fr) minmax(12rem, 2fr) auto auto;
      }
      .create-fields mat-form-field {
        width: 100%;
      }
      .create-fields mat-form-field,
      .create-fields mat-checkbox {
        margin-bottom: -1.25rem;
      }
      .color-field {
        align-items: center;
        display: flex;
        flex-direction: column;
        font-family: var(--mat-sys-label-large-font);
        font-size: var(--mat-sys-label-large-size);
        font-weight: var(--mat-sys-label-large-weight);
        gap: 0.25rem;
        line-height: var(--mat-sys-label-large-line-height);
        white-space: nowrap;
      }
      .color-field input {
        border: 0;
        cursor: pointer;
        height: 2rem;
        padding: 0;
        width: 3rem;
      }
      .create-footer,
      .image-tools {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: space-between;
      }
      .image-tools {
        justify-content: flex-start;
      }
      .add-image {
        color: var(--mat-sys-primary);
      }
      .pending-image {
        align-items: center;
        display: flex;
        gap: 0.25rem;
      }
      .pending-image img {
        height: 3rem;
        object-fit: cover;
        width: 3rem;
      }
      .field-error,
      .error {
        color: var(--mat-sys-error);
        margin: 0.5rem 0;
      }
      .success {
        color: var(--mat-sys-primary);
        margin: 0.5rem 0 0;
      }
      .notes {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr));
        margin-bottom: 2rem;
        min-width: 0;
      }
      .notes.list {
        grid-template-columns: minmax(0, 1fr);
      }
      .group-title {
        font-family: var(--mat-sys-title-large-font);
        font-size: var(--mat-sys-title-large-size);
        font-weight: var(--mat-sys-title-large-weight);
        line-height: var(--mat-sys-title-large-line-height);
        margin: 1.25rem 0 0.75rem;
      }
      .empty h2 {
        font-family: var(--mat-sys-title-large-font);
        font-size: var(--mat-sys-title-large-size);
        font-weight: var(--mat-sys-title-large-weight);
        line-height: var(--mat-sys-title-large-line-height);
      }
      .empty {
        align-items: center;
        background: var(--mat-sys-surface-container);
        border: 1px dashed var(--mat-sys-outline);
        border-radius: var(--mat-sys-corner-large);
        display: flex;
        flex-direction: column;
        padding: 3rem 1rem;
        text-align: center;
      }
      .empty mat-icon {
        color: var(--mat-sys-primary);
        height: 2rem;
        width: 2rem;
      }
      .empty p,
      .status {
        color: var(--mat-sys-on-surface);
      }
      .scroll-sentinel {
        height: 1px;
      }
      @media (max-width: 760px) {
        .notes-toolbar {
          grid-template-columns: auto minmax(0, 1fr);
          min-height: auto;
        }
        .toolbar-controls {
          grid-column: 1 / -1;
        }
        .search-field {
          grid-column: 1 / -1;
          grid-row: 2;
          width: 100%;
        }
        .toolbar-balance {
          display: none;
        }
        .create-fields {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }
        .content-field {
          grid-column: 1 / -1;
        }
      }
      @media (max-width: 420px) {
        .create-fields {
          grid-template-columns: minmax(0, 1fr);
        }
        .create-fields .content-field {
          grid-column: auto;
        }
        .create-footer {
          align-items: stretch;
          flex-direction: column;
        }
        .create-footer > button {
          width: 100%;
        }
      }
    `,
  ],
})
export class NotesPageComponent {
  readonly app = inject(NOTES_APPLICATION);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly pinnedNotes = computed(() => this.app.notes().filter((note) => note.pinned));
  readonly unpinnedNotes = computed(() => this.app.notes().filter((note) => !note.pinned));
  readonly createDraft = signal<CreateDraft>({
    title: '',
    content: '',
    backgroundColor: '#e8def8',
  });
  readonly createForm = form(this.createDraft);
  readonly transparentBackground = signal(true);
  readonly pendingFiles = signal<{ file: File; url: string }[]>([]);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly creationError = signal('');
  readonly imageError = signal('');
  readonly createdMessage = signal('');
  readonly pageError = signal('');

  constructor() {
    const state = window.history.state as { openNoteId?: unknown };
    const requestedNoteId =
      this.route.snapshot.paramMap.get('id') ??
      (typeof state.openNoteId === 'string' ? state.openNoteId : undefined);
    void this.app
      .loadInitial()
      .then(() => {
        if (requestedNoteId) this.openNote(requestedNoteId);
      })
      .catch((error: unknown) => this.setPageError(error, 'Não foi possível carregar as notas.'));
  }

  sortLabel(): string {
    return this.app.sortMode() === 'updated'
      ? 'Ordenação atual: ordem de atualização. Alternar para ordem manual'
      : 'Ordenação atual: ordem manual. Alternar para ordem de atualização';
  }

  async search(event: Event): Promise<void> {
    this.pageError.set('');
    try {
      await this.app.search((event.target as HTMLInputElement).value);
    } catch (error) {
      this.setPageError(error, 'Não foi possível pesquisar as notas.');
    }
  }

  async toggleSortMode(): Promise<void> {
    this.pageError.set('');
    const mode = this.app.sortMode() === 'updated' ? 'manual' : 'updated';
    try {
      await this.app.setSortMode(mode);
    } catch (error) {
      this.setPageError(error, 'Não foi possível alterar a ordenação.');
    }
  }

  setTransparentBackground(transparent: boolean): void {
    this.transparentBackground.set(transparent);
  }

  selectFiles(event: Event): void {
    this.imageError.set('');
    for (const file of [...((event.target as HTMLInputElement).files ?? [])]) {
      const validation = validateNoteImage(file);
      if (validation) {
        this.imageError.set(`${file.name}: ${validation}`);
        continue;
      }
      this.pendingFiles.update((items) => [...items, { file, url: URL.createObjectURL(file) }]);
    }
    (event.target as HTMLInputElement).value = '';
  }

  removePending(url: string): void {
    URL.revokeObjectURL(url);
    this.pendingFiles.update((items) => items.filter((item) => item.url !== url));
  }

  async createNote(): Promise<void> {
    this.submitted.set(true);
    this.createdMessage.set('');
    this.creationError.set('');
    const draft = this.createDraft();
    if (!draft.title.trim()) {
      this.creationError.set('Informe um título para a nota.');
      return;
    }
    this.saving.set(true);
    try {
      const input: NoteDraft = {
        title: draft.title,
        content: draft.content,
        backgroundColor: this.transparentBackground() ? undefined : draft.backgroundColor,
        imageIds: [],
      };
      await this.app.create(
        input,
        this.pendingFiles().map((item) => item.file),
      );
      this.releasePendingFiles();
      this.createDraft.set({ title: '', content: '', backgroundColor: '#e8def8' });
      this.transparentBackground.set(true);
      this.submitted.set(false);
      this.createdMessage.set('Nota criada com sucesso.');
    } catch (error) {
      this.creationError.set(
        error instanceof Error ? error.message : 'Não foi possível criar a nota.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  openNote(noteId: string): void {
    const ref = this.dialog.open(NoteDetailPage, {
      data: { noteId },
      ariaLabelledBy: 'note-dialog-title',
      autoFocus: true,
      restoreFocus: true,
      width: 'min(42rem, calc(100vw - 2rem))',
      maxWidth: 'calc(100vw - 2rem)',
      panelClass: 'note-detail-dialog',
    });
    ref.afterClosed().subscribe(() => {
      if (this.route.snapshot.paramMap.get('id') === noteId) {
        void this.router.navigate(['/notes'], { replaceUrl: true });
      }
    });
  }

  async drop(event: CdkDragDrop<Note[]>, group: Note[]): Promise<void> {
    if (event.previousIndex === event.currentIndex) return;
    this.pageError.set('');
    try {
      await this.app.reorder(group[event.previousIndex].id, event.currentIndex);
    } catch (error) {
      this.setPageError(error, 'Não foi possível reordenar as notas.');
    }
  }

  async onScroll(): Promise<void> {
    if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 500) {
      return;
    }
    try {
      await this.app.loadNextPage();
    } catch (error) {
      this.setPageError(error, 'Não foi possível carregar mais notas.');
    }
  }

  @HostListener('window:scroll')
  handleScroll(): void {
    void this.onScroll();
  }

  private releasePendingFiles(): void {
    for (const item of this.pendingFiles()) URL.revokeObjectURL(item.url);
    this.pendingFiles.set([]);
  }

  private setPageError(error: unknown, fallback: string): void {
    this.pageError.set(error instanceof Error ? error.message : fallback);
  }
}
