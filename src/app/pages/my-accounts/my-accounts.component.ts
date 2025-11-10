import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OpenFinanceConnectionService } from '../../services/open-finance-connection.service';
import { StartConnectionResponse } from '../../../model/start-connection-response.interface';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';


@Component({
  selector: 'app-my-accounts',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
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
  ) {}

  openStartConnectionDialog(IFName: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((password: string) => {
      if (password) {
        this.openFinanceConnectionService.startOpenFinanceConnection(IFName.toLowerCase(), password).subscribe(
          (res: StartConnectionResponse) => {
            this.router.navigate(['/dashboard']); 
          }
        );
      } else {
        console.log('Usuário não permitiu o compartilhamento.');
      }
    });
  }
}