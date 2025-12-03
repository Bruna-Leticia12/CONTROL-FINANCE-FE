import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  sessionExpiredMessage: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      cpf: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['expired'] === 'true') {
        this.sessionExpiredMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
        console.warn('Usuário redirecionado por sessão expirada');
        
        setTimeout(() => {
          this.sessionExpiredMessage = null;
        }, 5000);
      }
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
          this.auth.setCpf(cpf);

          console.log('Carregando dados do usuário...');
          this.auth.getUserProfile().subscribe({
            next: () => {
              console.log('Perfil carregado');

              this.auth.restoreActiveConnections().subscribe({
                next: () => {
                  console.log('Conexões restauradas');
                  this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                  console.warn('Erro ao restaurar conexões (não crítico):', err);
                  this.router.navigate(['/dashboard']);
                }
              });
            },
            error: (err) => {
              console.warn('Erro ao carregar perfil:', err);
              this.router.navigate(['/dashboard']);
            }
          });
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