import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OpenFinanceConnectionService } from '../../services/open-finance-connection.service';
import { BankAccountService, BankAccountData } from '../../services/bank-account.service';
import { StartConnectionResponse } from '../../../model/start-connection-response.interface';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { AiAgentComponent } from '../../components/ai-agent/ai-agent.component';


@Component({
  selector: 'app-my-accounts',
  standalone: true,
  imports: [CommonModule, MatDialogModule, AiAgentComponent],
  templateUrl: './my-accounts.component.html',
  styleUrls: ['./my-accounts.component.scss']
})
export class MyAccountsComponent implements OnInit {
  banksData: BankAccountData[] = [];
  loading = true;

  constructor(
    private bankAccountService: BankAccountService,
    private openFinanceConnectionService: OpenFinanceConnectionService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadBanksStatus();
  }

  loadBanksStatus(): void {
    this.loading = true;
    this.bankAccountService.getAllBanksStatus().subscribe({
      next: (data) => {
        this.banksData = data;
        this.loading = false;
        console.log('Status dos bancos carregado:', data);
      },
      error: (err) => {
        console.error('Erro ao carregar status dos bancos:', err);
        this.loading = false;
      }
    });
  }

  openStartConnectionDialog(bankName: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '480px',
      disableClose: true,
      data: { bankName }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.openFinanceConnectionService.startOpenFinanceConnection(bankName.toLowerCase()).subscribe(
          (res: StartConnectionResponse) => {
            // Redirecionar para tela de login do banco
            this.router.navigate(['/bank-login'], {
              queryParams: {
                connectionId: res.connectionId,
                callbackUrl: res.linkingUrl.split('callbackUrl=')[1],
                bank: bankName,
                linkingUrl: res.linkingUrl
              }
            });
          }
        );
      } else {
        console.log('Usuário cancelou a conexão.');
      }
    });
  }

  getAccountTypeName(type: string): string {
    const types: Record<string, string> = {
      'CONTA_CORRENTE': 'Conta Corrente',
      'CONTA_POUPANCA': 'Conta Poupança',
      'CONTA_PAGAMENTO': 'Conta Pagamento',
      'CONTA_INVESTIMENTO': 'Conta Investimento'
    };
    return types[type] || type;
  }
}