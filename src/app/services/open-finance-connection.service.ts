import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { StartConnectionResponse } from '../../model/start-connection-response.interface';

@Injectable({
  providedIn: 'root'
})
export class OpenFinanceConnectionService {
  private baseUrl = environment.controlFinanceBackendUrl + '/connection'

  constructor(private http: HttpClient) { }

  startOpenFinanceConnection(bankName: string): Observable<StartConnectionResponse> {
    const url = `${this.baseUrl}/start`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('ctrlf_token')}`
    });

    const targetApiUrl = this.getIfUrl(bankName);
    if (!targetApiUrl) {
      return throwError(() => new Error(`Instituição Financeira "${bankName}" não encontrada`));
    }

    const body = {
      targetApiUrl
    };

    return this.http.post<StartConnectionResponse>(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao iniciar conexão Open Finance:', error);

        let errorMsg = 'Erro inesperado. Tente novamente mais tarde.';

        if (error.status === 0) {
          errorMsg = 'Não foi possível conectar ao servidor.';
        } else if (error.status === 401) {
          errorMsg = 'Sessão expirada. Faça login novamente.';
        } else if (error.status === 403) {
          errorMsg = 'Acesso negado.';
        } else if (error.status === 404) {
          errorMsg = 'Endpoint não encontrado.';
        } else if (error.status >= 500) {
          errorMsg = 'Erro interno no servidor.';
        }

        return throwError(() => new Error(errorMsg));
      })
    );
  }

  completeOpenFinanceConnection(
    connectionId: string,
    apiKey: string,
    userIdInChildApi: string,
    consentIdInChildApi: string
  ): Observable<any> {
    const url = `${this.baseUrl}/complete`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('ctrlf_token')}`
    });

    const body = {
      connectionId,
      apiKey,
      userIdInChildApi,
      consentIdInChildApi
    };

    return this.http.patch(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao completar conexão:', error);
        return throwError(() => new Error('Falha ao completar conexão'));
      })
    );
  }

  private getIfUrl(bankName: string): string | null {
    const normalizedName = bankName.toLowerCase();
    const institutions = environment.institutionsFinancial as Record<string, string>;
    return institutions[normalizedName] || null;
  }
}
