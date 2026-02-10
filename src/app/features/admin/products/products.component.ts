import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { forkJoin } from 'rxjs';
import { Product } from '../../../core/models';
import { ProductService } from '../../../core/services';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  productService = inject(ProductService);

  productForm!: FormGroup;
  showDialog = false;
  isEditing = false;
  editingProductId: number | null = null;
  loading = false;
  pageLoading = signal(true);
  selectedFile: File | null = null;

  categoryOptions = signal<{ label: string; value: number }[]>([]);

  ngOnInit(): void {
    forkJoin([
      this.productService.fetchProducts(),
      this.productService.fetchCategories()
    ]).subscribe(() => {
      this.categoryOptions.set(
        this.productService.categories().map(c => ({
          label: c.name,
          value: c.id
        }))
      );
      this.pageLoading.set(false);
    });

    this.initForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: [null, [Validators.required]],
      productUrl: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  openAddDialog(): void {
    this.isEditing = false;
    this.editingProductId = null;
    this.selectedFile = null;
    this.productForm.reset({ price: 0, quantity: 0 });
    this.showDialog = true;
  }

  openEditDialog(product: Product): void {
    this.isEditing = true;
    this.editingProductId = product.id;
    this.selectedFile = null;
    this.productForm.patchValue({
      title: product.title,
      description: product.description,
      categoryId: product.categoryId,
      productUrl: product.productUrl,
      price: product.price,
      quantity: product.quantity
    });
    this.showDialog = true;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValues = this.productForm.value;
    const formData = new FormData();
    formData.append('title', formValues.title);
    formData.append('description', formValues.description);
    formData.append('categoryId', formValues.categoryId.toString());
    formData.append('price', formValues.price.toString());
    formData.append('quantity', formValues.quantity.toString());

    if (this.selectedFile) {
      formData.append('productImage', this.selectedFile);
    }

    if (this.isEditing && this.editingProductId) {
      formData.append('id', this.editingProductId.toString());
      this.productService.updateProduct(formData).subscribe({
        next: (updated) => {
          if (updated) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product updated successfully',
              life: 3000
            });
          }
          this.showDialog = false;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: (created) => {
          if (created) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product added successfully',
              life: 3000
            });
          }
          this.showDialog = false;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  confirmDelete(product: Product): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${product.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService.deleteProduct(product.id).subscribe(deleted => {
          if (deleted) {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Product deleted successfully',
              life: 3000
            });
          }
        });
      }
    });
  }

  getCategoryName(categoryId: number): string {
    return this.productService.getCategoryName(categoryId);
  }
}
