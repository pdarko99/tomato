import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiResponse, DashboardResponse } from '../models';
import { environment } from '../config/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getDashboard(): Observable<DashboardResponse | null> {
    return this.http.get<ApiResponse<DashboardResponse>>(`${this.apiUrl}/api/admin/dashboard`).pipe(
      map(response => response.data),
      catchError(() => of(null))
    );
  }
}
