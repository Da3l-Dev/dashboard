import { Component, OnInit, OnDestroy } from '@angular/core';
import ApexCharts from 'apexcharts';
import { SharedDataService } from '../services/shared-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-grafica-anual',
  standalone: true,
  templateUrl: './grafica-anual.component.html',
  styleUrl: './grafica-anual.component.scss'
})
export class GraficaAnualComponent implements OnInit, OnDestroy {
  constructor(private sharedData: SharedDataService) {}

  datos: any[] = [];
  categorias: string[] = [];
  indicadoresTerminados: number[] = [];
  indicadoresFaltantes: number[] = [];

  chart: ApexCharts | null = null;
  datosCargados: boolean = false; // Bandera para manejar la carga
  private dataSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.dataSubscription = this.sharedData.areasDatosTrim$.subscribe(data => {
      if (data.length > 0) {
        this.datos = data;
        this.datosCargados = false; // Iniciar la carga

        setTimeout(() => {
          this.procesarDatos();
          this.datosCargados = true; // Activar bandera cuando termine
        }, 500); // Simulación de carga progresiva
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    if (this.chart) this.chart.destroy();
  }

  private procesarDatos(): void {
    // Limpiar arrays antes de agregar nuevos datos
    this.categorias = [];
    this.indicadoresTerminados = [];
    this.indicadoresFaltantes = [];

    this.datos.forEach(element => {
      const palabras = element.UnidadOperante.split(' ');
      const ultimasDosPalabras = palabras.slice(-1).join(' '); // Tomar última palabra

      this.categorias.push(ultimasDosPalabras);
      this.indicadoresTerminados.push(element.totalIndicadoresTerm);
      this.indicadoresFaltantes.push(element.totalIndicadoresFaltantes);
    });

    this.actualizarGrafica();
  }

  private actualizarGrafica(): void {
    const options2 = {
      series: [
        {
          name: 'Indicadores Terminados',
          data: this.indicadoresTerminados,
          color: '#00E396'
        },
        {
          name: 'Indicadores Faltantes',
          data: this.indicadoresFaltantes,
          color: '#FF4560'
        }
      ],
      chart: {
        fontFamily: 'Plus Jakarta Sans , serif',
        type: 'bar',
        height: 450,
        stacked: true,
        animations: {
          enabled: true,
          easing: 'easeout',
          speed: 800
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '11px',
                fontWeight: 700
              }
            }
          }
        }
      },
      xaxis: {
        categories: this.categorias
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        offsetY: 40
      },
      fill: {
        opacity: 1
      }
    };

    if (!this.chart) {
      this.chart = new ApexCharts(document.querySelector("#grafica-anual"), options2);
      this.chart.render();
    } else {
      this.chart.updateOptions(options2);
    }
  }
}
