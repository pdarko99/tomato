import { Component, inject, effect, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResponsiveNavComponent } from './shared/components/responsive-nav/responsive-nav.component';
import { IdleWarningDialogComponent } from './shared/components/idle-warning-dialog/idle-warning-dialog.component';
import { AuthService, IdleService } from './core/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ResponsiveNavComponent, IdleWarningDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  private authService = inject(AuthService);
  private idleService = inject(IdleService);

  protected title = 'TOMATO';

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.idleService.startMonitoring();
      }
    });
  }

  ngOnDestroy(): void {
    this.idleService.destroy();
  }
}
