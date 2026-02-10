import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { CartService, OrderService } from '../../../core/services';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    TextareaModule,
    DividerModule,
    StepsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  cartService = inject(CartService);
  private orderService = inject(OrderService);

  checkoutForm!: FormGroup;
  activeStep = 0;
  loading = false;

  steps: MenuItem[] = [
    { label: 'Shipping' },
    { label: 'Payment' },
    { label: 'Confirm' }
  ];

  ngOnInit(): void {
    if (this.cartService.cartCount() === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      cardNumber: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.minLength(3)]],
      cardHolderName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  nextStep(): void {
    if (this.activeStep === 0) {
      if (this.checkoutForm.get('shippingAddress')?.invalid) {
        this.checkoutForm.get('shippingAddress')?.markAsTouched();
        return;
      }
    } else if (this.activeStep === 1) {
      const paymentFields = ['cardNumber', 'expiryDate', 'cvv', 'cardHolderName'];
      let valid = true;
      paymentFields.forEach(field => {
        if (this.checkoutForm.get(field)?.invalid) {
          this.checkoutForm.get(field)?.markAsTouched();
          valid = false;
        }
      });
      if (!valid) return;
    }

    if (this.activeStep < 2) {
      this.activeStep++;
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { shippingAddress, cardNumber, expiryDate, cvv, cardHolderName } = this.checkoutForm.value;

    this.orderService.createOrder(
      { cardNumber, expiryDate, cvv, cardHolderName },
      shippingAddress
    ).subscribe({
      next: (order) => {
        if (order) {
          this.messageService.add({
            severity: 'success',
            summary: 'Order Placed!',
            detail: `Your order #${order.id} has been placed successfully`,
            life: 3000
          });

          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 1500);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to place order. Please try again.',
            life: 3000
          });
          this.loading = false;
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to place order. Please try again.',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  getTotalWithTax(): number {
    return this.cartService.cartTotal() * 1.08;
  }

  get shippingAddress() {
    return this.checkoutForm.get('shippingAddress');
  }

  get cardNumber() {
    return this.checkoutForm.get('cardNumber');
  }

  get expiryDate() {
    return this.checkoutForm.get('expiryDate');
  }

  get cvv() {
    return this.checkoutForm.get('cvv');
  }

  get cardHolderName() {
    return this.checkoutForm.get('cardHolderName');
  }
}
