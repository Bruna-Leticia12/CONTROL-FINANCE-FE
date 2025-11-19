import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {
    this.loginForm = this.fb.group({
      cpf: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { cpf, password } = this.loginForm.value;

    this.auth.login(cpf, password).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (res) => {
        if (res?.token) {
          this.auth.setToken(res.token);
          this.auth.setCpf(cpf)
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Resposta inválida do servidor.';
        }
      },
      error: (err: any) => {
        this.errorMessage = err?.message || 'Erro ao fazer login.';
      }
    });
  }
}