import { Injectable } from '@angular/core';
import { Order } from './order.service';
import { Product } from './product.service';

export interface StatusStat {
  status: string;
  count: number;
  percent: number;
}

export interface ProductStat {
  productName: string;
  totalQuantity: number;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  ordersByStatus: StatusStat[];
  topProducts: ProductStat[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor() {}

  buildMetrics(userCount: number, products: Product[], orders: Order[]): DashboardMetrics {
    return {
      totalUsers: userCount,
      totalProducts: products.length,
      totalOrders: orders.length,
      ordersByStatus: this.buildStatusStats(orders),
      topProducts: this.buildTopProducts(orders, products)
    };
  }

  private buildStatusStats(orders: Order[]): StatusStat[] {
    const statusCountMap = orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCountMap).map(([status, count]) => ({
      status,
      count,
      percent: orders.length > 0 ? (count / orders.length) * 100 : 0
    }));
  }

  private buildTopProducts(orders: Order[], products: Product[]): ProductStat[] {
    const quantityByProductId = orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.productId] = (acc[order.productId] ?? 0) + order.quantity;
      return acc;
    }, {});

    return Object.entries(quantityByProductId)
      .map(([productId, totalQuantity]) => {
        const product = products.find(item => item.id === productId);
        return {
          productName: product ? product.name : `Produit #${productId}`,
          totalQuantity
        };
      })
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
  }
}
