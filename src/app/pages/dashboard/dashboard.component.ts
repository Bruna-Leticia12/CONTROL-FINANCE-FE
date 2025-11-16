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
import { AiAgentComponent } from '../../components/ai-agent/ai-agent.component';

Chart.register(ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AiAgentComponent],
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

  data = {
    renda: { value: 0, expected: 0 },
    despesasFixas: { value: 0, expected: 0 },
    poupar: { value: 0, expected: 0 },
    lazer: { value: 0, expected: 0 },
    imprevistos: { value: 0, expected: 0 },
  };

  constructor(private transactionService: TransactionService) {}

  ngAfterViewInit(): void {
    this.transactionService.loadTransactions().subscribe({
      next: (data: Transaction[]) => {
        this.transactions = data;
        this.data = this.transactionService.getCategorySums(data);
        this.renderCharts();
      },
      error: (err) => console.error('Erro ao carregar transações', err),
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
    this.destroyCharts();
  }
}
