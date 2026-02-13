import { Component, inject, computed } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { IdleService } from '../../../core/services';

@Component({
  selector: 'app-idle-warning-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  template: `
    <p-dialog
      [visible]="idleService.showWarning()"
      [modal]="true"
      [closable]="false"
      [showHeader]="false"
      [style]="{ width: '400px', 'max-width': '90vw', 'border-radius': '16px' }"
      [draggable]="false"
      styleClass="idle-warning-dialog"
    >
      <div class="idle-dialog-body">
        <div class="icon-wrapper">
          <div class="icon-ring">
            <svg class="countdown-ring" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" class="ring-bg" />
              <circle
                cx="40"
                cy="40"
                r="36"
                class="ring-progress"
                [style.stroke-dashoffset]="strokeOffset()"
              />
            </svg>
            <i class="pi pi-clock icon-clock"></i>
          </div>
        </div>

        <h3 class="idle-title">Session Expiring</h3>
        <p class="idle-message">
          Your session is about to expire due to inactivity.
        </p>

        <div class="countdown-value">{{ idleService.countdownDisplay() }}</div>
        <p class="idle-sub">You will be automatically logged out</p>

        <div class="idle-actions">
          <p-button
            label="Logout"
            icon="pi pi-sign-out"
            severity="secondary"
            [outlined]="true"
            (onClick)="idleService.performLogout()"
            styleClass="idle-btn-logout"
          />
          <p-button
            label="Stay Logged In"
            icon="pi pi-check"
            (onClick)="idleService.stayLoggedIn()"
            styleClass="btn-tomato idle-btn-stay"
          />
        </div>
      </div>
    </p-dialog>
  `,
  styles: `
    :host ::ng-deep .idle-warning-dialog {
      .p-dialog {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      }

      .p-dialog-content {
        padding: 0;
      }
    }

    .idle-dialog-body {
      text-align: center;
      padding: 2.5rem 2rem 2rem;
    }

    .icon-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .icon-ring {
      position: relative;
      width: 80px;
      height: 80px;
    }

    .countdown-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-bg {
      fill: none;
      stroke: var(--p-surface-200);
      stroke-width: 4;
    }

    .ring-progress {
      fill: none;
      stroke: var(--tomato-primary);
      stroke-width: 4;
      stroke-linecap: round;
      stroke-dasharray: 226.2;
      transition: stroke-dashoffset 1s linear;
    }

    .icon-clock {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.75rem;
      color: var(--tomato-primary);
    }

    .idle-title {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--p-text-color);
    }

    .idle-message {
      margin: 0 0 1.25rem;
      font-size: 0.925rem;
      color: var(--p-text-secondary-color);
      line-height: 1.5;
    }

    .countdown-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--tomato-primary);
      letter-spacing: 1px;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .idle-sub {
      margin: 0 0 2rem;
      font-size: 0.8rem;
      color: var(--p-text-secondary-color);
    }

    .idle-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;

      :host ::ng-deep {
        .idle-btn-logout,
        .idle-btn-stay {
          flex: 1;
        }

        .idle-btn-stay {
          font-weight: 600;
        }
      }
    }
  `
})
export class IdleWarningDialogComponent {
  readonly idleService = inject(IdleService);

  private readonly circumference = 2 * Math.PI * 36; // ~226.2

  readonly strokeOffset = computed(() => {
    const fraction = this.idleService.countdownSeconds() / 60;
    return this.circumference * (1 - fraction);
  });
}
