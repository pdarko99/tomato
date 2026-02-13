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
  imagePreview: string | null = null;

  categoryOptions = signal<{ label: string; value: number }[]>([]);

  ngOnInit(): void {
    forkJoin([
      this.productService.fetchProducts(),
      this.productService.fetchCategories()
    ]).subscribe({
      next: () => {
        this.categoryOptions.set(
          this.productService.categories().map(c => ({
            label: c.name,
            value: c.id
          }))
        );
        this.pageLoading.set(false);
      },
      error: () => {
        this.pageLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load data. Please refresh the page.',
          life: 5000
        });
      }
    });

    this.initForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: [null, [Validators.required]],
      productUrl: [''],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  openAddDialog(): void {
    this.isEditing = false;
    this.editingProductId = null;
    this.clearFile();
    this.productForm.reset({ amount: 0, quantity: 0 });
    this.showDialog = true;
  }

  openEditDialog(product: Product): void {
    this.isEditing = true;
    this.editingProductId = product.id;
    this.clearFile();
    this.productForm.patchValue({
      title: product.title,
      description: product.description,
      categoryId: product.categoryId,
      productUrl: product.productUrl,
      amount: product.price,
      quantity: product.quantity
    });
    this.showDialog = true;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.handleFile(file);
    }
  }

  removeFile(): void {
    this.clearFile();
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  private clearFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (!this.isEditing && !this.selectedFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Image Required',
        detail: 'Please select an image for the product',
        life: 3000
      });
      return;
    }

    this.loading = true;
    const formValues = this.productForm.value;
    const formData = new FormData();
    formData.append('title', formValues.title);
    formData.append('description', formValues.description);
    formData.append('categoryId', formValues.categoryId.toString());
    formData.append('amount', formValues.amount.toString());
    formData.append('quantity', formValues.quantity.toString());

    if (this.selectedFile) {
      formData.append('productImage', this.selectedFile);
    }

    if (this.isEditing && this.editingProductId) {
      formData.append('productId', this.editingProductId.toString());
      formData.append('price', formValues.amount.toString());

      this.productService.updateProduct(formData).subscribe({
        next: (updated) => {
          this.loading = false;
          if (updated) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product updated successfully',
              life: 3000
            });
            this.showDialog = false;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update product. Please try again.',
              life: 4000
            });
          }
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update product. Please try again.',
            life: 4000
          });
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: (created) => {
          this.loading = false;
          if (created) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product added successfully',
              life: 3000
            });
            this.showDialog = false;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to add product. Please try again.',
              life: 4000
            });
          }
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add product. Please try again.',
            life: 4000
          });
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
        this.productService.deleteProduct(product.id).subscribe({
          next: (deleted) => {
            if (deleted) {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Product deleted successfully',
                life: 3000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete product.',
                life: 4000
              });
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete product.',
              life: 4000
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
