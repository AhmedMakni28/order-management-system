import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Order, OrderService } from '../../../services/order.service';
import { Product, ProductService } from '../../../services/product.service';
import { ModalService } from '../../../services/modal.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  myOrders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  isAdmin = false;
  currentUserId: string | null = null;
  private productsById: Record<string, string> = {};

  constructor(
    private readonly authService: AuthService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly modalService: ModalService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';
    this.currentUserId = currentUser?.id === undefined ? null : String(currentUser.id);
    this.loadProductsAndOrders();
  }

  loadProductsAndOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      products: this.productService.getProducts(),
      orders: this.orderService.getOrders()
    }).subscribe({
      next: ({ products, orders }) => {
        this.products = products;
        this.productsById = Object.fromEntries(products.map(product => [product.id, product.name]));

        const currentUserId = String(this.currentUserId ?? '');
        this.myOrders = this.isAdmin
          ? []
          : orders.filter(order => String(order.userId) === currentUserId);

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les donnees.';
        this.isLoading = false;
      }
    });
  }

  getProductName(productId: string): string {
    return this.productsById[productId] ?? `#${productId}`;
  }

  onDelete(id: string): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Action reservee a admin.';
      return;
    }

    this.modalService.openConfirmation({
      title: 'Supprimer le produit',
      message: 'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action ne peut pas être annulée.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      isDangerous: true
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(product => String(product.id) !== String(id));
          this.productsById = Object.fromEntries(this.products.map(product => [product.id, product.name]));
          this.toastService.success('Produit supprime avec succes');
        },
        error: () => {
          this.errorMessage = 'La suppression a echoue.';
          this.toastService.error('Erreur lors de la suppression du produit');
        }
      });
    });
  }
}
