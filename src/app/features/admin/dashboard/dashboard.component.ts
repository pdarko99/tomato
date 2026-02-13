import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../../core/services';
import { RecentOrderResponse, OrderStatus } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private messageService = inject(MessageService);

  stats = signal({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0
  });

  loading = signal(true);
  loadError = signal(false);
  recentOrders = signal<RecentOrderResponse[]>([]);

  salesChartData: any;
  salesChartOptions: any;
  categoryChartData: any;
  categoryChartOptions: any;

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        if (!dashboard) {
          this.loading.set(false);
          this.loadError.set(true);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load dashboard data.',
            life: 5000
          });
          return;
        }

        this.stats.set({
          totalProducts: dashboard.overview.totalProducts,
          totalOrders: dashboard.overview.totalOrders,
          totalRevenue: dashboard.overview.totalRevenue,
          todayOrders: dashboard.overview.todayOrders
        });

        this.recentOrders.set(dashboard.recentOrders || []);
        this.initCharts(dashboard);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load dashboard data.',
          life: 5000
        });
      }
    });
  }

  private initCharts(dashboard: any): void {
    const monthRevenue = dashboard.overview.monthRevenue ?? 0;
    const weekRevenue = dashboard.overview.weekRevenue ?? 0;
    const todayRevenue = dashboard.overview.todayRevenue ?? 0;

    this.salesChartData = {
      labels: ['Total', 'This Month', 'This Week', 'Today'],
      datasets: [
        {
          label: 'Revenue',
          data: [dashboard.overview.totalRevenue, monthRevenue, weekRevenue, todayRevenue],
          fill: true,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          tension: 0.4
        }
      ]
    };

    this.salesChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    };

    const categoryStats = dashboard.categoryStats || [];
    this.categoryChartData = {
      labels: categoryStats.map((c: any) => c.categoryName),
      datasets: [
        {
          data: categoryStats.map((c: any) => c.productCount),
          backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
          hoverBackgroundColor: ['#c0392b', '#2980b9', '#27ae60', '#e67e22', '#8e44ad', '#16a085']
        }
      ]
    };

    this.categoryChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severityMap: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      PENDING: 'warn',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      pending: 'warn',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'danger'
    };
    return severityMap[status] || 'info';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
