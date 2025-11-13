
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private baseUrl = environment.controlFinanceBackendUrl + '/open-finance';

  constructor(private http: HttpClient) { }

  getToken() {
    const token = localStorage.getItem('ctrlf_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
  }

  loadTransactions(): Observable<any> {
    return this.getAccounts().pipe(
      switchMap((res: any) => this.getTransactions(res))
    );
  }

  private getTransactions(res: any) {
    return this.http.get<any>(
      `${this.baseUrl}/${sessionStorage.getItem('connectionId')}/accounts/${res[0]._id}/transactions`, this.getToken())
      .pipe(catchError((err) => err));
  }

  private getAccounts() {
    const url = `${this.baseUrl}/${sessionStorage.getItem('connectionId')}/customers/${sessionStorage.getItem('customerId')}/accounts`;

    return this.http.get<any>(url, this.getToken()).pipe(
      catchError((err) => {
        console.error('Erro em getAccounts():', err);
        return throwError(() => err);
      })
    );
  }
}
