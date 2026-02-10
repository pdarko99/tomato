import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    AvatarModule,
    DividerModule,
    ToastModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss'
})
export class AdminSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  authService = inject(AuthService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loadingProfile = false;
  loadingPassword = false;

  ngOnInit(): void {
    const user = this.authService.currentUser();

    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || '']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loadingProfile = true;
    const result = this.authService.updateProfile(this.profileForm.value);

    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: result.message,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.message,
        life: 3000
      });
    }

    this.loadingProfile = false;
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'New passwords do not match',
        life: 3000
      });
      return;
    }

    this.loadingPassword = true;
    const result = this.authService.changePassword(currentPassword, newPassword);

    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: result.message,
        life: 3000
      });
      this.passwordForm.reset();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.message,
        life: 3000
      });
    }

    this.loadingPassword = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get userAvatar(): string {
    const user = this.authService.currentUser();
    return user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=e74c3c&color=fff&size=128`;
  }
}
