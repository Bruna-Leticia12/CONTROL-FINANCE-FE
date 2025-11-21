import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../model/transaction.interface';
import { TransactionService } from '../../services/transaction.service';
import { Observable } from 'rxjs';
import { AiAgentComponent } from '../../components/ai-agent/ai-agent.component';

@Component({
  selector: 'app-transacoes',
  standalone: true,
  imports: [CommonModule, AiAgentComponent],
  templateUrl: './transacoes.component.html',
  styleUrls: ['./transacoes.component.scss']
})
export class TransacoesComponent implements OnInit {
  transactions: Transaction[] = [];
  balance = 0;
  loading = false;
  error = false;

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.transactionService.loadTransactions().subscribe((data) => {
      this.transactions = data
      this.calculateBalance();
    })
  }


  private calculateBalance(): void {
    this.balance = this.transactions.reduce((acc, t) => {
      return t.type === 'credit'
        ? acc + Number(t.amount)
        : acc - Number(t.amount);
    }, 0);
  }

  formatAmount(t: Transaction): string {
    const sign = t.type === 'debit' ? '-' : '';
    return `${sign}R$ ${t.amount.toFixed(2).replace('.', ',')}`;
  }
}