import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BankInfo {
    name: string;
    color: string;
    apiUrl: string;
}

export interface BankAccountData {
    bank: BankInfo;
    isConnected: boolean;
    connectionId?: string;
    accounts?: any[];
    error?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BankAccountService {
    private baseUrl = environment.controlFinanceBackendUrl + '/open-finance';

    private banks: BankInfo[] = [
        { name: 'Bruna', color: '#e63946', apiUrl: environment.institutionsFinancial.bruna },
        { name: 'Guilherme', color: '#ffd60a', apiUrl: environment.institutionsFinancial.guilherme },
        { name: 'Larissa', color: '#4361ee', apiUrl: environment.institutionsFinancial.larissa },
        { name: 'Leonardo', color: '#f77f00', apiUrl: environment.institutionsFinancial.leonardo },
        { name: 'Rodrigo', color: '#9e25bdff', apiUrl: environment.institutionsFinancial.rodrigo }
    ];

    constructor(private http: HttpClient) { }

    getAllBanks(): BankInfo[] {
        return this.banks;
    }

    private getToken() {
        const token = localStorage.getItem('ctrlf_token');
        return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
    }

    /**
     * Verifica se há conexão ativa com algum banco
     */
    hasActiveConnection(): boolean {
        const connectionId = sessionStorage.getItem('connectionId');
        return !!connectionId && connectionId !== 'null';
    }

    /**
     * Busca contas do banco conectado
     */
    getConnectedBankAccounts(connectionId: string): Observable<any> {
        const url = `${this.baseUrl}/${connectionId}/accounts`;
        return this.http.get<any>(url, this.getToken()).pipe(
            catchError((err) => {
                console.error('Erro ao buscar contas:', err);
                return of({ error: err.message });
            })
        );
    }

    /**
     * Retorna informações completas de todos os bancos (conectados e não conectados)
     */
    getAllBanksStatus(): Observable<BankAccountData[]> {
        const connectionId = sessionStorage.getItem('connectionId');
        const connectedBank = sessionStorage.getItem('connectedBank');

        if (!connectionId || !connectedBank) {
            // Nenhuma conexão ativa - retornar todos como desconectados
            return of(this.banks.map(bank => ({
                bank,
                isConnected: false
            })));
        }

        // Buscar contas do banco conectado
        return this.getConnectedBankAccounts(connectionId).pipe(
            map((accountsResponse: any) => {
                return this.banks.map(bank => {
                    const isThisBankConnected = bank.name.toLowerCase() === connectedBank.toLowerCase();

                    if (isThisBankConnected) {
                        return {
                            bank,
                            isConnected: true,
                            connectionId,
                            accounts: accountsResponse.error ? [] : accountsResponse,
                            error: accountsResponse.error
                        };
                    }

                    return {
                        bank,
                        isConnected: false
                    };
                });
            })
        );
    }
}
