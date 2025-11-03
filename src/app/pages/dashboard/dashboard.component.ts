import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('incomeCanvas') incomeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fixedCanvas') fixedCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('saveCanvas') saveCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leisureCanvas') leisureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('unexpectedCanvas') unexpectedCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  data = {
    renda: { value: 3000, expected: 3000 },
    despesasFixas: { value: 1800, expected: 1800 },
    poupar: { value: 500, expected: 600 },
    lazer: { value: 550, expected: 450 },
    imprevistos: { value: 150, expected: 150 }
  };

  ngAfterViewInit(): void {
    this.createDonutIncome(this.incomeCanvas, this.data.renda.value);

    this.createDonutRelativeToRenda(this.fixedCanvas, this.data.despesasFixas.value, this.data.despesasFixas.expected, '#2b6b4a');
    this.createDonutRelativeToRenda(this.saveCanvas, this.data.poupar.value, this.data.poupar.expected, '#a5dca0');
    this.createDonutRelativeToRenda(this.leisureCanvas, this.data.lazer.value, this.data.lazer.expected, '#c9f0c7');
    this.createDonutRelativeToRenda(this.unexpectedCanvas, this.data.imprevistos.value, this.data.imprevistos.expected, '#c9f0c7');
  }

  private createDonutIncome(canvasRef: ElementRef<HTMLCanvasElement>, value: number) {
    const ctx = canvasRef.nativeElement.getContext('2d')!;
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Renda'],
        datasets: [{
          data: [value, 0],
          backgroundColor: ['#2b6b4a', '#e9f5ee'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private createDonutRelativeToRenda(canvasRef: ElementRef<HTMLCanvasElement>, value: number, expected: number, primaryColor: string) {
    const rendaValue = this.data.renda.value;
    const used = Math.min(value, rendaValue);               
    const remainderToRenda = Math.max(rendaValue - used, 0);
    const difference = Math.abs(value - expected);         
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
        labels: dataParts.map((_, i) => `part-${i}`),
        datasets: [{
          data: dataParts,
          backgroundColor: bgColors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false }
        },
        animation: { duration: 600 }
      }
    });

    this.charts.push(chart);
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }
}