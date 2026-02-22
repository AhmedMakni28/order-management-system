import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Product {
  id: number | string;
  name: string;
  price: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiBaseUrl}/products`;

  constructor(private readonly http: HttpClient) {}

  private toApiId(id: string | number): string | number {
    if (typeof id === 'number') {
      return id;
    }

    const trimmed = id.trim();
    return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${this.toApiId(id)}`);
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string | number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${this.toApiId(id)}`, product);
  }

  deleteProduct(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.toApiId(id)}`);
  }
}
