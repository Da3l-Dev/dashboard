import { Component, OnInit } from '@angular/core';
import ApexCharts from 'apexcharts';
import { SharedDataService } from '../services/shared-data.service';

@Component({
  selector: 'app-grafica-anual',
  standalone: true,
  templateUrl: './grafica-anual.component.html',
  styleUrl: './grafica-anual.component.scss'
})
export class GraficaAnualComponent implements OnInit {
  constructor(private sharedData: SharedDataService) {}

  dataAreas: any[] = [];
  datos: any[] = [];

  categorias: any[] = [];
  indicadoresTerminados: any[] = [];
  indicadoresFaltantes: any[] = [];

  chart: ApexCharts | null = null; // Variable para almacenar la instancia de la gráfica

  ngOnInit(): void {
    this.sharedData.areasDatosTrim$.subscribe(data => {
      if (data.length > 0) {
        this.datos = data;

        // Limpiar arrays antes de agregar nuevos datos
        this.categorias = [];
        this.indicadoresTerminados = [];
        this.indicadoresFaltantes = [];

        this.datos.forEach(element => {
          // Dividir la cadena en palabras
          const palabras = element.UnidadOperante.split(' ');
          const indTerm = element.totalIndicadoresTerm;
          const indFaltantes = element.totalIndicadoresFaltantes;

          // Tomar las últimas dos palabras
          const ultimasDosPalabras = palabras.slice(-1).join(' ');

          // Agregar las últimas dos palabras al array de categorías
          this.categorias.push(ultimasDosPalabras);
          this.indicadoresTerminados.push(indTerm);
          this.indicadoresFaltantes.push(indFaltantes);
        });

        this.generarGrafica(this.categorias, this.indicadoresTerminados, this.indicadoresFaltantes);
      }
    });
  }

  generarGrafica(categories: any[], indicadoresTerminados: any[], indicadoresFaltantes: any[]): void {
    // Destruir la gráfica anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    const options2 = {
      series: [
        {
          name: 'Indicadores Terminados',
          data: indicadoresTerminados,
          color: '#00E396'
        },
        {
          name: 'Indicadores Faltantes',
          data: indicadoresFaltantes,
          color: '#FF4560'
        }
      ],
      chart: {
        type: 'bar',
        height: 400,
        stacked: true,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0,
              verticalAlign: 'middle',
              itemMargin: {
                horizontal: 5,
                vertical: 5
              }
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 10,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '11px',
                fontWeight: 200
              }
            }
          }
        }
      },
      xaxis: {
        categories: categories
      },
      legend: {
        position: 'top', // Posición de la leyenda a la derecha
        horizontalAlign: 'center', // Alinear verticalmente en la parte superior
        offsetY: 40, // Ajustar la posición vertical
        formatter: function (seriesName: string) {
          return seriesName; // Mostrar el nombre de la serie
        },
        itemMargin: {
          horizontal: 0, // Eliminar espaciado horizontal entre elementos
          vertical: 10 // Aumentar espaciado vertical entre elementos
        },
        markers: {
          width: 12, // Ancho del marcador de la leyenda
          height: 12, // Alto del marcador de la leyenda
          radius: 12 // Radio del marcador de la leyenda
        }
      },
      fill: {
        opacity: 1
      }
    };

    // Crear una nueva instancia de la gráfica
    this.chart = new ApexCharts(document.querySelector("#grafica-anual"), options2);
    this.chart.render();
  }
}