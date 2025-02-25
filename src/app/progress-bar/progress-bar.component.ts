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
  constructor(private sharedData: SharedDataService) {}

  dataTotales: any[] = [];
  datosGlobales: any[] = [];
  porcentajeComponentes: number = 0;
  porcentajeActividades: number = 0;
  chart1: ApexCharts | null = null;
  chart2: ApexCharts | null = null;

  ngOnInit(): void {
    // Inicializar gráficas con 0%
    this.inicializarGrafica('chart-progress1');
    this.inicializarGrafica('chart-progress2');

    // Suscripción a dataTotales$
    this.sharedData.dataTotales$.subscribe(data => {
      if (data.length > 0) {
        this.dataTotales = data;

        this.sharedData.arregloGlobal$.subscribe(globalData => {
          if (globalData.length > 0) {
            this.datosGlobales = globalData;

            // Calcular los nuevos porcentajes con solo 2 decimales
            const nuevoPorcentajeComponentes = Math.round(
              ((this.dataTotales[0].totalComponentesTerminados / this.datosGlobales[0].TotalComponentes) * 100) * 100
            ) / 100;

            const nuevoPorcentajeActividades = Math.round(
              ((this.dataTotales[0].totalActividadesTerminados / this.datosGlobales[0].TotalActividades) * 100) * 100
            ) / 100;

            // Actualizar valores con transición progresiva más fluida
            this.incrementarProgresivamente(nuevoPorcentajeComponentes, 'chart-progress1', 'componentes');
            this.incrementarProgresivamente(nuevoPorcentajeActividades, 'chart-progress2', 'actividades');
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart1) this.chart1.destroy();
    if (this.chart2) this.chart2.destroy();
  }

  /**
   * Inicializa las gráficas con 0% para evitar recargas bruscas
   */
  inicializarGrafica(elementId: string): void {
    const options = {
      chart: {
        width: 190,
        height: 300,
        type: "radialBar",
      },
      series: [0], // Comienza en 0
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

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
    chart.render();

    if (elementId === 'chart-progress1') {
      this.chart1 = chart;
    } else if (elementId === 'chart-progress2') {
      this.chart2 = chart;
    }
  }

  /**
   * Incrementa los valores de la gráfica de forma progresiva y más fluida
   */
  incrementarProgresivamente(valorFinal: number, elementId: string, tipo: 'componentes' | 'actividades'): void {
    let valorActual = tipo === 'componentes' ? this.porcentajeComponentes : this.porcentajeActividades;
    
    if (valorFinal === valorActual) return; // Evita actualizar si no hay cambios

    const incremento = (valorFinal - valorActual) / 30; // Más fluido con 30 pasos
    const intervalo = setInterval(() => {
      valorActual += incremento;

      if ((incremento > 0 && valorActual >= valorFinal) || (incremento < 0 && valorActual <= valorFinal)) {
        valorActual = valorFinal;
        clearInterval(intervalo);
      }

      // Redondear a 2 decimales
      valorActual = Math.round(valorActual * 100) / 100;

      if (tipo === 'componentes') {
        this.porcentajeComponentes = valorActual;
        this.chart1?.updateSeries([this.porcentajeComponentes]); // Actualiza la gráfica sin recargar
      } else {
        this.porcentajeActividades = valorActual;
        this.chart2?.updateSeries([this.porcentajeActividades]); // Actualiza la gráfica sin recargar
      }
    }, 30); // Reduce el tiempo para mayor fluidez
  }
}
