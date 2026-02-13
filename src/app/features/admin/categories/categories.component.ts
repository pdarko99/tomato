import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Category } from '../../../core/models';
import { ProductService } from '../../../core/services';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  productService = inject(ProductService);

  categoryForm!: FormGroup;
  showDialog = false;
  isEditing = false;
  editingCategoryId: number | null = null;
  loading = false;
  pageLoading = signal(true);

  ngOnInit(): void {
    this.productService.fetchCategories().subscribe({
      next: () => this.pageLoading.set(false),
      error: () => {
        this.pageLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories.',
          life: 5000
        });
      }
    });
    this.initForm();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  openAddDialog(): void {
    this.isEditing = false;
    this.editingCategoryId = null;
    this.categoryForm.reset();
    this.showDialog = true;
  }

  openEditDialog(category: Category): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
    this.showDialog = true;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValues = this.categoryForm.value;

    if (this.isEditing && this.editingCategoryId) {
      this.productService.updateCategory(this.editingCategoryId, formValues).subscribe({
        next: (updated) => {
          this.loading = false;
          if (updated) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category updated successfully',
              life: 3000
            });
            this.showDialog = false;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update category. Please try again.',
              life: 4000
            });
          }
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update category. Please try again.',
            life: 4000
          });
        }
      });
    } else {
      this.productService.createCategory(formValues).subscribe({
        next: (created) => {
          this.loading = false;
          if (created) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category added successfully',
              life: 3000
            });
            this.showDialog = false;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to add category. Please try again.',
              life: 4000
            });
          }
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add category. Please try again.',
            life: 4000
          });
        }
      });
    }
  }

  confirmDelete(category: Category): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService.deleteCategory(category.id).subscribe({
          next: (deleted) => {
            if (deleted) {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Category deleted successfully',
                life: 3000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete category.',
                life: 4000
              });
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete category.',
              life: 4000
            });
          }
        });
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
