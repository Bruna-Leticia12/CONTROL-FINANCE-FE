import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../../model/transaction.interface';

Chart.register(ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('incomeCanvas') incomeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fixedCanvas') fixedCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('saveCanvas') saveCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leisureCanvas') leisureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('unexpectedCanvas') unexpectedCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  transactions: Transaction[] = [];

  expectedValues = {
    renda: 3000,
    despesasFixas: 1800,
    poupar: 600,
    lazer: 450,
    imprevistos: 150,
  };

  data = {
    renda: { value: 0, expected: this.expectedValues.renda },
    despesasFixas: { value: 0, expected: this.expectedValues.despesasFixas },
    poupar: { value: 0, expected: this.expectedValues.poupar },
    lazer: { value: 0, expected: this.expectedValues.lazer },
    imprevistos: { value: 0, expected: this.expectedValues.imprevistos },
  };

  constructor(private transactionService: TransactionService) {}

  ngAfterViewInit(): void {
    this.transactionService.loadTransactions().subscribe({
      next: (data: Transaction[]) => {
        this.transactions = data;
        this.aggregateTransactions();
        this.renderCharts();
      },
      error: (err) => console.error('Erro ao carregar transações', err),
    });
  }

  private aggregateTransactions(): void {
    const rendaDesc = ['Salario'];
    const despesaFixaDesc = [
      'Financiamento',
      'Aluguel',
      'Água',
      'Luz',
      'Internet',
      'Mercado',
      'Transporte',
      'Plano de Saúde',
      'Medicamento',
      'Streaming',
      'Curso',
    ];
    const pouparDesc = ['Poupança', 'Investir'];
    const lazerDesc = ['Viagem', 'Evento', 'Hobby', 'Restaurante', 'Pessoal'];
    const imprevistosDesc = [
      'Manutenção',
      'Conserto',
      'Multa',
      'Taxa',
      'Jogos',
      'Apostas',
    ];

    const sums = {
      renda: 0,
      despesasFixas: 0,
      poupar: 0,
      lazer: 0,
      imprevistos: 0,
    };

    for (const t of this.transactions) {
      const desc = t.description?.toLowerCase() || '';
      const amount = Number(t.amount);

      if (rendaDesc.some((d) => desc.includes(d.toLowerCase()))) {
        sums.renda += amount;
      } else if (despesaFixaDesc.some((d) => desc.includes(d.toLowerCase()))) {
        sums.despesasFixas += amount;
      } else if (pouparDesc.some((d) => desc.includes(d.toLowerCase()))) {
        sums.poupar += amount;
      } else if (lazerDesc.some((d) => desc.includes(d.toLowerCase()))) {
        sums.lazer += amount;
      } else if (imprevistosDesc.some((d) => desc.includes(d.toLowerCase()))) {
        sums.imprevistos += amount;
      }
    }

    this.data = {
      renda: { value: sums.renda, expected: this.expectedValues.renda },
      despesasFixas: {
        value: sums.despesasFixas,
        expected: this.expectedValues.despesasFixas,
      },
      poupar: { value: sums.poupar, expected: this.expectedValues.poupar },
      lazer: { value: sums.lazer, expected: this.expectedValues.lazer },
      imprevistos: {
        value: sums.imprevistos,
        expected: this.expectedValues.imprevistos,
      },
    };
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
      '#c9f0c7'
    );
  }

  private createDonutIncome(
    canvasRef: ElementRef<HTMLCanvasElement>,
    value: number
  ) {
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
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
        },
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
    const remainderToRenda = Math.max(rendaValue - used, 0);
    const hasDifference = value !== expected;

    let dataParts: number[] = [];
    let bgColors: string[] = [];

    if (!hasDifference) {
      dataParts = [used, remainderToRenda];
      bgColors = [primaryColor, '#eafaf0'];
    } else {
      if (value > expected) {
        const within = expected;
        const over = value - expected;
        dataParts = [within, over, remainderToRenda];
        bgColors = [primaryColor, '#b51e1e', '#eafaf0'];
      } else {
        const within = value;
        const missing = expected - value;
        dataParts = [within, missing, remainderToRenda];
        bgColors = [primaryColor, '#b51e1e', '#eafaf0'];
      }
    }

    const ctx = canvasRef.nativeElement.getContext('2d')!;
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: dataParts,
            backgroundColor: bgColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
        },
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
    this.destroyCharts();
  }
}