import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      cellphoneNumber: ['', Validators.required], 
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onSubmit(): void {
    this.errorMessage = null;
    
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      if (this.registerForm.errors?.['mismatch']) {
        this.errorMessage = 'As senhas não conferem.';
      }
      return;
    }
    
    this.loading = true;
    const payload = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      cpf: this.registerForm.value.cpf,
      cellphoneNumber: this.registerForm.value.cellphoneNumber,
      password: this.registerForm.value.password
    };

    this.auth.register(payload).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Erro ao cadastrar. Tente novamente.';
      }
    });
  }
}