import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { OpenFinanceConnectionService } from '../../services/open-finance-connection.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../../model/transaction.interface';
import { StartConnectionResponse } from '../../../model/start-connection-response.interface';
import { AiAgentComponent } from '../../components/ai-agent/ai-agent.component';
import { BankCardComponent, BankAccount } from '../../components/bank-card/bank-card.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { BannerCarouselComponent } from '../../components/banner-carousel/banner-carousel.component';

Chart.register(ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    AiAgentComponent,
    BannerCarouselComponent,
    BankCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('incomeCanvas') incomeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fixedCanvas') fixedCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('saveCanvas') saveCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leisureCanvas') leisureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('unexpectedCanvas') unexpectedCanvas!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private charts: Chart[] = [];
  transactions: Transaction[] = [];
  bankAccounts: BankAccount[] = [
    { name: 'Bruna', color: '#e63946', isConnected: false },
    { name: 'Guilherme', color: '#ffd60a', isConnected: false },
    { name: 'Larissa', color: '#4361ee', isConnected: false },
    { name: 'Leonardo', color: '#f77f00', isConnected: false },
    { name: 'Rodrigo', color: '#9e25bdff', isConnected: false },
  ];

  data = {
    renda: { value: 0, expected: 0 },
    despesasFixas: { value: 0, expected: 0 },
    poupar: { value: 0, expected: 0 },
    lazer: { value: 0, expected: 0 },
    imprevistos: { value: 0, expected: 0 },
  };

  hasTransactions = false;
  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;

  constructor(
    private transactionService: TransactionService,
    private openFinanceService: OpenFinanceConnectionService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Tentar buscar conexões ativas do backend (caso o sessionStorage esteja vazio)
    const connectionId = sessionStorage.getItem('connectionId');

    if (!connectionId || connectionId === 'null') {
      console.log('🔄 SessionStorage vazio - tentando restaurar conexões...');
      this.authService.restoreActiveConnections().subscribe({
        next: () => {
          console.log('✅ Conexões restauradas no Dashboard');
          this.updateBankStatus();
        },
        error: (err) => {
          console.warn('⚠️ Nenhuma conexão ativa encontrada ou erro ao restaurar:', err);
        }
      });
    } else {
      console.log('✅ ConnectionId já presente no sessionStorage');
      this.updateBankStatus();
    }
  }

  private updateBankStatus(): void {
    const connectionId = sessionStorage.getItem('connectionId');
    const connectedBank = sessionStorage.getItem('connectedBank');

    console.log('🔍 Verificando status - connectionId:', connectionId, 'bank:', connectedBank);

    if (connectionId && connectedBank) {
      const bank = this.bankAccounts.find(b => b.name.toLowerCase() === connectedBank.toLowerCase());
      if (bank) {
        bank.isConnected = true;
        console.log(`✅ Banco ${bank.name} marcado como conectado`);
      } else {
        console.warn(`⚠️ Banco ${connectedBank} não encontrado na lista`);
      }
    }
  }

  ngAfterViewInit(): void {
    // Sempre tentar carregar transações
    // TransactionService já valida se há conexão ativa
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.loadAllTransactions()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => console.log('Transações carregadas'))
      )
      .subscribe({
        next: (data) => {
          console.log('Transações recebidas:', data?.length || 0);
          // Extrair apenas as transações dos metadados
          this.transactions = data.map(item => item.transaction) || [];
          this.hasTransactions = this.transactions.length > 0;

          if (this.hasTransactions) {
            console.log('Calculando categorias e renderizando gráficos...');
            this.data = this.transactionService.getCategorySums(this.transactions);
            this.calculateFinancialSummary();
            this.renderCharts();
          } else {
            console.log('Nenhuma transação encontrada - gráficos não serão renderizados');
          }
        },
        error: (err: any) => {
          console.error('Erro ao carregar transações:', err);
          this.transactions = [];
          this.hasTransactions = false;
        },
        complete: () => console.log('Observable de transações completo')
      });
  }

  calculateFinancialSummary(): void {
    this.monthlyIncome = this.data.renda.value;
    this.monthlyExpenses =
      this.data.despesasFixas.value +
      this.data.lazer.value +
      this.data.imprevistos.value;
    this.totalBalance = this.monthlyIncome - this.monthlyExpenses;
  }

  onConnectBank(bankName: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '480px',
      disableClose: true,
      data: { bankName }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.startBankConnection(bankName);
        }
      });
  }

  private startBankConnection(bankName: string): void {
    this.openFinanceService
      .startOpenFinanceConnection(bankName.toLowerCase())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => console.log('Start connection finalizado'))
      )
      .subscribe({
        next: (res: StartConnectionResponse) => {
          console.log('Conexão iniciada:', res);

          // Redirecionar para tela de login do banco
          this.router.navigate(['/bank-login'], {
            queryParams: {
              connectionId: res.connectionId,
              callbackUrl: res.linkingUrl.split('callbackUrl=')[1],
              bank: bankName,
              linkingUrl: res.linkingUrl
            }
          });
        },
        error: (err) => {
          console.error('Erro ao iniciar conexão:', err);
          alert(err.message || 'Erro ao conectar com o banco');
        },
        complete: () => console.log('Observable de start connection completo')
      });
  }

  private renderCharts(): void {
    this.destroyCharts();

    this.createDonutIncome(this.incomeCanvas, this.data.renda.value);
    this.createDonutRelativeToRenda(
      this.fixedCanvas,
      this.data.despesasFixas.value,
      this.data.despesasFixas.expected,
      '#2b6b4a'
    );
    this.createDonutRelativeToRenda(
      this.saveCanvas,
      this.data.poupar.value,
      this.data.poupar.expected,
      '#a5dca0'
    );
    this.createDonutRelativeToRenda(
      this.leisureCanvas,
      this.data.lazer.value,
      this.data.lazer.expected,
      '#c9f0c7'
    );
    this.createDonutRelativeToRenda(
      this.unexpectedCanvas,
      this.data.imprevistos.value,
      this.data.imprevistos.expected,
      '#f5c7c7'
    );
  }

  private createDonutIncome(canvasRef: ElementRef<HTMLCanvasElement>, value: number) {
    const ctx = canvasRef.nativeElement.getContext('2d')!;
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Renda'],
        datasets: [
          {
            data: [value, 0],
            backgroundColor: ['#2b6b4a', '#e9f5ee'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: { tooltip: { enabled: false }, legend: { display: false } },
        animation: { duration: 600 },
      },
    });
    this.charts.push(chart);
  }

  private createDonutRelativeToRenda(
    canvasRef: ElementRef<HTMLCanvasElement>,
    value: number,
    expected: number,
    primaryColor: string
  ) {
    const rendaValue = this.data.renda.value;
    const used = Math.min(value, rendaValue);
    const diff = Math.abs(value - expected);
    const hasDifference = diff > 0.01;

    const dataParts = hasDifference
      ? [Math.min(value, expected), diff, rendaValue - used]
      : [used, rendaValue - used];
    const bgColors = hasDifference
      ? [primaryColor, '#b51e1e', '#eafaf0']
      : [primaryColor, '#eafaf0'];

    const ctx = canvasRef.nativeElement.getContext('2d')!;
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          { data: dataParts, backgroundColor: bgColors, borderWidth: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: { tooltip: { enabled: false }, legend: { display: false } },
        animation: { duration: 600 },
      },
    });
    this.charts.push(chart);
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }
}
