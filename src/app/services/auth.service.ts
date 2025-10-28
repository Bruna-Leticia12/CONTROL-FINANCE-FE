import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // usuário mock
  private mockUser = {
    email: 'user@example.com',
    password: '1234',
    token: 'mock-jwt-token-ctrlf'
  };

  constructor() { }

  // simula requisição de login
  login(email: string, password: string): Observable<{ message: string; token?: string }> {
    const fakeDelay = 700;

    if (email === this.mockUser.email && password === this.mockUser.password) {
      return of({ message: 'Login successful', token: this.mockUser.token }).pipe(delay(fakeDelay));
    }

    // retorna erro similar a como um backend faria
    return throwError(() => ({ error: { message: 'Credenciais inválidas' } })).pipe(delay(fakeDelay));
  }
}
