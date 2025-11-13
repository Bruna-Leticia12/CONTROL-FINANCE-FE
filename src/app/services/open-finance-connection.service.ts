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

  startOpenFinanceConnection(IFName: string, password: string): Observable<StartConnectionResponse> {
    const url = `${this.baseUrl}/start`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('ctrlf_token')}`
    });

    const body = {
      // targetApiUrl: this.getIfName(IFName)
      targetApiUrl: environment.bruna
    };

    return this.http.post<StartConnectionResponse>(url, body, { headers }).pipe(
      switchMap((res: StartConnectionResponse) => this.externalLogin(res, password)),
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

  private externalLogin(startConnectionResponse: StartConnectionResponse, password: string) {
    sessionStorage.setItem('connectionId', startConnectionResponse.connectionId);

    return this.http.post<any>(
      startConnectionResponse.linkingUrl.split('?')[0],
      {
        cpf: sessionStorage.getItem('cpf'),
        controlFinanceJwt: localStorage.getItem('ctrlf_token'),
        password
      },
      {
        params:
        {
          connectionId: startConnectionResponse.connectionId,
          callbackUrl: startConnectionResponse.linkingUrl.split('callbackUrl=')[1]
        }
      }
    ).pipe(
      tap((data) => sessionStorage.setItem('customerId', data.customerId)),
      catchError((error) => {
        const x = error 
        return throwError(() => new Error(x)); 
      })
    )
  }

  // private getIfName(IFName: string){
  //   if(IFName === "bruna"){
  //     return environment.bruna
  //   }
  //   else if ((IFName === "larissa")){
  //     return environment.larissa
  //   }
  // }
}
