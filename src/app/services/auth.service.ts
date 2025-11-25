import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

export interface LoginResponse {
  message: string;
  token: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  cpf: string;
  cellphoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://3.22.97.3:3000/auth';

  // Injeta ConnectionService, mas não podemos importar aqui para evitar dependência circular
  // Vamos fazer a injeção manual depois
  constructor(private http: HttpClient) { }

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
    console.log('💾 [AuthService] Salvando token:', token.substring(0, 20) + '...');
    localStorage.setItem('ctrlf_token', token);
    console.log('✅ [AuthService] Token salvo com sucesso');
  }

  getToken(): string | null {
    const token = localStorage.getItem('ctrlf_token');
    console.log('🔍 [AuthService] Buscando token. Encontrado?', !!token);
    return token;
  }

  logout() {
    // Limpar apenas o token do localStorage
    localStorage.removeItem('ctrlf_token');

    // Limpar sessionStorage (dados temporários da sessão)
    // A CONEXÃO PERMANECE NO BANCO e será restaurada no próximo login
    sessionStorage.clear();

    console.log('🚪 Logout completo - sessão limpa');
    console.log('ℹ️ Suas conexões bancárias foram preservadas e serão restauradas no próximo login');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Validar se o token não expirou
    return !this.isTokenExpired(token);
  }

  /**
   * Verifica se o token JWT está expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) {
        return false; // Se não tem exp, considerar válido
      }

      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;

      if (isExpired) {
        console.warn('⏰ [AuthService] Token expirado em:', new Date(payload.exp * 1000));
      }

      return isExpired;
    } catch (error) {
      console.error('❌ [AuthService] Erro ao verificar expiração do token:', error);
      return true; // Se não conseguir decodificar, considerar expirado por segurança
    }
  }

  /**
   * Decodifica o payload do token JWT
   */
  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Erro ao decodificar token JWT');
    }
  }

  /**
   * Obtém informações do token sem fazer requisição ao servidor
   */
  getTokenInfo(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return this.decodeToken(token);
    } catch (error) {
      return null;
    }
  }

  setCpf(cpf: string) {
    sessionStorage.setItem('cpf', cpf);
  }

  /**
   * Busca dados do perfil do usuário logado
   */
  getUserProfile(): Observable<UserProfile> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    const url = `${this.baseUrl}/profile`;
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.get<UserProfile>(url, { headers }).pipe(
      tap((user) => {
        // Salvar nome do usuário no sessionStorage para usar no header
        if (user.name) {
          const firstName = user.name.split(' ')[0];
          sessionStorage.setItem('userName', firstName);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Busca conexões ativas do usuário (deve ser chamado após login)
   * Retorna Observable para permitir subscribe no componente
   */
  restoreActiveConnections(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    const url = 'http://3.22.97.3:3000/connection/status?status=ACTIVE';
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.get<any[]>(url, { headers }).pipe(
      tap((connections) => {
        console.log('🔗 Conexões ativas encontradas:', connections.length);

        if (connections && connections.length > 0) {
          const firstConnection = connections[0];
          sessionStorage.setItem('connectionId', firstConnection._id);

          // Descobrir qual banco baseado na targetApiUrl
          const bankName = this.getBankNameFromUrl(firstConnection.targetApiUrl);
          if (bankName) {
            sessionStorage.setItem('connectedBank', bankName);
          }

          console.log('✅ ConnectionId restaurado:', firstConnection._id);
          console.log('🏦 Banco conectado:', bankName);
        } else {
          console.log('ℹ️ Nenhuma conexão ativa encontrada');
        }
      }),
      catchError((err) => {
        console.error('❌ Erro ao restaurar conexões:', err);
        return throwError(() => err);
      })
    );
  }

  private getBankNameFromUrl(targetApiUrl: string): string | null {
    const urlMap: Record<string, string> = {
      'http://3.22.97.3:4001': 'Bruna',
      'http://3.22.97.3:4002': 'Guilherme',
      'http://3.22.97.3:4003': 'Larissa',
      'http://3.22.97.3:3000': 'Leonardo',
      'http://3.22.97.3:4005': 'Rodrigo'
    };

    return urlMap[targetApiUrl] || null;
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