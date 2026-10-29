import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { CURRENT_USER_PROVIDER, LOCAL_USER_PROVIDER } from './core/identity/current-user.provider';
import { routes } from './app.routes';
import { EDITING_SESSION_COORDINATOR_PROVIDER } from './features/notes/data-access/editing-session.coordinator';
import { NOTE_IMAGE_REPOSITORY_PROVIDER } from './features/notes/data-access/note-image.repository';
import { NOTE_REPOSITORY_PROVIDER } from './features/notes/data-access/note.repository';
import { NOTES_APPLICATION_PROVIDER } from './features/notes/data-access/notes-application.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => {
      const icons = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);
      for (const name of [
        'grid_view',
        'view_list',
        'sort',
        'push_pin',
        'edit',
        'delete',
        'arrow_upward',
        'arrow_downward',
        'close',
        'add_photo_alternate',
        'add',
        'remove_circle',
        'arrow_back',
        'refresh',
        'save',
      ]) {
        icons.addSvgIcon(name, sanitizer.bypassSecurityTrustResourceUrl(`/icons/${name}.svg`));
      }
    }),
    { provide: CURRENT_USER_PROVIDER, useValue: LOCAL_USER_PROVIDER },
    EDITING_SESSION_COORDINATOR_PROVIDER,
    NOTE_IMAGE_REPOSITORY_PROVIDER,
    NOTE_REPOSITORY_PROVIDER,
    NOTES_APPLICATION_PROVIDER,
  ],
};
