import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { THEME_PREFERENCE_SERVICE } from './core/theme/theme-preference.contract';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `
    @if (theme.persistenceError(); as error) {
      <p class="theme-persistence-error" role="alert">{{ error }}</p>
    }
    <main><router-outlet /></main>
  `,
  styleUrl: './app.component.css',
})
export class App {
  readonly theme = inject(THEME_PREFERENCE_SERVICE);
}
