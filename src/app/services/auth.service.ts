import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface LoginResponse {
  message: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:2000/auth';

  constructor(private http: HttpClient) {}

  register(payload: {
    name: string;
    email: string;
    cpf: string;
    cellphoneNumber: string;
    password: string;
  }): Observable<any> {
    const url = `${this.baseUrl}/register`;
    return this.http.post(url, payload).pipe(      
      catchError(this.handleError)
    );
  }

  login(cpf: string, password: string): Observable<LoginResponse> {
    const url = `${this.baseUrl}/login`;
    return this.http.post<LoginResponse>(url, { cpf, password }).pipe(
      catchError(this.handleError)
    );
  }

  setToken(token: string) {
    localStorage.setItem('ctrlf_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('ctrlf_token');
  }

  logout() {
    localStorage.removeItem('ctrlf_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setCpf(cpf: string){
    sessionStorage.setItem('cpf', cpf);
  } 

  private handleError(error: HttpErrorResponse) {
    let message = 'Ocorreu um erro inesperado.';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 0) {
      message = 'Não foi possível conectar ao servidor (porta 2000).';
    } else if (error.status === 400) {
      message = 'Dados inválidos. Verifique os campos e tente novamente.';
    } else if (error.status === 401) {
      message = 'Credenciais incorretas.';
    }
    return throwError(() => ({ status: error.status, message }));
  }
}