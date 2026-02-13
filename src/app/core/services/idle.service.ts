import { Injectable, inject, signal, computed, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, timer, Subject } from 'rxjs';
import { switchMap, throttleTime, takeUntil } from 'rxjs/operators';
import { AuthService } from './auth.service';

const IDLE_TIMEOUT_MS = 14 * 60 * 1000;       // 14 minutes before warning
const WARNING_DURATION_MS = 60 * 1000;         // 60-second countdown
const TOTAL_TIMEOUT_MS = IDLE_TIMEOUT_MS + WARNING_DURATION_MS; // 15 min total
const STORAGE_KEY = 'tomato_last_activity';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private ngZone = inject(NgZone);
  private authService = inject(AuthService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();
  private activitySub: Subscription | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private monitoring = false;

  readonly showWarning = signal(false);
  readonly countdownSeconds = signal(60);
  readonly countdownDisplay = computed(() => {
    const secs = this.countdownSeconds();
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  });

  startMonitoring(): void {
    if (this.monitoring) return;
    this.monitoring = true;

    this.updateLastActivity();
    this.checkElapsedOnStart();
    this.setupActivityListener();
    this.setupStorageListener();
    this.setupVisibilityListener();
  }

  stayLoggedIn(): void {
    this.showWarning.set(false);
    this.clearCountdown();
    this.updateLastActivity();
    this.restartIdleTimer();
  }

  performLogout(): void {
    this.showWarning.set(false);
    this.clearCountdown();
    localStorage.removeItem(STORAGE_KEY);
    this.authService.logout();
    this.ngZone.run(() => this.router.navigate(['/auth/login']));
  }

  destroy(): void {
    this.monitoring = false;
    this.destroy$.next();
    this.destroy$.complete();
    this.activitySub?.unsubscribe();
    this.activitySub = null;
    this.clearCountdown();
  }

  private checkElapsedOnStart(): void {
    const last = this.getLastActivity();
    if (!last) return;

    const elapsed = Date.now() - last;
    if (elapsed >= TOTAL_TIMEOUT_MS) {
      this.performLogout();
    } else if (elapsed >= IDLE_TIMEOUT_MS) {
      const remaining = Math.ceil((TOTAL_TIMEOUT_MS - elapsed) / 1000);
      this.startCountdown(remaining);
    }
  }

  private setupActivityListener(): void {
    this.ngZone.runOutsideAngular(() => {
      const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;
      const activity$ = merge(
        ...events.map(evt => fromEvent(document, evt))
      ).pipe(
        throttleTime(1000),
        takeUntil(this.destroy$)
      );

      this.activitySub = activity$.pipe(
        switchMap(() => {
          this.updateLastActivity();
          if (this.showWarning()) {
            this.ngZone.run(() => {
              this.showWarning.set(false);
              this.clearCountdown();
            });
          }
          return timer(IDLE_TIMEOUT_MS);
        })
      ).subscribe(() => {
        this.ngZone.run(() => this.onIdleTimeout());
      });
    });
  }

  private setupStorageListener(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent<StorageEvent>(window, 'storage').pipe(
        takeUntil(this.destroy$)
      ).subscribe(event => {
        if (event.key === STORAGE_KEY && event.newValue) {
          this.ngZone.run(() => {
            this.showWarning.set(false);
            this.clearCountdown();
          });
        }
        if (event.key === 'tomato_current_user' && !event.newValue) {
          this.ngZone.run(() => this.performLogout());
        }
      });
    });
  }

  private setupVisibilityListener(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(document, 'visibilitychange').pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        if (document.visibilityState !== 'visible') return;

        const last = this.getLastActivity();
        if (!last) return;

        const elapsed = Date.now() - last;
        if (elapsed >= TOTAL_TIMEOUT_MS) {
          this.ngZone.run(() => this.performLogout());
        } else if (elapsed >= IDLE_TIMEOUT_MS) {
          const remaining = Math.ceil((TOTAL_TIMEOUT_MS - elapsed) / 1000);
          this.ngZone.run(() => this.startCountdown(remaining));
        }
      });
    });
  }

  private onIdleTimeout(): void {
    this.startCountdown(60);
  }

  private startCountdown(seconds: number): void {
    this.clearCountdown();
    this.countdownSeconds.set(seconds);
    this.showWarning.set(true);

    this.countdownInterval = setInterval(() => {
      const current = this.countdownSeconds() - 1;
      if (current <= 0) {
        this.performLogout();
      } else {
        this.countdownSeconds.set(current);
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private restartIdleTimer(): void {
    this.activitySub?.unsubscribe();
    this.activitySub = null;
    this.setupActivityListener();
  }

  private updateLastActivity(): void {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  private getLastActivity(): number | null {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? parseInt(val, 10) : null;
  }
}
