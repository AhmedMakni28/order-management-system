import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { User, UserService } from '../../../services/user.service';
import { ModalService } from '../../../services/modal.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  orderCountByUserId: Record<string, number> = {};
  isLoading = false;
  errorMessage = '';
  router: Router;  // Expose router to template
  displayedColumns: string[] = ['name', 'email', 'role', 'orders', 'actions'];

  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    router: Router,
    private readonly modalService: ModalService,
    private readonly toastService: ToastService
  ) {
    this.router = router;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      users: this.userService.getUsers(),
      orders: this.orderService.getOrders()
    }).subscribe({
      next: ({ users, orders }) => {
        this.users = users;
        this.orderCountByUserId = orders.reduce<Record<string, number>>((acc, order) => {
          const userId = String(order.userId);
          acc[userId] = (acc[userId] ?? 0) + 1;
          return acc;
        }, {});
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.isLoading = false;
      }
    });
  }

  getOrderCount(userId: string): number {
    return this.orderCountByUserId[userId] ?? 0;
  }

  onEdit(userId: string): void {
    this.router.navigate(['/users/edit', userId]).catch(e => {
      console.error('Navigation error:', e);
    });
  }

  onDelete(userId: string | number): void {
    this.modalService.openConfirmation({
      title: 'Supprimer l\'utilisateur',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      isDangerous: true
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.orderService.getOrders().pipe(
        switchMap((orders) => {
          const relatedOrders = orders.filter(order => String(order.userId) === String(userId));
          const deleteRequests = relatedOrders.map(order => this.orderService.deleteOrder(String(order.id)));
          const deleteOrders$ = deleteRequests.length > 0 ? forkJoin(deleteRequests) : of([]);
          return deleteOrders$.pipe(
            switchMap(() => this.userService.deleteUser(userId)),
            switchMap(() => forkJoin({
              users: this.userService.getUsers(),
              orders: this.orderService.getOrders()
            }))
          );
        })
      ).subscribe({
        next: ({ users, orders }) => {
          this.users = users;
          this.orderCountByUserId = orders.reduce<Record<string, number>>((acc, order) => {
            const currentUserId = String(order.userId);
            acc[currentUserId] = (acc[currentUserId] ?? 0) + 1;
            return acc;
          }, {});
          this.toastService.success('Utilisateur et commandes associees supprimes avec succes');
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.errorMessage = err?.status === 404
            ? 'Utilisateur introuvable sur le serveur.'
            : 'Erreur lors de la suppression de l\'utilisateur.';
          this.toastService.error(this.errorMessage);
        }
      });
    });
  }
}
