import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OpenFinanceConnectionService } from '../../services/open-finance-connection.service';
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
export class MyAccountsComponent {
  accounts = [
    { name: 'Bruna', color: '#e63946' },
    { name: 'Guilherme', color: '#ffd60a' },
    { name: 'Larissa', color: '#4361ee' },
    { name: 'Leonardo', color: '#f77f00' },
    { name: 'Rodrigo', color: '#9e25bdff' },
  ];

  constructor(
    private openFinanceConnectionService: OpenFinanceConnectionService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  openStartConnectionDialog(IFName: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '480px',
      disableClose: true,
      data: { bankName: IFName }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.openFinanceConnectionService.startOpenFinanceConnection(IFName.toLowerCase()).subscribe(
          (res: StartConnectionResponse) => {
            // Redirecionar para tela de login do banco
            this.router.navigate(['/bank-login'], {
              queryParams: {
                connectionId: res.connectionId,
                callbackUrl: res.linkingUrl.split('callbackUrl=')[1],
                bank: IFName,
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
}