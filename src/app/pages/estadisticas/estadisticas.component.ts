import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.less',
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  @ViewChild('fichasPorEstadoChart')
  fichasPorEstadoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fichasPorMesChart')
  fichasPorMesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tendenciaMensualChart')
  tendenciaMensualCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  // Variables que recibirán datos del servicio
  fichasPorEstado = {
    labels: [
      'Aguascalientes',
      'Baja California',
      'Ciudad de México',
      'Jalisco',
      'Nuevo León',
      'Otros',
    ],
    data: [45, 32, 78, 55, 41, 89],
  };

  fichasPorPrioridad = {
    labels: ['Urgente', 'Alta', 'Media', 'Baja'],
    data: [23, 67, 89, 45],
  };

  fichasPorMes = {
    labels: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ],
    data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 42],
  };

  fichasPorSector = {
    labels: ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'],
    data: [65, 59, 80, 72, 56],
  };

  tendenciaMensual = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { label: '2024', data: [12, 19, 15, 25, 22, 30] },
      { label: '2025', data: [15, 23, 18, 30, 28, 38] },
    ],
  };

  // Estadísticas resumidas
  estadisticasResumen = {
    totalFichas: 340,
    fichasHoy: 12,
    fichasSemana: 85,
    fichasMes: 224,
    promedioMensual: 28,
    crecimientoMensual: 15.3,
  };

  ngOnInit(): void {
    // Aquí se llamaría al servicio para obtener los datos
    // this.estadisticasService.obtenerDatos().subscribe(data => { ... });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.crearGraficas();
    }, 100);
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
            text: 'Fichas por Mes (2025)',
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

  actualizarDatos(): void {
    // Método para actualizar los datos desde el servicio
    console.log('Actualizando datos de estadísticas...');
    // this.estadisticasService.obtenerDatos().subscribe(data => {
    //   this.fichasPorEstado = data.fichasPorEstado;
    //   ... actualizar otras variables
    //   this.actualizarGraficas();
    // });
  }

  private actualizarGraficas(): void {
    // Destruir gráficas existentes y recrearlas
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
    this.crearGraficas();
  }

  exportarPDF(): void {
    console.log('Exportar estadísticas a PDF');
    // Implementar lógica de exportación
  }

  exportarExcel(): void {
    console.log('Exportar estadísticas a Excel');
    // Implementar lógica de exportación
  }
}
