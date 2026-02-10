import { Component, inject, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Product } from '../../../core/models';
import { ProductService, CartService } from '../../../core/services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataViewModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TagModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchQuery = signal('');
  selectedCategory = signal<number | null>(null);
  loading = signal(true);
  loadingMore = signal(false);
  hasMore = signal(true);
  layout: 'grid' | 'list' = 'grid';

  displayedProducts = signal<Product[]>([]);
  categories = this.productService.categories;
  private currentPage = 0;
  private readonly pageSize = 10;

  categoryOptions = computed(() => [
    { label: 'All Categories', value: null },
    ...this.categories().map(c => ({ label: c.name, value: c.id }))
  ]);

  filteredProducts = computed(() => {
    const products = this.displayedProducts();
    const categoryId = this.selectedCategory();
    if (categoryId !== null) {
      return products.filter(p => p.categoryId === categoryId);
    }
    return products;
  });

  ngOnInit(): void {
    this.productService.fetchCategories().subscribe();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.resetAndLoad();
    });

    this.loadProducts(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.loadingMore() || !this.hasMore()) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 200;

    if (scrollPosition >= threshold) {
      this.loadMore();
    }
  }

  private loadProducts(initial: boolean): void {
    if (initial) {
      this.loading.set(true);
    }

    this.productService.searchProducts(this.currentPage, this.pageSize, this.searchQuery() || undefined)
      .subscribe(products => {
        if (initial) {
          this.displayedProducts.set(products);
          this.loading.set(false);
        } else {
          this.displayedProducts.update(current => [...current, ...products]);
          this.loadingMore.set(false);
        }
        this.hasMore.set(products.length >= this.pageSize);
      });
  }

  private loadMore(): void {
    this.loadingMore.set(true);
    this.currentPage++;
    this.loadProducts(false);
  }

  private resetAndLoad(): void {
    this.currentPage = 0;
    this.hasMore.set(true);
    this.loadProducts(true);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${product.title} has been added to your cart`,
      life: 2000
    });
  }

  isInCart(productId: number): boolean {
    return this.cartService.isInCart(productId);
  }

  getCategoryName(categoryId: number): string {
    return this.productService.getCategoryName(categoryId);
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
  }
}
