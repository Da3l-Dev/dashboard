import { Component, OnInit, OnDestroy } from '@angular/core';
import ApexCharts from 'apexcharts';
import { CardModule } from 'primeng/card';
import { SharedDataService } from '../services/shared-data.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CardModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent implements OnInit, OnDestroy {
  constructor(
    private sharedData: SharedDataService
  ) {}

  dataTotales: any[] = [];
  datosGlobales: any[] = [];
  chart1: ApexCharts | null = null; // Instancia de la gráfica 1
  chart2: ApexCharts | null = null; // Instancia de la gráfica 2

  ngOnInit(): void {
    // Inicializar gráficas con 0
    this.actualizarGrafica(0, 'chart-progress1', this.chart1);
    this.actualizarGrafica(0, 'chart-progress2', this.chart2);

    // Suscripción a dataTotales$
    this.sharedData.dataTotales$.subscribe(data => {

      if (data.length > 0) {
        
        this.dataTotales = data;

        // Suscripción a arregloGlobal$
        this.sharedData.arregloGlobal$.subscribe(globalData => {
          if (globalData.length > 0) {
            this.datosGlobales = globalData;


            // Calcular porcentajes
            const porcentajeComponentesTerminados = parseFloat(
              ((this.dataTotales[0].totalComponentesTerminados / this.datosGlobales[0].TotalComponentes) * 100).toFixed(2)
            );

            const porcentajeActividadesTerminados = parseFloat(
              ((this.dataTotales[0].totalActividadesTerminados / this.datosGlobales[0].TotalActividades) * 100).toFixed(2)
            );

            // Actualizar gráficas con los nuevos valores
            this.actualizarGrafica(porcentajeComponentesTerminados, 'chart-progress1', this.chart1);
            this.actualizarGrafica(porcentajeActividadesTerminados, 'chart-progress2', this.chart2);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Destruir gráficas al salir del componente
    if (this.chart1) {
      this.chart1.destroy();
    }
    if (this.chart2) {
      this.chart2.destroy();
    }
  }

  actualizarGrafica(porcentaje: number, elementId: string, chartInstance: ApexCharts | null): void {
    // Destruir la gráfica anterior si existe
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Opciones de la gráfica
    const options = {
      chart: {
        width: 190,
        height: 300,
        type: "radialBar",
      },
      series: [porcentaje], // Usar el porcentaje proporcionado
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: "50%",
          },
          dataLabels: {
            showOn: "always",
            name: {
              offsetY: -10,
              show: true,
              color: "#888",
              fontSize: "13px",
            },
            value: {
              color: "#111",
              fontSize: "15px",
              show: true,
              offsetY: -10,
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: [" "],
    };

    // Renderizar la nueva gráfica
    const chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
    chart.render();

    // Guardar la instancia de la gráfica
    if (elementId === 'chart-progress1') {
      this.chart1 = chart;
    } else if (elementId === 'chart-progress2') {
      this.chart2 = chart;
    }
  }
}