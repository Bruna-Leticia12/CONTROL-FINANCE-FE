import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { OpenFinanceConnectionService } from '../../services/open-finance-connection.service';

interface BankTheme {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    gradient: string;
}

@Component({
    selector: 'app-bank-login',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './bank-login.component.html',
    styleUrls: ['./bank-login.component.scss'],
})
export class BankLoginComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    bankName: string = '';
    connectionId: string = '';
    callbackUrl: string = '';
    linkingUrl: string = '';

    cpf: string = '';
    password: string = '';
    isLoading: boolean = false;
    errorMessage: string = '';

    bankTheme: BankTheme = {
        name: '',
        primaryColor: '#6ec33a',
        secondaryColor: '#5fb02d',
        gradient: 'linear-gradient(135deg, #6ec33a 0%, #5fb02d 100%)',
    };

    private readonly bankThemes: Record<string, BankTheme> = {
        bruna: {
            name: 'Bruna',
            primaryColor: '#e63946',
            secondaryColor: '#d62828',
            gradient: 'linear-gradient(135deg, #e63946 0%, #d62828 100%)',
        },
        guilherme: {
            name: 'Guilherme',
            primaryColor: '#ffd60a',
            secondaryColor: '#ffc300',
            gradient: 'linear-gradient(135deg, #ffd60a 0%, #ffc300 100%)',
        },
        larissa: {
            name: 'Larissa',
            primaryColor: '#4361ee',
            secondaryColor: '#3a0ca3',
            gradient: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
        },
        leonardo: {
            name: 'Leonardo',
            primaryColor: '#f77f00',
            secondaryColor: '#d62828',
            gradient: 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)',
        },
        rodrigo: {
            name: 'Rodrigo',
            primaryColor: '#9e25bd',
            secondaryColor: '#7209b7',
            gradient: 'linear-gradient(135deg, #9e25bd 0%, #7209b7 100%)',
        },
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private http: HttpClient,
        private openFinanceService: OpenFinanceConnectionService
    ) { }

    ngOnInit(): void {
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.connectionId = params['connectionId'] || '';
            this.callbackUrl = params['callbackUrl'] || '';
            this.bankName = params['bank'] || '';
            this.linkingUrl = params['linkingUrl'] || '';

            if (!this.connectionId || !this.callbackUrl || !this.bankName) {
                console.error('Parâmetros obrigatórios ausentes');
                this.router.navigate(['/dashboard']);
                return;
            }

            this.applyBankTheme(this.bankName);
            this.cpf = sessionStorage.getItem('cpf') || '';
        });
    }

    private applyBankTheme(bankName: string): void {
        const normalizedName = bankName.toLowerCase();
        this.bankTheme = this.bankThemes[normalizedName] || this.bankTheme;

        document.documentElement.style.setProperty(
            '--bank-primary',
            this.bankTheme.primaryColor
        );
        document.documentElement.style.setProperty(
            '--bank-secondary',
            this.bankTheme.secondaryColor
        );
        document.documentElement.style.setProperty(
            '--bank-gradient',
            this.bankTheme.gradient
        );
    }

    onSubmit(): void {
        if (!this.cpf || !this.password) {
            this.errorMessage = 'Preencha todos os campos';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.authenticateWithBank();
    }

    private authenticateWithBank(): void {
        const loginUrl = this.linkingUrl.split('?')[0];

        const body = {
            cpf: this.cpf,
            password: this.password
        };

        this.http.post<any>(loginUrl, body, {
            params: {
                connectionId: this.connectionId,
                callbackUrl: this.callbackUrl
            }
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: any) => {
                    console.log('Login no banco bem-sucedido:', response);
                    console.log('ConnectionId a ser salvo:', this.connectionId);
                    console.log('Banco conectado:', this.bankName);

                    if (response.customerId) {
                        sessionStorage.setItem('customerId', response.customerId);
                        console.log('CustomerId salvo:', response.customerId);
                    }

                    sessionStorage.setItem('connectionId', this.connectionId);
                    console.log('ConnectionId salvo no sessionStorage');

                    sessionStorage.setItem('connectedBank', this.bankName);
                    console.log('ConnectedBank salvo:', this.bankName);

                    console.log('SessionStorage após save:', {
                        connectionId: sessionStorage.getItem('connectionId'),
                        customerId: sessionStorage.getItem('customerId'),
                        connectedBank: sessionStorage.getItem('connectedBank')
                    });

                    this.isLoading = false;
                    this.router.navigate(['/dashboard']);
                },
                error: (error: any) => {
                    console.error('Erro ao autenticar no banco:', error);

                    let errorMsg = 'Falha na autenticação. Verifique suas credenciais.';

                    if (error.status === 401) {
                        errorMsg = 'CPF ou senha incorretos.';
                    } else if (error.status === 404) {
                        errorMsg = 'Endpoint de login não encontrado.';
                    } else if (error.status === 500) {
                        errorMsg = 'Erro no servidor do banco.';
                    } else if (error.status === 0) {
                        errorMsg = 'Não foi possível conectar ao banco.';
                    }

                    this.errorMessage = errorMsg;
                    this.isLoading = false;
                }
            });
    }

    onCancel(): void {
        this.router.navigate(['/dashboard']);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        document.documentElement.style.removeProperty('--bank-primary');
        document.documentElement.style.removeProperty('--bank-secondary');
        document.documentElement.style.removeProperty('--bank-gradient');
    }
}