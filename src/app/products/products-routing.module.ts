import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { roleGuard } from '../../guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'user'] }
  },
  {
    path: 'new',
    component: ProductFormComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'edit/:id',
    component: ProductFormComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: ':id',
    component: ProductDetailComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'user'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
