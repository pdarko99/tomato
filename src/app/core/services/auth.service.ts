import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { User, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '../models';
import { environment } from '../config/environment';

const TOKEN_KEY = 'tomato_token';
const CURRENT_USER_KEY = 'tomato_current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.isAdmin ?? false);

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      this.currentUserSignal.set(JSON.parse(storedUser));
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(request: LoginRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        const user: User = {
          userId: response.userId,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          token: response.token,
          expiresAt: response.expiresAt,
          isAdmin: response.email === 'admin@tomato.com'
        };
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      }),
      map(() => ({ success: true, message: 'Login successful!' })),
      catchError(error => {
        const message = error.error?.message || error.error?.error || 'Invalid email or password';
        return of({ success: false, message });
      })
    );
  }

  register(request: RegisterRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      tap(response => {
        const user: User = {
          userId: response.userId,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          token: response.token,
          expiresAt: response.expiresAt,
          isAdmin: false
        };
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      }),
      map(() => ({ success: true, message: 'Registration successful!' })),
      catchError(error => {
        const message = error.error?.message || error.error?.error || 'Registration failed';
        return of({ success: false, message });
      })
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  updateProfile(updates: Partial<User>): { success: boolean; message: string } {
    const currentUser = this.currentUserSignal();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.currentUserSignal.set(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      return { success: true, message: 'Profile updated successfully' };
    }
    return { success: false, message: 'No user is logged in' };
  }

  changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
    this.http.post<any>(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(() => of(null))
    ).subscribe();

    return { success: true, message: 'Password change request sent' };
  }
}
