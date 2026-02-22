import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  isEditMode = false;
  userId: string | null = null;
  errorMessage = '';
  isLoading = false;

  userForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      role: ['user', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    this.isEditMode = true;
    this.userId = idParam;
    this.isLoading = true;

    this.userService.getUserById(this.userId).subscribe({
      next: user => {
        this.userForm.patchValue({
          name: String(user.name),
          email: String(user.email),
          password: String(user.password),
          role: String(user.role)
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.errorMessage = 'Impossible de charger l\'utilisateur.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const value = this.userForm.getRawValue();
    const payload: User = {
      name: String(value.name ?? ''),
      email: String(value.email ?? ''),
      password: String(value.password ?? ''),
      role: value.role ?? 'user'
    };

    if (this.isEditMode && this.userId !== null) {
      this.userService.updateUser(this.userId, { id: this.userId, ...payload }).subscribe({
        next: () => {
          this.toastService.success('Utilisateur modifié avec succès');
          this.router.navigate(['/users']);
        },
        error: (err: any) => {
          console.error('Error updating user:', err);
          this.errorMessage = 'La modification a échoué.';
          this.toastService.error('Erreur lors de la modification');
        }
      });
      return;
    }

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.toastService.success('Utilisateur créé avec succès');
        this.router.navigate(['/users']);
      },
      error: (err: any) => {
        console.error('Error creating user:', err);
        this.errorMessage = 'La création a échoué.';
        this.toastService.error('Erreur lors de la création');
      }
    });
  }
}
