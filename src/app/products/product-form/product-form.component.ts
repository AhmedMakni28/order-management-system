import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  isEditMode = false;
  productId: string | null = null;
  errorMessage = '';
  isLoading = false;

  productForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    this.isEditMode = true;
    this.productId = idParam;
    this.isLoading = true;

    this.productService.getProductById(this.productId).subscribe({
      next: product => {
        const price = typeof product.price === 'string'
          ? parseFloat(product.price)
          : product.price;

        this.productForm.patchValue({
          name: String(product.name),
          price: price,
          description: String(product.description)
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.errorMessage = 'Impossible de charger le produit.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const value = this.productForm.getRawValue();
    const payload = {
      name: String(value.name ?? ''),
      price: parseFloat(value.price ?? '0'),
      description: String(value.description ?? '')
    };

    if (this.isEditMode && this.productId !== null) {
      this.productService.updateProduct(this.productId, { id: this.productId, ...payload }).subscribe({
        next: () => {
          this.toastService.success('Produit modifié avec succès');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.errorMessage = 'La modification a échoué.';
          this.toastService.error('Erreur lors de la modification');
        }
      });
      return;
    }

    this.productService.addProduct(payload).subscribe({
      next: () => {
        this.toastService.success('Produit créé avec succès');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.errorMessage = 'La création a échoué.';
        this.toastService.error('Erreur lors de la création');
      }
    });
  }
}
