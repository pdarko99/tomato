import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService, CartService } from '../../../core/services';

@Component({
  selector: 'app-responsive-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    ButtonModule,
    BadgeModule,
    AvatarModule,
    MenuModule
  ],
  templateUrl: './responsive-nav.component.html',
  styleUrl: './responsive-nav.component.scss'
})
export class ResponsiveNavComponent {
  private router = inject(Router);
  authService = inject(AuthService);
  cartService = inject(CartService);

  userMenuItems: MenuItem[] = [
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings'])
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  adminMenuItems: MenuItem[] = [
    {
      label: 'Admin Dashboard',
      icon: 'pi pi-chart-bar',
      command: () => this.router.navigate(['/admin/dashboard'])
    },
    {
      label: 'Manage Products',
      icon: 'pi pi-box',
      command: () => this.router.navigate(['/admin/products'])
    },
    {
      label: 'Manage Categories',
      icon: 'pi pi-tags',
      command: () => this.router.navigate(['/admin/categories'])
    },
    {
      separator: true
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/admin/settings'])
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  menuItems = computed<MenuItem[]>(() => {
    return this.authService.isAdmin() ? this.adminMenuItems : this.userMenuItems;
  });

  userAvatar = computed(() => {
    const user = this.authService.currentUser();
    return user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=e74c3c&color=fff`;
  });

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
