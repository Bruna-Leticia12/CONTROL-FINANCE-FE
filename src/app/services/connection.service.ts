import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Connection {
    _id: string;
    userId: string;
    targetApiUrl: string;
    status: 'PENDING' | 'ACTIVE' | 'FAILED' | 'REVOKED';
    createdAt: string;
    updatedAt: string;
    lastSyncAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConnectionService {
    private baseUrl = environment.controlFinanceBackendUrl + '/connection';

    constructor(private http: HttpClient) { }

    /**
     * Busca todas as conexões ativas do usuário
     */
    getActiveConnections(): Observable<Connection[]> {
        const url = `${this.baseUrl}/status?status=ACTIVE`;
        return this.http.get<Connection[]>(url).pipe(
            tap((connections) => {
                console.log('🔗 Conexões ativas encontradas:', connections.length);

                // Se houver conexão ativa, salvar no sessionStorage
                if (connections.length > 0) {
                    const firstConnection = connections[0];
                    sessionStorage.setItem('connectionId', firstConnection._id);

                    // Descobrir qual banco está conectado baseado na targetApiUrl
                    const bankName = this.getBankNameFromUrl(firstConnection.targetApiUrl);
                    if (bankName) {
                        sessionStorage.setItem('connectedBank', bankName);
                    }

                    console.log('✅ ConnectionId restaurado:', firstConnection._id);
                    console.log('🏦 Banco conectado:', bankName);
                } else {
                    console.log('ℹ️ Nenhuma conexão ativa encontrada');
                }
            })
        );
    }

    /**
     * Identifica o banco pela URL da API
     */
    private getBankNameFromUrl(targetApiUrl: string): string | null {
        const institutions = environment.institutionsFinancial;

        for (const [bankName, url] of Object.entries(institutions)) {
            if (url === targetApiUrl) {
                return bankName.charAt(0).toUpperCase() + bankName.slice(1);
            }
        }

        return null;
    }

    /**
     * Limpa as conexões do sessionStorage (usado no logout)
     */
    clearConnectionData(): void {
        sessionStorage.removeItem('connectionId');
        sessionStorage.removeItem('customerId');
        sessionStorage.removeItem('connectedBank');
        console.log('🧹 Dados de conexão limpos do sessionStorage');
    }
}
