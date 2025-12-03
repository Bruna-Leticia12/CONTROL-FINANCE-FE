import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, TransactionWithMetadata } from '../../services/transaction.service';
import { AiAgentComponent } from '../../components/ai-agent/ai-agent.component';

interface GroupedTransactions {
  bankName: string;
  accounts: {
    accountNumber: string;
    accountId: string;
    transactions: TransactionWithMetadata[];
    balance: number;
    totalCredit: number;
    totalDebit: number;
  }[];
  totalBalance: number;
  isExpanded: boolean; 
}

@Component({
  selector: 'app-transacoes',
  standalone: true,
  imports: [CommonModule, AiAgentComponent],
  templateUrl: './transacoes.component.html',
  styleUrls: ['./transacoes.component.scss']
})
export class TransacoesComponent implements OnInit {
  allTransactions: TransactionWithMetadata[] = [];
  groupedByBank: GroupedTransactions[] = [];
  
  totalBalance = 0;
  totalCredit = 0;
  totalDebit = 0;
  
  loading = true;
  error = false;

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.loadAllTransactions();
  }

  private loadAllTransactions(): void {
    this.loading = true;
    this.transactionService.loadAllTransactions().subscribe({
      next: (data) => {
        console.log('Transações carregadas:', data.length);
        this.allTransactions = data;
        this.groupTransactions();
        this.calculateTotals();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar transações:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private groupTransactions(): void {
    const bankMap = new Map<string, GroupedTransactions>();

    this.allTransactions.forEach((item) => {
      const { bankName, accountId, accountNumber, transaction } = item;

      if (!bankMap.has(bankName)) {
        bankMap.set(bankName, {
          bankName,
          accounts: [],
          totalBalance: 0,
          isExpanded: false
        });
      }

      const bank = bankMap.get(bankName)!;

      let account = bank.accounts.find(a => a.accountId === accountId);
      if (!account) {
        account = {
          accountNumber,
          accountId,
          transactions: [],
          balance: 0,
          totalCredit: 0,
          totalDebit: 0
        };
        bank.accounts.push(account);
      }

      account.transactions.push(item);
    });

    bankMap.forEach((bank) => {
      bank.accounts.forEach((account) => {
        account.transactions.forEach((item) => {
          const amount = Number(item.transaction.amount);
          if (item.transaction.type === 'credit') {
            account.totalCredit += amount;
            account.balance += amount;
          } else {
            account.totalDebit += amount;
            account.balance -= amount;
          }
        });
        bank.totalBalance += account.balance;
      });
    });

    this.groupedByBank = Array.from(bankMap.values());
    
    if (this.groupedByBank.length > 0) {
      this.groupedByBank[0].isExpanded = true;
    }
  }

  private calculateTotals(): void {
    this.totalBalance = 0;
    this.totalCredit = 0;
    this.totalDebit = 0;

    this.allTransactions.forEach((item) => {
      const amount = Number(item.transaction.amount);
      if (item.transaction.type === 'credit') {
        this.totalCredit += amount;
        this.totalBalance += amount;
      } else {
        this.totalDebit += amount;
        this.totalBalance -= amount;
      }
    });
  }

  formatAmount(amount: number, type: string): string {
    const sign = type === 'debit' ? '-' : '+';
    const color = type === 'debit' ? 'text-red-600' : 'text-green-600';
    return `${sign} R$ ${amount.toFixed(2).replace('.', ',')}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  toggleBank(bank: GroupedTransactions): void {
    bank.isExpanded = !bank.isExpanded;
  }
}