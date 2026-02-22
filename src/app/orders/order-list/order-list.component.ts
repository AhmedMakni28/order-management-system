import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Order, OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { ModalService } from '../../../services/modal.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  private readonly allowedStatuses = ['pending', 'processing', 'shipped', 'cancelled'] as const;
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  isAdmin = false;
  currentUserId: number | null = null;
  displayedColumns: string[] = [];
  private usersById: Record<string, string> = {};
  private productsById: Record<string, string> = {};

  constructor(
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly modalService: ModalService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';
    this.currentUserId = currentUser?.id === undefined ? null : Number(currentUser.id);
    this.displayedColumns = this.isAdmin
      ? ['user', 'product', 'quantity', 'status', 'actions']
      : ['product', 'quantity', 'status'];
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      orders: this.orderService.getOrders(),
      users: this.userService.getUsers(),
      products: this.productService.getProducts()
    }).subscribe({
      next: ({ orders, users, products }) => {
        this.usersById = Object.fromEntries(users.map(user => [user.id, user.name]));
        this.productsById = Object.fromEntries(products.map(product => [product.id, product.name]));

        const currentUserId = String(this.currentUserId ?? '');
        this.orders = this.isAdmin
          ? orders
          : orders.filter(order => String(order.userId) === currentUserId);

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les commandes.';
        this.isLoading = false;
      }
    });
  }

  getUserName(userId: string): string {
    return this.usersById[userId] ?? `#${userId}`;
  }

  getProductName(productId: string): string {
    return this.productsById[productId] ?? `#${productId}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'hourglass_top';
      case 'shipped':
        return 'local_shipping';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  }

  formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'En attente',
      'processing': 'En cours',
      'shipped': 'Expédié',
      'cancelled': 'Annulé'
    };
    return statusMap[status] ?? status;
  }

  onDelete(id: string): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Action reservee a admin.';
      return;
    }

    this.modalService.openConfirmation({
      title: 'Supprimer la commande',
      message: 'Êtes-vous sûr de vouloir supprimer cette commande ? Cette action ne peut pas être annulée.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      isDangerous: true
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.orders = this.orders.filter(order => String(order.id) !== String(id));
          this.toastService.success('Commande supprimee avec succes');
        },
        error: () => {
          this.errorMessage = 'La suppression a echoue.';
          this.toastService.error('Erreur lors de la suppression de la commande');
        }
      });
    });
  }

  onQuickUpdate(order: Order): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Action reservee a admin.';
      return;
    }

    const statusInput = prompt('Nouveau status (pending, processing, shipped, cancelled)', order.status);
    const quantityInput = prompt('Nouvelle quantite', `${order.quantity}`);

    if (statusInput === null || quantityInput === null) {
      return;
    }

    const normalizedStatus = statusInput.trim().toLowerCase();
    if (!this.allowedStatuses.includes(normalizedStatus as typeof this.allowedStatuses[number])) {
      this.errorMessage = 'Status invalide. Valeurs autorisees: pending, processing, shipped, cancelled.';
      return;
    }

    const quantity = Number(quantityInput);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      this.errorMessage = 'Quantite invalide.';
      return;
    }

    const updatedOrder: Order = {
      ...order,
      status: normalizedStatus,
      quantity
    };

    this.orderService.updateOrder(order.id, updatedOrder).subscribe({
      next: savedOrder => {
        this.orders = this.orders.map(item => (item.id === savedOrder.id ? savedOrder : item));
      },
      error: () => {
        this.errorMessage = 'La mise a jour a echoue.';
      }
    });
  }
}
