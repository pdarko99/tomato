import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Order, OrderStatus } from '../../../core/models';
import { OrderService } from '../../../core/services';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    TagModule,
    ButtonModule,
    DialogModule,
    ProgressSpinnerModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  selectedOrder = signal<Order | null>(null);
  showOrderDetails = false;
  loading = signal(true);

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe(orders => {
      this.orders.set(orders);
      this.loading.set(false);
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
    this.showOrderDetails = true;
  }

  getStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
