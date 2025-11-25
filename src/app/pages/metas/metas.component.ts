import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  Plugin,
  PieController,
  DoughnutController,
} from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../../model/transaction.interface';
import { AiAgentComponent } from '../../components/ai-agent/ai-agent.component';


Chart.register(PieController, DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, AiAgentComponent],
  templateUrl: './metas.component.html',
  styleUrls: ['./metas.component.scss'],
})
export class MetasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private alertCharts: Chart[] = [];

  metas = [
    { nome: 'Renda', percentual: 100, cor: '#2b6b4a' },
    { nome: 'Despesas fixas', percentual: 60, cor: '#7fbf6a' },
    { nome: 'Poupar', percentual: 20, cor: '#9ee7a8' },
    { nome: 'Lazer', percentual: 15, cor: '#b5e3b3' },
    { nome: 'Imprevistos', percentual: 5, cor: '#f5c7c7' },
  ];

  renda = 0;
  alertas: { nome: string; valor: number; esperado: number; cor: string }[] = [];
  metasConcluidas = false;

  constructor(private transactionService: TransactionService) {}

  ngAfterViewInit(): void {
    this.loadData();
  }

  @HostListener('window:resize')
  onResize() {
    this.redrawCharts();
  }

  private loadData(): void {
    this.transactionService.loadAllTransactions().subscribe({
      next: (data) => {
        // Extrair apenas as transações dos metadados
        const transactions = data.map(item => item.transaction);
        const categoryData = this.transactionService.getCategorySums(transactions);
        this.renda = categoryData.renda.value;

        this.alertas = [
          {
            nome: 'Despesas fixas',
            valor: categoryData.despesasFixas.value,
            esperado: categoryData.despesasFixas.expected,
            cor: '#7fbf6a',
          },
          {
            nome: 'Poupar',
            valor: categoryData.poupar.value,
            esperado: categoryData.poupar.expected,
            cor: '#9ee7a8',
          },
          {
            nome: 'Lazer',
            valor: categoryData.lazer.value,
            esperado: categoryData.lazer.expected,
            cor: '#b5e3b3',
          },
          {
            nome: 'Imprevistos',
            valor: categoryData.imprevistos.value,
            esperado: categoryData.imprevistos.expected,
            cor: '#f5c7c7',
          },
        ].filter((a) => Math.abs(a.valor - a.esperado) > 0.01);

        this.metasConcluidas = this.alertas.length === 0;

        this.createMainPieChart();
        this.gerarAlertas();
      },
      error: (err: any) => console.error('Erro ao carregar transações', err),
    });
  }

  private redrawCharts(): void {
    this.chart?.destroy();
    this.alertCharts.forEach((c) => c.destroy());
    this.alertCharts = [];
    this.createMainPieChart();
    this.gerarAlertas();
  }

  private gerarAlertas(): void {
    const container = document.querySelector('.alerts-row');
    if (!container) return;

    container.innerHTML = '';

    if (this.metasConcluidas) {
      const msg = document.createElement('div');
      msg.classList.add('alert-success');
      msg.textContent = 'Metas do mês foram concluídas com sucesso!';
      container.appendChild(msg);
      return;
    }

    container.setAttribute(
      'style',
      `
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2rem;
      align-items: flex-start;
      padding: 1rem;
    `
    );

    for (const alerta of this.alertas) {
      const div = document.createElement('div');
      div.classList.add('alert-item');
      div.setAttribute(
        'style',
        `
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
        min-width: 180px;
      `
      );

      div.innerHTML = `
        <div class="alert-chart" style="position: relative; width: 150px; height: 150px;">
          <canvas></canvas>
          <div class="center-text" 
               style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                      text-align:center; font-weight:600; color:#0a2b15;">
            <div class="amount" style="font-size:1.1rem;">R$ ${alerta.valor
              .toFixed(2)
              .replace('.', ',')}</div>
            <div class="label" style="font-size:0.9rem;">${alerta.nome}</div>
          </div>
        </div>
        <div class="alert-expected" 
             style="font-size:0.85rem; color:#444;">
          Total esperado:<br><span style="font-weight:600;">R$ ${alerta.esperado
            .toFixed(2)
            .replace('.', ',')}</span>
        </div>
      `;
      container.appendChild(div);

      const canvas = div.querySelector('canvas') as HTMLCanvasElement;
      this.createAlertDonut(canvas, alerta.valor, alerta.esperado, alerta.cor);
    }
  }

  private createMainPieChart(): void {
    if (this.chart) this.chart.destroy();

    const canvas = this.pieCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const metasParaGrafico = this.metas.filter((m) => m.nome !== 'Renda');
    const dataValues = metasParaGrafico.map((m) => m.percentual);
    const dataColors = metasParaGrafico.map((m) => m.cor);
    const dataLabels = metasParaGrafico.map((m) => m.nome);

    const textInsidePlugin: Plugin<'pie'> = {
      id: 'textInside',
      afterDraw: (chart) => {
        try {
          const { ctx } = chart;
          const dataset = chart.data.datasets?.[0];
          if (!dataset) return;
          const meta = chart.getDatasetMeta(0);
          const total = (dataset.data as number[]).reduce(
            (a, b) => a + (Number(b) || 0),
            0
          );
          ctx.save();
          meta.data.forEach((element: any, index: number) => {
            const { startAngle, endAngle, outerRadius, innerRadius, x, y } = element;
            const midAngle = (startAngle + endAngle) / 2;
            const radius = (outerRadius + innerRadius) / 2;
            const px = x + Math.cos(midAngle) * radius * 0.75;
            const py = y + Math.sin(midAngle) * radius * 0.75;
            const value = Number((dataset.data as number[])[index]) || 0;
            const percent = total > 0 ? Math.round((value / total) * 100) : 0;

            ctx.fillStyle = '#0a2b15';
            ctx.font = `${Math.max(10, radius / 6)}px Roboto, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percent}%`, px, py);
          });
          ctx.restore();
        } catch {}
      },
    };

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: dataLabels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: dataColors,
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverBorderWidth: 4,
            hoverBorderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { 
          duration: 800,
          easing: 'easeInOutQuart'
        },
        layout: { padding: 10 },
        plugins: { 
          legend: { display: false }, 
          tooltip: { 
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value}%`;
              }
            }
          } 
        },
      },
      plugins: [textInsidePlugin],
    });
  }

  private createAlertDonut(
    canvas: HTMLCanvasElement,
    value: number,
    expected: number,
    primaryColor: string
  ) {
    if (!canvas) return;

    const within = Math.min(value, expected);
    const diff = Math.abs(value - expected);
    const hasDiff = diff > 0.01;
    const dataParts = hasDiff ? [within, diff] : [within];
    const colors = hasDiff ? [primaryColor, '#b51e1e'] : [primaryColor];

    const ctx = canvas.getContext('2d')!;
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          { 
            data: dataParts, 
            backgroundColor: colors, 
            borderWidth: 2,
            borderColor: '#ffffff'
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        animation: { 
          duration: 600,
          easing: 'easeInOutQuart'
        },
        plugins: { 
          legend: { display: false }, 
          tooltip: { enabled: false } 
        },
      },
    });
    this.alertCharts.push(chart);
  }

  ngOnDestroy(): void {
    try {
      this.chart?.destroy();
    } catch {}
    this.alertCharts.forEach((c) => {
      try {
        c.destroy();
      } catch {}
    });
  }
}
