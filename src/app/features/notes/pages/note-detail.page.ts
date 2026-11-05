import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NOTES_APPLICATION } from '../data-access/service-contracts';
import { Note } from '../domain/note.model';
import { getForegroundColor } from '../domain/note.factory';
import { NoteImagesComponent } from '../ui/note-images.component';

interface NoteDetailDialogData {
  noteId: string;
}

@Component({
  selector: 'app-note-detail-page',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, NoteImagesComponent],
  template: `
    <header class="dialog-header">
      <button
        matIconButton
        type="button"
        aria-label="Fechar detalhe da nota"
        (click)="dialogRef.close()"
      >
        <mat-icon svgIcon="close" />
      </button>
    </header>
    @if (!note()) {
      <h1 class="visually-hidden" id="note-dialog-title">Detalhe da nota</h1>
    }
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    @if (note(); as current) {
      <mat-card
        class="detail-card"
        [style.backgroundColor]="current.backgroundColor || 'transparent'"
        [style.color]="foregroundColor(current)"
      >
        <app-note-images [note]="current" />
        <mat-card-content>
          <h1 id="note-dialog-title">{{ current.title }}</h1>
          @if (current.content) {
            <p class="content">{{ current.content }}</p>
          }
          <p class="date">Atualizada em {{ current.updatedAt | date: 'short' }}</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button matButton="tonal" type="button" (click)="edit(current)">
            <mat-icon svgIcon="edit" />
            Editar nota
          </button>
          <button matButton type="button" class="delete-button" (click)="remove(current)">
            <mat-icon svgIcon="delete" />
            Remover nota
          </button>
        </mat-card-actions>
      </mat-card>
    } @else if (!error()) {
      <p role="status">Carregando nota…</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        max-height: min(85vh, 60rem);
        overflow: auto;
      }
      .dialog-header {
        display: flex;
        justify-content: flex-end;
        padding: 0.25rem 0.75rem;
      }
      .detail-card {
        border-radius: var(--mat-sys-corner-none);
        box-shadow: none;
        overflow: hidden;
        padding: 0;
      }
      .detail-card h1 {
        font-family: var(--mat-sys-headline-small-font);
        font-size: var(--mat-sys-headline-small-size);
        font-weight: var(--mat-sys-headline-small-weight);
        line-height: var(--mat-sys-headline-small-line-height);
        margin: 0 0 1rem;
        overflow-wrap: anywhere;
      }
      .content {
        line-height: var(--mat-sys-body-medium-line-height);
        white-space: pre-wrap;
      }
      .date {
        color: inherit;
        font-size: var(--mat-sys-body-medium-size);
        margin-top: 1.5rem;
      }
      .delete-button {
        color: inherit;
      }
      .error {
        color: var(--mat-sys-error);
        margin: 1rem 1.5rem;
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
    `,
  ],
})
export class NoteDetailPage implements OnInit {
  readonly data = inject<NoteDetailDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<NoteDetailPage>);
  private readonly application = inject(NOTES_APPLICATION);
  private readonly router = inject(Router);
  readonly note = signal<Note | undefined>(undefined);
  readonly error = signal('');

  ngOnInit(): void {
    void this.load(this.data.noteId);
  }

  foregroundColor(note: Note): string {
    return note.backgroundColor
      ? getForegroundColor(note.backgroundColor)
      : 'var(--mat-sys-on-surface)';
  }

  edit(note: Note): void {
    this.dialogRef.close();
    void this.router.navigate(['/notes', note.id, 'edit']);
  }

  async remove(note: Note): Promise<void> {
    if (!globalThis.confirm('Remover esta nota e suas imagens?')) return;
    try {
      await this.application.delete(note.id);
      this.dialogRef.close();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Não foi possível remover a nota.');
    }
  }

  private async load(id: string): Promise<void> {
    try {
      const note = await this.application.get(id);
      if (!note) {
        this.error.set('A nota não existe ou não pertence ao usuário atual.');
        return;
      }
      this.note.set(note);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Não foi possível carregar a nota.');
    }
  }
}
