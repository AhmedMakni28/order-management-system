import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Order {
  id: number | string;
  userId: number | string;
  productId: number | string;
  quantity: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  private toApiId(id: string | number): string | number {
    if (typeof id === 'number') {
      return id;
    }

    const trimmed = id.trim();
    return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: string | number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${this.toApiId(id)}`);
  }

  addOrder(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrder(id: string | number, order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${this.toApiId(id)}`, order);
  }

  deleteOrder(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.toApiId(id)}`);
  }
}
