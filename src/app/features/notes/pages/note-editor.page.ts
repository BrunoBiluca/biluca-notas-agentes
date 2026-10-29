import { FormField, form } from '@angular/forms/signals';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NOTES_APPLICATION, SaveEditResult } from '../data-access/service-contracts';
import { Note, NoteDraft } from '../domain/note.model';
import { validateNoteImage } from '../domain/note-image-validation';
import { NoteImagesComponent } from '../ui/note-images.component';

interface EditorDraft {
  title: string;
  content: string;
  backgroundColor: string;
}

@Component({
  selector: 'app-note-editor-page',
  standalone: true,
  imports: [
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NoteImagesComponent,
    RouterLink,
  ],
  template: `
    <a matButton class="back" routerLink="/notes" (click)="cancel()">
      <mat-icon svgIcon="arrow_back" />
      Voltar à coleção
    </a>
    <h1>{{ noteId ? 'Editar nota' : 'Criar nota' }}</h1>
    @if (loadError()) {
      <p class="error" role="alert">{{ loadError() }}</p>
    }
    @if (otherTabEditing()) {
      <section class="warning" role="alert">
        <strong>Esta nota já está aberta para edição em outra aba.</strong>
        <p>
          Você pode recarregar a versão salva ou continuar e resolver qualquer conflito ao salvar.
        </p>
        <button matButton type="button" class="secondary" (click)="reloadLatest()">
          <mat-icon svgIcon="refresh" />
          Recarregar versão atual
        </button>
      </section>
    }
    @if (conflict()) {
      <section class="warning" role="alert">
        <strong>Esta nota foi alterada em outra aba.</strong>
        <p>Seu rascunho foi preservado. Escolha como continuar.</p>
        <button matButton type="button" class="secondary" (click)="reloadLatest()">
          <mat-icon svgIcon="refresh" />
          Descartar meu rascunho e recarregar
        </button>
        <button matButton="filled" type="button" (click)="save('overwrite')">
          <mat-icon svgIcon="save" />
          Salvar meu rascunho como versão atual
        </button>
      </section>
    }
    <form (submit)="save(); $event.preventDefault()">
      <mat-form-field appearance="outline">
        <mat-label>Título</mat-label>
        <input matInput [formField]="noteForm.title" aria-required="true" autocomplete="off" />
      </mat-form-field>
      @if (submitted() && !draft().title.trim()) {
        <p class="field-error">Informe um título para a nota.</p>
      }
      <mat-form-field appearance="outline">
        <mat-label>Conteúdo</mat-label>
        <textarea matInput [formField]="noteForm.content" rows="8"></textarea>
      </mat-form-field>
      <label
        >Cor de fundo
        <input
          type="color"
          [formField]="noteForm.backgroundColor"
          (input)="transparentBackground.set(false)"
        />
      </label>
      <mat-checkbox
        [checked]="transparentBackground()"
        (change)="transparentBackground.set($event.checked)"
      >
        Fundo transparente
      </mat-checkbox>
      @if (previewNote(); as preview) {
        <section class="images">
          <h2>Imagens anexadas</h2>
          <app-note-images [note]="preview" />
          @for (imageId of draft().imageIds; track imageId) {
            <div class="image-row">
              {{ imageId }}
              <button matButton type="button" class="danger" (click)="removeImage(imageId)">
                <mat-icon svgIcon="remove_circle" />
                Remover imagem
              </button>
            </div>
          }
        </section>
      }
      <label class="file-input">
        <mat-icon svgIcon="add_photo_alternate" />
        Adicionar imagens
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          (change)="selectFiles($event)"
        />
      </label>
      @if (imageError()) {
        <p class="field-error" role="alert">{{ imageError() }}</p>
      }
      @for (pending of pendingFiles(); track pending.url) {
        <div class="pending">
          <img [src]="pending.url" alt="Prévia da imagem selecionada" />
          <span>{{ pending.file.name }}</span>
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
      <div class="actions">
        <button matButton="filled" type="submit" [disabled]="saving() || !ready()">
          <mat-icon svgIcon="save" />
          Salvar nota
        </button>
        <button matButton type="button" class="secondary" (click)="cancel()">
          <mat-icon svgIcon="close" />
          Cancelar
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 700px;
        margin: auto;
      }
      h1 {
        font-family: var(--mat-sys-headline-small-font);
        font-size: var(--mat-sys-headline-small-size);
        font-weight: var(--mat-sys-headline-small-weight);
        line-height: var(--mat-sys-headline-small-line-height);
        margin: 1rem 0 1.5rem;
      }
      .back {
        color: var(--mat-sys-primary);
        text-decoration: none;
      }
      form,
      label {
        display: grid;
        gap: 0.5rem;
      }
      mat-form-field {
        width: 100%;
      }
      form {
        gap: 1.1rem;
      }
      input[type='color'] {
        height: 2.5rem;
        width: 5rem;
      }
      .actions {
        display: flex;
        gap: 0.7rem;
      }
      button.secondary {
        color: var(--mat-sys-primary);
      }
      button.danger {
        color: var(--mat-sys-error);
      }
      .field-error,
      .error {
        color: var(--mat-sys-error);
      }
      .warning {
        background: var(--mat-sys-surface-container);
        border: 1px solid var(--mat-sys-outline);
        border-radius: var(--mat-sys-corner-medium);
        margin: 1rem 0;
        padding: 1rem;
      }
      .warning p {
        margin-bottom: 0.75rem;
      }
      .image-row,
      .pending {
        align-items: center;
        display: flex;
        gap: 0.75rem;
        margin: 0.5rem 0;
      }
      .pending img {
        border-radius: var(--mat-sys-corner-small);
        height: 4rem;
        object-fit: cover;
        width: 4rem;
      }
    `,
  ],
})
export class NoteEditorPage implements OnInit, OnDestroy {
  private readonly application = inject(NOTES_APPLICATION);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly draft = signal<NoteDraft>({ title: '', content: '', backgroundColor: '', imageIds: [] });
  readonly draftModel = signal<EditorDraft>({ title: '', content: '', backgroundColor: '#ffffff' });
  readonly noteForm = form(this.draftModel);
  readonly noteId = this.route.snapshot.paramMap.get('id');
  readonly otherTabEditing = signal(false);
  readonly conflict = signal<Note | undefined>(undefined);
  readonly loadError = signal('');
  readonly imageError = signal('');
  readonly submitted = signal(false);
  readonly saving = signal(false);
  readonly ready = signal(!this.noteId);
  readonly pendingFiles = signal<{ file: File; url: string }[]>([]);
  readonly transparentBackground = signal(true);
  readonly note = signal<Note | undefined>(undefined);
  readonly previewNote = computed(() => {
    const current = this.note();
    return current ? { ...current, imageIds: this.draft().imageIds } : undefined;
  });

  ngOnInit(): void {
    if (this.noteId) void this.loadForEdit();
  }

  ngOnDestroy(): void {
    for (const item of this.pendingFiles()) URL.revokeObjectURL(item.url);
    if (this.noteId) this.application.cancelEdit(this.noteId);
  }

  async save(resolution?: 'overwrite'): Promise<void> {
    if (!this.ready()) return;
    this.submitted.set(true);
    const formValue = this.draftModel();
    const values: NoteDraft = {
      ...this.draft(),
      title: formValue.title,
      content: formValue.content,
      backgroundColor: this.transparentBackground() ? undefined : formValue.backgroundColor,
    };
    if (!values.title.trim()) {
      this.loadError.set('Informe um título para a nota.');
      return;
    }
    this.saving.set(true);
    this.loadError.set('');
    try {
      let result: SaveEditResult | undefined;
      if (this.noteId) {
        result = await this.application.saveEdit(
          this.noteId,
          values,
          resolution,
          this.pendingFiles().map((item) => item.file),
        );
        if (result.kind === 'conflict') {
          this.conflict.set(result.current);
          return;
        }
      } else {
        const created = await this.application.create(
          values,
          this.pendingFiles().map((item) => item.file),
        );
        await this.router.navigate(['/notes'], { state: { openNoteId: created.id } });
        return;
      }
      await this.router.navigate(['/notes'], { state: { openNoteId: this.noteId } });
    } catch (error) {
      this.loadError.set(
        error instanceof Error ? error.message : 'Não foi possível salvar a nota.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  async reloadLatest(): Promise<void> {
    if (!this.noteId) return;
    try {
      const current = await this.application.beginEdit(this.noteId);
      this.note.set(current.note);
      this.draft.set({
        title: current.note.title,
        content: current.note.content ?? '',
        backgroundColor: current.note.backgroundColor ?? '',
        imageIds: [...current.note.imageIds],
      });
      this.transparentBackground.set(!current.note.backgroundColor);
      this.draftModel.set({
        title: current.note.title,
        content: current.note.content ?? '',
        backgroundColor: current.note.backgroundColor ?? '#ffffff',
      });
      this.otherTabEditing.set(current.otherTabEditing);
      this.conflict.set(undefined);
      this.ready.set(true);
    } catch (error) {
      this.loadError.set(
        error instanceof Error ? error.message : 'Não foi possível recarregar a nota.',
      );
    }
  }

  cancel(): void {
    if (this.noteId) this.application.cancelEdit(this.noteId);
    void this.router.navigate(['/notes']);
  }

  selectFiles(event: Event): void {
    this.imageError.set('');
    const selected = [...((event.target as HTMLInputElement).files ?? [])];
    for (const file of selected) {
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

  removeImage(imageId: string): void {
    this.draft.update((draft) => ({
      ...draft,
      imageIds: draft.imageIds.filter((id) => id !== imageId),
    }));
  }

  private async loadForEdit(): Promise<void> {
    try {
      const editing = await this.application.beginEdit(this.noteId!);
      this.note.set(editing.note);
      this.otherTabEditing.set(editing.otherTabEditing);
      this.draft.set({
        title: editing.note.title,
        content: editing.note.content ?? '',
        backgroundColor: editing.note.backgroundColor ?? '',
        imageIds: [...editing.note.imageIds],
      });
      this.transparentBackground.set(!editing.note.backgroundColor);
      this.draftModel.set({
        title: editing.note.title,
        content: editing.note.content ?? '',
        backgroundColor: editing.note.backgroundColor ?? '#ffffff',
      });
      this.ready.set(true);
    } catch (error) {
      this.loadError.set(error instanceof Error ? error.message : 'Não foi possível abrir a nota.');
    }
  }
}
