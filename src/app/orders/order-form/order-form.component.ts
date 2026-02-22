import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { Product, ProductService } from '../../../services/product.service';
import { User, UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  users: User[] = [];
  products: Product[] = [];
  isEditMode = false;
  isAdmin = false;
  currentUserId: number | null = null;
  orderId: string | null = null;
  editOrderUserId: number | null = null;
  errorMessage = '';
  isLoading = false;

  orderForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.orderForm = this.fb.group({
      userId: [null as number | null, [Validators.required]],
      productId: [null as number | null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      status: ['pending', [Validators.required]]
    });
  }

  asSelectValue(id: number | string | null | undefined): number | null {
    return id === null || id === undefined ? null : Number(id);
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';
    this.currentUserId = currentUser?.id === undefined ? null : Number(currentUser.id);

    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;
    this.orderId = idParam ?? null;

    if (this.isEditMode && !this.isAdmin) {
      this.router.navigate(['/orders']);
      return;
    }

    this.isLoading = true;
    const sharedRequests = {
      users: this.userService.getUsers(),
      products: this.productService.getProducts()
    };

    if (this.isEditMode && this.orderId !== null) {
      forkJoin({
        ...sharedRequests,
        order: this.orderService.getOrderById(this.orderId)
      }).subscribe({
        next: ({ users, products, order }) => {
          this.users = users;
          this.products = products;
          this.editOrderUserId = Number(order.userId);
          this.orderForm.patchValue({
            userId: this.asSelectValue(order.userId),
            productId: this.asSelectValue(order.productId),
            quantity: Number(order.quantity),
            status: String(order.status)
          });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading order:', err);
          this.errorMessage = 'Impossible de charger les données.';
          this.isLoading = false;
        }
      });
      return;
    }

    forkJoin(sharedRequests).subscribe({
      next: ({ users, products }) => {
        this.users = this.isAdmin ? users : [];
        this.products = products;

        if (!this.isAdmin && this.currentUserId !== null) {
          this.orderForm.patchValue({
            userId: this.asSelectValue(this.currentUserId),
            status: 'pending'
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.errorMessage = 'Impossible de charger les données.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const value = this.orderForm.getRawValue();
    const resolvedAdminUserId = Number(value.userId ?? this.editOrderUserId ?? 0);
    const payload = {
      userId: this.isAdmin ? resolvedAdminUserId : Number(this.currentUserId ?? 0),
      productId: Number(value.productId ?? 0),
      quantity: Number(value.quantity ?? 1),
      status: this.isAdmin ? (value.status ?? 'pending') : 'pending'
    };

    if (this.isEditMode && this.orderId !== null) {
      this.orderService.updateOrder(this.orderId, { id: this.orderId, ...payload }).subscribe({
        next: () => {
          this.toastService.success('Commande modifiée avec succès');
          this.router.navigate(['/orders']);
        },
        error: (err) => {
          console.error('Error updating order:', err);
          this.errorMessage = 'La mise à jour a échoué.';
          this.toastService.error('Erreur lors de la modification');
        }
      });
      return;
    }

    this.orderService.addOrder(payload).subscribe({
      next: () => {
        this.toastService.success('Commande créée avec succès');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('Error creating order:', err);
        this.errorMessage = 'La création a échoué.';
        this.toastService.error('Erreur lors de la création');
      }
    });
  }
}
