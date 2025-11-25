import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConnectionService } from './connection.service';

export interface TransactionWithMetadata {
  transaction: any;
  accountId: string;
  accountNumber: string;
  bankName: string;
  connectionId: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private baseUrl = environment.controlFinanceBackendUrl + '/open-finance';

  constructor(
    private http: HttpClient,
    private connectionService: ConnectionService
  ) { }

  /**
   * Busca dados analíticos agregados por categoria (endpoint otimizado)
   */
  getAnalytics(): Observable<any> {
    const url = `${environment.controlFinanceBackendUrl}/analytics/categories/me`;
    console.log('📊 [TransactionService] Buscando analytics:', url);

    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('❌ [TransactionService] Erro ao buscar analytics:', error);
        return of(null);
      })
    );
  }

  /**
   * Busca TODAS as transações de TODAS as contas de TODAS as conexões ativas
   */
  loadAllTransactions(): Observable<TransactionWithMetadata[]> {
    console.log('🔍 [TransactionService] Iniciando busca de todas as transações...');
    console.log('🔑 [TransactionService] Token presente?', !!localStorage.getItem('ctrlf_token'));

    return this.connectionService.getActiveConnections().pipe(
      switchMap((connections) => {
        console.log('� [TransactionService] Conexões ativas:', connections.length);

        if (!connections || connections.length === 0) {
          console.warn('⚠️ Nenhuma conexão ativa encontrada');
          return of([]);
        }

        // Para cada conexão, buscar contas e transações
        const allRequests = connections.map((connection) =>
          this.loadTransactionsForConnection(connection._id, connection.targetApiUrl)
        );

        // Executar todas as requisições em paralelo e combinar resultados
        return forkJoin(allRequests).pipe(
          map((results) => results.flat())
        );
      }),
      catchError((error) => {
        console.error('❌ [TransactionService] Erro ao carregar transações:', error);
        return of([]);
      })
    );
  }

  /**
   * Busca transações de uma conexão específica
   */
  private loadTransactionsForConnection(
    connectionId: string,
    targetApiUrl: string
  ): Observable<TransactionWithMetadata[]> {
    const url = `${this.baseUrl}/${connectionId}/accounts`;
    console.log('🌐 [loadTransactionsForConnection] Buscando contas de:', connectionId);

    return this.http.get<any[]>(url).pipe(
      switchMap((accounts) => {
        console.log(`📊 [loadTransactionsForConnection] ${accounts.length} conta(s) encontrada(s)`);

        if (!accounts || accounts.length === 0) {
          return of([]);
        }

        // Para cada conta, buscar transações
        const transactionRequests = accounts.map((account) =>
          this.loadTransactionsForAccount(connectionId, account, targetApiUrl)
        );

        return forkJoin(transactionRequests).pipe(
          map((results) => results.flat())
        );
      }),
      catchError((error) => {
        console.error(`❌ Erro ao buscar contas da conexão ${connectionId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Busca transações de uma conta específica
   */
  private loadTransactionsForAccount(
    connectionId: string,
    account: any,
    bankUrl: string
  ): Observable<TransactionWithMetadata[]> {
    const accountId = account.accountId || account._id || account.id;
    const url = `${this.baseUrl}/${connectionId}/accounts/${accountId}/transactions`;

    console.log(`💰 [loadTransactionsForAccount] Buscando transações da conta ${accountId}`);

    return this.http.get<any>(url).pipe(
      map((response) => {
        const transactions = response.transactions || response || [];
        console.log(`✅ ${transactions.length} transação(ões) encontrada(s) na conta ${accountId}`);

        // Adicionar metadados a cada transação
        return transactions.map((transaction: any) => ({
          transaction,
          accountId,
          accountNumber: account.accountNumber || account.number || 'N/A',
          bankName: this.getBankNameFromUrl(bankUrl),
          connectionId
        }));
      }),
      catchError((error) => {
        console.error(`❌ Erro ao buscar transações da conta ${accountId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Extrai o nome do banco da URL
   */
  private getBankNameFromUrl(url: string): string {
    const bankNames: Record<string, string> = {
      '4001': 'Banco Bruna',
      '4002': 'Banco Guilherme',
      '4003': 'Banco Larissa',
      '5000': 'Banco Leonardo',
      '4005': 'Banco Rodrigo'
    };

    for (const [port, name] of Object.entries(bankNames)) {
      if (url.includes(port)) {
        return name;
      }
    }

    return 'Banco Desconhecido';
  }

  /**
   * 🔹 Método auxiliar para somar valores por categoria e calcular esperados
   * Pode ser usado em Dashboard, Metas e outras telas
   */
  getCategorySums(transactions: any[]) {
    const rendaDesc = ['Salario', 'Salário'];
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
