import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderFormComponent } from './order-form/order-form.component';
import { roleGuard } from '../../guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: OrderListComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'user'] }
  },
  {
    path: 'new',
    component: OrderFormComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'user'] }
  },
  {
    path: 'edit/:id',
    component: OrderFormComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: ':id',
    component: OrderDetailComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'user'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
