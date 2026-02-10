import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResponsiveNavComponent } from './shared/components/responsive-nav/responsive-nav.component';
import { AuthService } from './core/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ResponsiveNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private authService = inject(AuthService);

  protected title = 'TOMATO';

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
