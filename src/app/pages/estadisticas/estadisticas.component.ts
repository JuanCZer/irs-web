import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../../services/estadisticas.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.less',
})
export class EstadisticasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fichasPorEstadoChart')
  fichasPorEstadoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fichasPorMesChart')
  fichasPorMesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tendenciaMensualChart')
  tendenciaMensualCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  cargando = true;
  mensajeError = '';

  // Variables que recibirán datos del servicio
  fichasPorEstado = {
    labels: [] as string[],
    data: [] as number[],
  };

  fichasPorMes = {
    labels: [] as string[],
    data: [] as number[],
  };

  tendenciaMensual = {
    labels: [] as string[],
    datasets: [] as Array<{ label: string; data: number[] }>,
  };

  // Estadísticas resumidas
  estadisticasResumen = {
    totalFichas: 0,
    fichasHoy: 0,
    fichasSemana: 0,
    fichasMes: 0,
    promedioMensual: 0,
    crecimientoMensual: 0,
  };

  constructor(private estadisticasService: EstadisticasService) {}

  async ngOnInit(): Promise<void> {
    // Cargar datos del servicio
    await this.cargarEstadisticas();
  }

  async cargarEstadisticas(): Promise<void> {
    try {
      this.cargando = true;
      this.mensajeError = '';

      const datos = await this.estadisticasService.obtenerEstadisticas();

      // Asignar datos al componente
      this.estadisticasResumen = datos.resumen;
      this.fichasPorEstado = datos.fichasPorEstado;
      this.fichasPorMes = datos.fichasPorMes;
      this.tendenciaMensual = datos.tendenciaMensual;
    } catch (error) {
      this.mensajeError =
        'Error al cargar las estadísticas. Por favor, intente nuevamente.';
    } finally {
      this.cargando = false;
      // Crear gráficas después de cargar datos
      setTimeout(() => {
        this.crearGraficas();
      }, 100);
    }
  }

  ngAfterViewInit(): void {
    // Las gráficas se crearán después de cargar los datos en ngOnInit
  }

  ngOnDestroy(): void {
    // Destruir las gráficas al salir del componente
    this.charts.forEach((chart) => chart.destroy());
  }

  private crearGraficas(): void {
    this.crearGraficaFichasPorEstado();
    this.crearGraficaFichasPorMes();
    this.crearGraficaTendenciaMensual();
  }

  private crearGraficaFichasPorEstado(): void {
    const ctx = this.fichasPorEstadoCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.fichasPorEstado.labels,
        datasets: [
          {
            label: 'Fichas por Estado',
            data: this.fichasPorEstado.data,
            backgroundColor: [
              'rgba(102, 126, 234, 0.8)',
              'rgba(118, 75, 162, 0.8)',
              'rgba(39, 174, 96, 0.8)',
              'rgba(243, 156, 18, 0.8)',
              'rgba(231, 76, 60, 0.8)',
              'rgba(52, 152, 219, 0.8)',
            ],
            borderColor: [
              'rgba(102, 126, 234, 1)',
              'rgba(118, 75, 162, 1)',
              'rgba(39, 174, 96, 1)',
              'rgba(243, 156, 18, 1)',
              'rgba(231, 76, 60, 1)',
              'rgba(52, 152, 219, 1)',
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Fichas por Estado',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    this.charts.push(chart);
  }

  private crearGraficaFichasPorMes(): void {
    const ctx = this.fichasPorMesCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Obtener el año actual
    const añoActual = new Date().getFullYear();

    // Calcular el máximo dinámico (valor máximo de los datos + 10% para espacio visual)
    const maxDatos = Math.max(...this.fichasPorMes.data, 10);
    const maxEjeY = Math.ceil((maxDatos * 1.1) / 10) * 10; // Redondea al siguiente múltiplo de 10

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.fichasPorMes.labels,
        datasets: [
          {
            label: 'Fichas Generadas',
            data: this.fichasPorMes.data,
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
          title: {
            display: true,
            text: `Fichas por Mes del Año ${añoActual}`,
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            min: 10,
            max: maxEjeY,
          },
        },
      },
    });

    this.charts.push(chart);
  }

  private crearGraficaTendenciaMensual(): void {
    const ctx = this.tendenciaMensualCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.tendenciaMensual.labels,
        datasets: [
          {
            label: this.tendenciaMensual.datasets[0].label,
            data: this.tendenciaMensual.datasets[0].data,
            borderColor: 'rgba(149, 165, 166, 1)',
            backgroundColor: 'rgba(149, 165, 166, 0.2)',
            borderWidth: 2,
            tension: 0.4,
          },
          {
            label: this.tendenciaMensual.datasets[1].label,
            data: this.tendenciaMensual.datasets[1].data,
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
          title: {
            display: true,
            text: 'Tendencia Comparativa',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    this.charts.push(chart);
  }

  async actualizarDatos(): Promise<void> {
    // Método para actualizar los datos desde el servicio
    await this.cargarEstadisticas();
    this.actualizarGraficas();
  }

  private actualizarGraficas(): void {
    // Destruir gráficas existentes y recrearlas
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
    this.crearGraficas();
  }

  async exportarPDF(): Promise<void> {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 10;

      // Título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Estadísticas', pageWidth / 2, yPosition, {
        align: 'center',
      });
      yPosition += 12;

      // Fecha de generación
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const fechaActual = new Date().toLocaleDateString('es-ES');
      doc.text(`Generado: ${fechaActual}`, pageWidth / 2, yPosition, {
        align: 'center',
      });
      yPosition += 8;

      // Línea separadora
      doc.setDrawColor(0, 0, 0);
      doc.line(10, yPosition, pageWidth - 10, yPosition);
      yPosition += 8;

      // Resumen de estadísticas
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen de Estadísticas', 10, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const resumenData = [
        `Total de Fichas: ${this.estadisticasResumen.totalFichas}`,
        `Fichas Hoy: ${this.estadisticasResumen.fichasHoy}`,
        `Fichas Esta Semana: ${this.estadisticasResumen.fichasSemana}`,
        `Fichas Este Mes: ${this.estadisticasResumen.fichasMes}`,
        `Promedio Mensual: ${this.estadisticasResumen.promedioMensual.toFixed(2)}`,
        `Crecimiento Mensual: ${this.estadisticasResumen.crecimientoMensual.toFixed(2)}%`,
      ];

      resumenData.forEach((linea) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 10;
        }
        doc.text(linea, 10, yPosition);
        yPosition += 6;
      });

      yPosition += 4;

      // Tabla de Fichas por Estado
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Fichas por Estado', 10, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const estadoTable = [
        ['Estado', 'Cantidad'],
        ...this.fichasPorEstado.labels.map((label, index) => [
          label,
          this.fichasPorEstado.data[index].toString(),
        ]),
      ];

      (doc as any).autoTable({
        head: [estadoTable[0]],
        body: estadoTable.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;

      // Tabla de Fichas por Mes
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Fichas por Mes', 10, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const mesTable = [
        ['Mes', 'Cantidad'],
        ...this.fichasPorMes.labels.map((label, index) => [
          label,
          this.fichasPorMes.data[index].toString(),
        ]),
      ];

      (doc as any).autoTable({
        head: [mesTable[0]],
        body: mesTable.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255] },
      });

      // Agregar nueva página para gráficas
      doc.addPage();
      yPosition = 10;

      // Capturar y agregar gráficas
      const canvases = [
        this.fichasPorEstadoCanvas,
        this.fichasPorMesCanvas,
        this.tendenciaMensualCanvas,
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
          // Prefer html2canvas capture to avoid potential cross-origin/tainted-canvas issues
          const captured = await html2canvas(canvasElement, {
            backgroundColor: '#ffffff',
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
          // Log detailed error and write a placeholder in the PDF
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

      // Descargar PDF
      const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '-');
      doc.save(`estadisticas_${fecha}.pdf`);
    } catch (error) {
      alert('Error al exportar el PDF. Por favor, intente nuevamente.');
    }
  }

  exportarExcel(): void {
    try {
      let csv = 'REPORTE DE ESTADÍSTICAS\n';
      csv += `Generado: ${new Date().toLocaleDateString('es-ES')}\n`;
      csv += '=====================================\n\n';

      // Resumen
      csv += 'RESUMEN DE ESTADÍSTICAS\n';
      csv += `Total de Fichas,${this.estadisticasResumen.totalFichas}\n`;
      csv += `Fichas Hoy,${this.estadisticasResumen.fichasHoy}\n`;
      csv += `Fichas Esta Semana,${this.estadisticasResumen.fichasSemana}\n`;
      csv += `Fichas Este Mes,${this.estadisticasResumen.fichasMes}\n`;
      csv += `Promedio Mensual,${this.estadisticasResumen.promedioMensual.toFixed(2)}\n`;
      csv += `Crecimiento Mensual,${this.estadisticasResumen.crecimientoMensual.toFixed(2)}%\n\n`;

      // Fichas por Estado
      csv += 'FICHAS POR ESTADO\n';
      csv += 'Estado,Cantidad\n';
      this.fichasPorEstado.labels.forEach((label, index) => {
        csv += `${label},${this.fichasPorEstado.data[index]}\n`;
      });
      csv += '\n';

      // Fichas por Mes
      csv += 'FICHAS POR MES\n';
      csv += 'Mes,Cantidad\n';
      this.fichasPorMes.labels.forEach((label, index) => {
        csv += `${label},${this.fichasPorMes.data[index]}\n`;
      });
      csv += '\n';

      // Tendencia Mensual
      csv += 'TENDENCIA COMPARATIVA\n';
      csv += 'Mes';
      this.tendenciaMensual.datasets.forEach((dataset) => {
        csv += `,${dataset.label}`;
      });
      csv += '\n';

      if (this.tendenciaMensual.labels.length > 0) {
        this.tendenciaMensual.labels.forEach((label, index) => {
          csv += label;
          this.tendenciaMensual.datasets.forEach((dataset) => {
            csv += `,${dataset.data[index]}`;
          });
          csv += '\n';
        });
      }

      // Crear blob y descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '-');
      link.setAttribute('href', url);
      link.setAttribute('download', `estadisticas_${fecha}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error al exportar el archivo. Por favor, intente nuevamente.');
    }
  }
}
