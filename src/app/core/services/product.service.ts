import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { Product, Category, ApiResponse } from '../models';
import { environment } from '../config/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private productsSignal = signal<Product[]>([]);
  private categoriesSignal = signal<Category[]>([]);

  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();

  fetchProducts(page: number = 0, limit: number = 100, searchQuery?: string): Observable<Product[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchQuery) {
      params = params.set('searchQuery', searchQuery);
    }

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/api/admin/products`, { params }).pipe(
      map(response => response.data || []),
      tap(products => this.productsSignal.set(products)),
      catchError(() => {
        return of([] as Product[]);
      })
    );
  }

  searchProducts(page: number, limit: number, searchQuery?: string): Observable<Product[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchQuery) {
      params = params.set('searchQuery', searchQuery);
    }

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/api/admin/products`, { params }).pipe(
      map(response => response.data || []),
      catchError(() => of([] as Product[]))
    );
  }

  fetchCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/api/admin/categories`).pipe(
      map(response => response.data || []),
      tap(categories => this.categoriesSignal.set(categories)),
      catchError(() => {
        return of([] as Category[]);
      })
    );
  }

  getProductById(id: number): Observable<Product | null> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/api/admin/products/${id}`).pipe(
      map(response => response.data),
      catchError(() => of(null))
    );
  }

  createProduct(formData: FormData): Observable<Product | null> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/api/admin/products`, formData).pipe(
      map(response => response.data),
      tap(() => this.fetchProducts().subscribe()),
      catchError(() => of(null))
    );
  }

  updateProduct(formData: FormData): Observable<Product | null> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/api/admin/products`, formData).pipe(
      map(response => response.data),
      tap(() => this.fetchProducts().subscribe()),
      catchError(() => of(null))
    );
  }

  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/api/admin/products/${id}`).pipe(
      map(() => true),
      tap(() => this.fetchProducts().subscribe()),
      catchError(() => of(false))
    );
  }

  createCategory(request: { name: string; description: string }): Observable<Category | null> {
    return this.http.post<ApiResponse<Category>>(`${this.apiUrl}/api/admin/categories`, request).pipe(
      map(response => response.data),
      tap(() => this.fetchCategories().subscribe()),
      catchError(() => of(null))
    );
  }

  updateCategory(id: number, request: { name: string; description: string }): Observable<Category | null> {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/api/admin/categories/${id}`, request).pipe(
      map(response => response.data),
      tap(() => this.fetchCategories().subscribe()),
      catchError(() => of(null))
    );
  }

  deleteCategory(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/api/admin/categories/${id}`).pipe(
      map(() => true),
      tap(() => this.fetchCategories().subscribe()),
      catchError(() => of(false))
    );
  }

  getCategoryName(categoryId: number): string {
    const category = this.categoriesSignal().find(c => c.id === categoryId);
    return category?.name ?? 'Unknown';
  }
}
