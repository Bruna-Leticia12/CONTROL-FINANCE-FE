import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  Plugin,
  PieController
} from 'chart.js';

Chart.register(PieController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metas.component.html',
  styleUrls: ['./metas.component.scss']
})
export class MetasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('alertPoupar') alertPoupar!: ElementRef<HTMLCanvasElement>;
  @ViewChild('alertLazer') alertLazer!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private alertCharts: Chart[] = [];

  metas = [
    { nome: 'Renda', percentual: 100, cor: '#2b6b4a' },
    { nome: 'Despesas fixas', percentual: 60, cor: '#7fbf6a' },
    { nome: 'Poupar', percentual: 20, cor: '#9ee7a8' },
    { nome: 'Lazer', percentual: 15, cor: '#b5e3b3' },
    { nome: 'Imprevistos', percentual: 5, cor: '#f5c7c7' }
  ];

  ngAfterViewInit(): void {
    this.createMainPieChart();
    this.createAlertDonut(this.alertPoupar, 500, 600, '#c9f0c7');
    this.createAlertDonut(this.alertLazer, 550, 450, '#c9f0c7');
  }

  private createMainPieChart(): void {
    if (this.chart) {
      try { this.chart.destroy(); } catch (e) {}
    }

    const canvas = this.pieCanvas?.nativeElement;
    if (!canvas) {
      console.warn('Canvas do pie não encontrado');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Context 2D não disponível no canvas do pie');
      return;
    }

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
          if (!meta || !meta.data) return;
          const total = (dataset.data as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
          ctx.save();
          meta.data.forEach((element: any, index: number) => {
            if (!element) return;
            const startAngle = element.startAngle ?? element._model?.startAngle;
            const endAngle = element.endAngle ?? element._model?.endAngle;
            const outerRadius = element.outerRadius ?? element._model?.outerRadius;
            const innerRadius = element.innerRadius ?? element._model?.innerRadius;
            const x = element.x ?? element._model?.x;
            const y = element.y ?? element._model?.y;

            if (
              startAngle == null ||
              endAngle == null ||
              outerRadius == null ||
              innerRadius == null ||
              x == null ||
              y == null
            ) {
              return;
            }

            const midAngle = (startAngle + endAngle) / 2;
            const radius = (outerRadius + innerRadius) / 2;
            const px = x + Math.cos(midAngle) * radius;
            const py = y + Math.sin(midAngle) * radius;
            const value = Number((dataset.data as number[])[index]) || 0;
            const percent = total > 0 ? Math.round((value / total) * 100) : 0;

            let fill = '#fff';
            const bg = (dataset.backgroundColor as string[])[index] || '#000';
            if (this.isColorLight(bg)) fill = '#0a2b15';

            ctx.fillStyle = fill;
            ctx.font = '700 12px Roboto, system-ui, -apple-system';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percent}%`, px, py);
          });
          ctx.restore();
        } catch (e) {

        }
      }
    };

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: dataLabels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: dataColors,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: true,
          duration: 600
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        }
      },
      plugins: [textInsidePlugin]
    });
  }

  private isColorLight(hex: string): boolean {
    try {
      let h = hex.replace('#', '');
      if (h.length === 3) {
        h = h.split('').map(ch => ch + ch).join('');
      }
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.7; 
    } catch {
      return false;
    }
  }

  private createAlertDonut(
    canvasRef: ElementRef<HTMLCanvasElement>,
    value: number,
    expected: number,
    primaryColor: string
  ) {
    if (!canvasRef || !canvasRef.nativeElement) return;
    const within = Math.min(value, expected);
    const diff = Math.abs(value - expected);
    const hasDiff = diff > 0;
    const dataParts = hasDiff ? [within, diff] : [within];
    const colors = hasDiff ? [primaryColor, '#b51e1e'] : [primaryColor];

    const ctx = canvasRef.nativeElement.getContext('2d')!;
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: dataParts,
            backgroundColor: colors,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        animation: {
          animateRotate: true,
          duration: 500
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });

    this.alertCharts.push(chart);
  }

  ngOnDestroy(): void {
    try { this.chart?.destroy(); } catch {}
    this.alertCharts.forEach((c) => {
      try { c.destroy(); } catch {}
    });
  }
}