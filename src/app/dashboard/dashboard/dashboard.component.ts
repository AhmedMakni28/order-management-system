import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { DashboardService, ProductStat, StatusStat } from '../../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalUsers = 0;
  totalProducts = 0;
  totalOrders = 0;
  ordersByStatus: StatusStat[] = [];
  topProducts: ProductStat[] = [];
  errorMessage = '';

  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    forkJoin({
      users: this.userService.getUsers(),
      products: this.productService.getProducts(),
      orders: this.orderService.getOrders()
    }).subscribe({
      next: ({ users, products, orders }) => {
        const metrics = this.dashboardService.buildMetrics(users.length, products, orders);
        this.totalUsers = metrics.totalUsers;
        this.totalProducts = metrics.totalProducts;
        this.totalOrders = metrics.totalOrders;
        this.ordersByStatus = metrics.ordersByStatus;
        this.topProducts = metrics.topProducts;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les statistiques.';
      }
    });
  }

}
