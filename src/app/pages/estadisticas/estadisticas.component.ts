import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../../services/estadisticas.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { ThemeService } from '../../services/theme.service';


Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.less',
})
export class EstadisticasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fichasPorEstadoChart')
  reportsByStateCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fichasPorMesChart')
  reportsByMonthCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tendenciaMensualChart')
  monthlyTrendCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  loading = true;
  errorMessage = '';


  reportsByState = {
    labels: [] as string[],
    data: [] as number[],
  };

  reportsByMonth = {
    labels: [] as string[],
    data: [] as number[],
  };

  monthlyTrend = {
    labels: [] as string[],
    datasets: [] as Array<{ label: string; data: number[] }>,
  };


  statisticsSummary = {
    totalReports: 0,
    reportsToday: 0,
    reportsThisWeek: 0,
    reportsThisMonth: 0,
    monthlyAverage: 0,
    monthlyGrowth: 0,
  };

  constructor(
    private statisticsService: EstadisticasService,
    private themeService: ThemeService,
  ) {
    effect(() => {
      this.themeService.theme();

      if (!this.loading && this.charts.length > 0) {
        queueMicrotask(() => this.updateCharts());
      }
    });
  }

  async ngOnInit(): Promise<void> {

    await this.loadStatistics();
  }

  async loadStatistics(): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = '';

      const data = await this.statisticsService.getStatistics();


      this.statisticsSummary = data.summary;
      this.reportsByState = data.reportsByState;
      this.reportsByMonth = data.reportsByMonth;
      this.monthlyTrend = data.monthlyTrend;
    } catch (error) {
      this.errorMessage =
        'Error al cargar las estadísticas. Por favor, intente nuevamente.';
    } finally {
      this.loading = false;

      setTimeout(() => {
        this.createCharts();
      }, 100);
    }
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {

    this.charts.forEach((chart) => chart.destroy());
  }

  private createCharts(): void {
    this.createReportsByStateChart();
    this.createReportsByMonthChart();
    this.createMonthlyTrendChart();
  }

  private createReportsByStateChart(): void {
    const ctx = this.reportsByStateCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    const colors = this.getChartThemeColors();

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.reportsByState.labels,
        datasets: [
          {
            label: 'Fichas por Estado',
            data: this.reportsByState.data,
            backgroundColor: [
              'rgba(54, 90, 106, 0.82)',
              'rgba(70, 107, 123, 0.78)',
              'rgba(90, 126, 140, 0.74)',
              'rgba(117, 145, 156, 0.7)',
              'rgba(138, 158, 166, 0.66)',
              'rgba(32, 54, 66, 0.78)',
            ],
            borderColor: [
              'rgba(54, 90, 106, 1)',
              'rgba(70, 107, 123, 1)',
              'rgba(90, 126, 140, 1)',
              'rgba(117, 145, 156, 1)',
              'rgba(138, 158, 166, 1)',
              'rgba(32, 54, 66, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        color: colors.text,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Fichas por Estado',
            color: colors.text,
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          x: {
            ticks: { color: colors.text },
            grid: { color: colors.grid },
            border: { color: colors.border },
          },
          y: {
            beginAtZero: true,
            ticks: { color: colors.text },
            grid: { color: colors.grid },
            border: { color: colors.border },
          },
        },
      },
    });

    this.charts.push(chart);
  }

  private createReportsByMonthChart(): void {
    const ctx = this.reportsByMonthCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    const colors = this.getChartThemeColors();


    const currentYear = new Date().getFullYear();


    const maxData = Math.max(...this.reportsByMonth.data, 10);
    const maxYAxis = Math.ceil((maxData * 1.1) / 10) * 10;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.reportsByMonth.labels,
        datasets: [
          {
            label: 'Fichas Generadas',
            data: this.reportsByMonth.data,
            borderColor: 'rgba(70, 107, 123, 1)',
            backgroundColor: 'rgba(70, 107, 123, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        color: colors.text,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: colors.text },
          },
          title: {
            display: true,
            text: `Fichas por Mes del Año ${currentYear}`,
            color: colors.text,
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          x: {
            ticks: { color: colors.text },
            grid: { color: colors.grid },
            border: { color: colors.border },
          },
          y: {
            min: 10,
            max: maxYAxis,
            ticks: { color: colors.text },
            grid: { color: colors.grid },
            border: { color: colors.border },
          },
        },
      },
    });

    this.charts.push(chart);
  }

  private createMonthlyTrendChart(): void {
    const ctx = this.monthlyTrendCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    const colors = this.getChartThemeColors();

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthlyTrend.labels,
        datasets: [
          {
            label: this.monthlyTrend.datasets[0].label,
            data: this.monthlyTrend.datasets[0].data,
            borderColor: 'rgba(149, 165, 166, 1)',
            backgroundColor: 'rgba(149, 165, 166, 0.2)',
            borderWidth: 2,
            tension: 0.4,
          },
          {
            label: this.monthlyTrend.datasets[1].label,
            data: this.monthlyTrend.datasets[1].data,
            borderColor: 'rgba(70, 107, 123, 1)',
            backgroundColor: 'rgba(70, 107, 123, 0.2)',
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: {
        color: colors.text,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: colors.text },
          },
          title: {
            display: true,
            text: 'Tendencia Comparativa',
            color: colors.text,
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          x: {
            ticks: { color: colors.text },
            grid: { color: colors.grid },
            border: { color: colors.border },
          },
          y: {
            beginAtZero: true,
            ticks: { color: colors.text },
            grid: { color: colors.grid },
            border: { color: colors.border },
          },
        },
      },
    });

    this.charts.push(chart);
  }

  async updateData(): Promise<void> {

    await this.loadStatistics();
    this.updateCharts();
  }

  private updateCharts(): void {

    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
    this.createCharts();
  }

  private getChartThemeColors(): {
    text: string;
    grid: string;
    border: string;
  } {
    return this.themeService.theme() === 'dark'
      ? { text: '#ffffff', grid: 'rgba(255, 255, 255, 0.16)', border: '#52646d' }
      : { text: '#1c2b34', grid: 'rgba(28, 43, 52, 0.12)', border: '#b9c6cc' };
  }

  async exportPdf(): Promise<void> {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 10;


      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Estadísticas', pageWidth / 2, yPosition, {
        align: 'center',
      });
      yPosition += 12;


      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('es-ES');
      doc.text(`Generado: ${currentDate}`, pageWidth / 2, yPosition, {
        align: 'center',
      });
      yPosition += 8;


      doc.setDrawColor(0, 0, 0);
      doc.line(10, yPosition, pageWidth - 10, yPosition);
      yPosition += 8;


      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen de Estadísticas', 10, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const summaryData = [
        `Total de Fichas: ${this.statisticsSummary.totalReports}`,
        `Fichas Hoy: ${this.statisticsSummary.reportsToday}`,
        `Fichas Esta Semana: ${this.statisticsSummary.reportsThisWeek}`,
        `Fichas Este Mes: ${this.statisticsSummary.reportsThisMonth}`,
        `Promedio Mensual: ${this.statisticsSummary.monthlyAverage.toFixed(2)}`,
        `Crecimiento Mensual: ${this.statisticsSummary.monthlyGrowth.toFixed(2)}%`,
      ];

      summaryData.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 10;
        }
        doc.text(line, 10, yPosition);
        yPosition += 6;
      });

      yPosition += 4;


      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Fichas por Estado', 10, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const stateTable = [
        ['Estado', 'Cantidad'],
        ...this.reportsByState.labels.map((label, index) => [
          label,
          this.reportsByState.data[index].toString(),
        ]),
      ];

      (doc as any).autoTable({
        head: [stateTable[0]],
        body: stateTable.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [54, 90, 106], textColor: [255, 255, 255] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;


      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Fichas por Mes', 10, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const monthTable = [
        ['Mes', 'Cantidad'],
        ...this.reportsByMonth.labels.map((label, index) => [
          label,
          this.reportsByMonth.data[index].toString(),
        ]),
      ];

      (doc as any).autoTable({
        head: [monthTable[0]],
        body: monthTable.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [54, 90, 106], textColor: [255, 255, 255] },
      });


      doc.addPage();
      yPosition = 10;


      const canvases = [
        this.reportsByStateCanvas,
        this.reportsByMonthCanvas,
        this.monthlyTrendCanvas,
      ];

      const chartTitles = [
        'Fichas por Estado',
        'Fichas por Mes',
        'Tendencia Comparativa',
      ];

      let chartIndex = 0;
      for (const canvas of canvases) {
        if (!canvas) {
          chartIndex++;
          continue;
        }

        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 10;
        }

        const canvasElement = canvas.nativeElement;

        try {

          const captured = await html2canvas(canvasElement, {
            backgroundColor:
              this.themeService.theme() === 'dark' ? '#172128' : '#ffffff',
            scale: 2,
          });
          const imgData = captured.toDataURL('image/png');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(chartTitles[chartIndex], 10, yPosition);
          yPosition += 5;

          const imgWidth = pageWidth - 20;
          const imgHeight = (captured.height / captured.width) * imgWidth;

          doc.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (err) {

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(
            `No se pudo capturar la gráfica: ${chartTitles[chartIndex]}`,
            10,
            yPosition,
          );
          yPosition += 8;
        }

        chartIndex++;
      }


      const date = new Date().toISOString().split('T')[0].replace(/-/g, '-');
      doc.save(`estadisticas_${date}.pdf`);
    } catch (error) {
      alert('Error al exportar el PDF. Por favor, intente nuevamente.');
    }
  }

  exportExcel(): void {
    try {
      let csv = 'REPORTE DE ESTADÍSTICAS\n';
      csv += `Generado: ${new Date().toLocaleDateString('es-ES')}\n`;
      csv += '=====================================\n\n';


      csv += 'RESUMEN DE ESTADÍSTICAS\n';
      csv += `Total de Fichas,${this.statisticsSummary.totalReports}\n`;
      csv += `Fichas Hoy,${this.statisticsSummary.reportsToday}\n`;
      csv += `Fichas Esta Semana,${this.statisticsSummary.reportsThisWeek}\n`;
      csv += `Fichas Este Mes,${this.statisticsSummary.reportsThisMonth}\n`;
      csv += `Promedio Mensual,${this.statisticsSummary.monthlyAverage.toFixed(2)}\n`;
      csv += `Crecimiento Mensual,${this.statisticsSummary.monthlyGrowth.toFixed(2)}%\n\n`;


      csv += 'FICHAS POR ESTADO\n';
      csv += 'Estado,Cantidad\n';
      this.reportsByState.labels.forEach((label, index) => {
        csv += `${label},${this.reportsByState.data[index]}\n`;
      });
      csv += '\n';


      csv += 'FICHAS POR MES\n';
      csv += 'Mes,Cantidad\n';
      this.reportsByMonth.labels.forEach((label, index) => {
        csv += `${label},${this.reportsByMonth.data[index]}\n`;
      });
      csv += '\n';


      csv += 'TENDENCIA COMPARATIVA\n';
      csv += 'Mes';
      this.monthlyTrend.datasets.forEach((dataset) => {
        csv += `,${dataset.label}`;
      });
      csv += '\n';

      if (this.monthlyTrend.labels.length > 0) {
        this.monthlyTrend.labels.forEach((label, index) => {
          csv += label;
          this.monthlyTrend.datasets.forEach((dataset) => {
            csv += `,${dataset.data[index]}`;
          });
          csv += '\n';
        });
      }


      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const date = new Date().toISOString().split('T')[0].replace(/-/g, '-');
      link.setAttribute('href', url);
      link.setAttribute('download', `estadisticas_${date}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error al exportar el archivo. Por favor, intente nuevamente.');
    }
  }
}
