import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage = '';

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.router.navigate([currentUser.role === 'admin' ? '/dashboard' : '/products']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.authService.login(email ?? '', password ?? '').subscribe({
      next: user => {
        if (!user) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
          return;
        }

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || (user.role === 'admin' ? '/dashboard' : '/products');
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.errorMessage = 'Erreur pendant la connexion.';
      }
    });
  }

}
