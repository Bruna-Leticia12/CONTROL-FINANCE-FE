import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private baseUrl = environment.controlFinanceBackendUrl + '/open-finance';

  constructor(private http: HttpClient) {}

  getToken() {
    const token = localStorage.getItem('ctrlf_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  loadTransactions(): Observable<any> {
    return this.getAccounts().pipe(
      switchMap((res: any) => this.getTransactions(res))
    );
  }

  private getTransactions(res: any) {
    return this.http
      .get<any>(
        `${this.baseUrl}/${sessionStorage.getItem('connectionId')}/accounts/${res[0]._id}/transactions`,
        this.getToken()
      )
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

  /**
   * 🔹 Método auxiliar para somar valores por categoria e calcular esperados
   * Pode ser usado em Dashboard, Metas e outras telas
   */
  getCategorySums(transactions: any[]) {
    const rendaDesc = ['Salario'];
    const despesaFixaDesc = [
      'Financiamento', 'Aluguel', 'Água', 'Luz', 'Internet',
      'Mercado', 'Transporte', 'Plano de Saúde', 'Medicamento',
      'Streaming', 'Curso',
    ];
    const pouparDesc = ['Poupança', 'Investir'];
    const lazerDesc = ['Viagem', 'Evento', 'Hobby', 'Restaurante', 'Pessoal'];
    const imprevistosDesc = ['Manutenção', 'Conserto', 'Multa', 'Taxa', 'Jogos', 'Apostas'];

    const sums = {
      renda: 0,
      despesasFixas: 0,
      poupar: 0,
      lazer: 0,
      imprevistos: 0,
    };

    for (const t of transactions) {
      const desc = t.description?.toLowerCase() || '';
      const amount = Number(t.amount);

      if (rendaDesc.some(d => desc.includes(d.toLowerCase()))) {
        sums.renda += amount;
      } else if (despesaFixaDesc.some(d => desc.includes(d.toLowerCase()))) {
        sums.despesasFixas += amount;
      } else if (pouparDesc.some(d => desc.includes(d.toLowerCase()))) {
        sums.poupar += amount;
      } else if (lazerDesc.some(d => desc.includes(d.toLowerCase()))) {
        sums.lazer += amount;
      } else if (imprevistosDesc.some(d => desc.includes(d.toLowerCase()))) {
        sums.imprevistos += amount;
      }
    }

    // ✅ Cálculo dinâmico com base na renda total
    const rendaTotal = sums.renda || 0;
    const expected = {
      despesasFixas: (rendaTotal * 60) / 100,
      poupar: (rendaTotal * 20) / 100,
      lazer: (rendaTotal * 15) / 100,
      imprevistos: (rendaTotal * 5) / 100,
    };

    return {
      renda: { value: rendaTotal, expected: rendaTotal },
      despesasFixas: { value: sums.despesasFixas, expected: expected.despesasFixas },
      poupar: { value: sums.poupar, expected: expected.poupar },
      lazer: { value: sums.lazer, expected: expected.lazer },
      imprevistos: { value: sums.imprevistos, expected: expected.imprevistos },
    };
  }
}
