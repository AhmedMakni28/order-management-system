import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Order, OrderService } from '../../../services/order.service';
import { Product, ProductService } from '../../../services/product.service';
import { User, UserService } from '../../../services/user.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  user: User | null = null;
  product: Product | null = null;
  isLoading = false;
  errorMessage = '';
  isAdmin = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly productService: ProductService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'Order ID not provided.';
      return;
    }

    this.loadOrderDetails(idParam);
  }

  loadOrderDetails(orderId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrderById(orderId).subscribe({
      next: order => {
        this.order = order;

        forkJoin({
          user: this.userService.getUserById(order.userId),
          product: this.productService.getProductById(order.productId)
        }).subscribe({
          next: ({ user, product }) => {
            this.user = user;
            this.product = product;
            this.isLoading = false;
          },
          error: () => {
            this.errorMessage = 'Failed to load order details.';
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Failed to load order.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  editOrder(): void {
    if (this.order && this.isAdmin) {
      this.router.navigate(['/orders/edit', this.order.id]);
    }
  }
}
