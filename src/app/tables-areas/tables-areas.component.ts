import { AfterContentInit, Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ObtenerdatosService } from '../services/obtenerdatos.service';
import { response } from 'express';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SharedDataService } from '../services/shared-data.service';
import { elementAt, lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-tables-areas',
  imports: [TableModule,
    CommonModule,
    HttpClientModule,
  ],
  standalone: true,
  templateUrl: './tables-areas.component.html',
  styleUrl: './tables-areas.component.scss'
})

export class TablesAreasComponent implements OnInit {
  // Arreglos de datos 
  datosXArea: any[] = [];
  datos: any[] = [];
  logros: any[] = [];
  resultados: any[] = [];
  datosTrim: any[] = [];
  datosGlobales: any[] = [];
  dataTotales: any[] = []; // Arreglo para almacenar los totales

  // Variables generales
  totalAreas: number = 0;
  trimestre: number = 0;
  totalAreasTerminadas: number = 0;
  totalComponentesTerminados: number = 0;
  totalActividadesTerminadas: number = 0;
  totalIndicadoresAreaTerminados: number = 0;

  // Variable para controlar si los datos están listos
  datosCargados: boolean = false;

  constructor(private dataService: ObtenerdatosService, private sharedData: SharedDataService) {}

  async ngOnInit(): Promise<void> {
    try {
      // Suscripción a los datos por área
      this.sharedData.arregloDataArea$.subscribe(data => {
        if (data.length > 0) {
          this.datosXArea = data;
        }
      });

      // Suscripción a los datos de áreas
      this.sharedData.arregloAreas$.subscribe(async (data) => {
        if (data.length > 0) {
          this.datos = data;

          // Suscripción a los datos globales (incluyendo el trimestre)
          this.sharedData.arregloGlobal$.subscribe(async (globalData) => {
            if (globalData.length > 0) {

              this.datosGlobales = globalData;

              const nuevoTrimestre = globalData[0].trimestre;
              this.totalAreas = this.datosGlobales[0].TotalAreas;


              // Verificar si el trimestre ha cambiado
              if (this.trimestre !== nuevoTrimestre) {
                this.trimestre = nuevoTrimestre;

                // Reiniciar los datos antes de recalcular
                this.datosTrim = [];
                this.totalIndicadoresAreaTerminados = 0;
                this.dataTotales = []; // Reiniciar los totales
                this.datosCargados = false; // Indicar que los datos se están recalculando

                // Llamar a conteoLogros con los nuevos datos
                await this.conteoLogros(this.datos, this.trimestre);

                // Marcar los datos como cargados
                this.datosCargados = true;
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Error en ngOnInit:', error);
    }
  }

  /**
   * Function conteoLogros: Permite hacer conteo de los logros de ccada area y poder sacar 
   *                        numeros concretos del avance de cada area
   * 
   */
  async conteoLogros(areas: any[], trimestre: number): Promise<void> {
    let totalIndicadoresFinalizados: number = 0;
    let totalAreasConcluidas: number = 0;
    let totalAreasFaltantes: number = 0;
  
    this.totalComponentesTerminados = 0;
    this.totalActividadesTerminadas = 0;
  
    // Reiniciar el arreglo de totales
    this.dataTotales = [];
    this.datosTrim = []; // Reiniciar el arreglo de datos
  
    for (const area of areas) {
      try {
        // Reinicio de el total de indicadores para volver a hacer el conteo
        this.totalIndicadoresAreaTerminados = 0;
  
        // Obtención de logros a través de idArea
        const logros = await lastValueFrom(this.dataService.getDataLogros(area.idArea));
        const datosGenerales = this.datosXArea.find(data => data.idArea === area.idArea);
  
        this.logros = logros;
  
        // Filtro de logros por áreas y trimestre
        this.resultados = this.logros.filter(logro => logro.idTrimestre === trimestre && logro.idArea === area.idArea);
  
        // Recorrer el arreglo de datos para obtener el total 
        this.resultados.forEach(element => {
          if (element.causa != null && element.efecto != null && element.evidencia &&
            element.obs1 != null && element.obs2 != null) {
            this.totalIndicadoresAreaTerminados += 1;
  
            if (element.idComponente != 0 && element.idActividad === 0) {
              this.totalComponentesTerminados += 1;
            }
  
            if (element.idComponente != 0 && element.idActividad != 0) {
              this.totalActividadesTerminadas += 1;
            }
          }
        });
  
        this.datosTrim.push({
          UnidadOperante: area.cUnidadOperante,
          idArea: area.idArea,
          trimestre: trimestre,
          totalIndicadoresTerm: this.totalIndicadoresAreaTerminados,
          totalIndicadoresFaltantes: datosGenerales.totalIndicadores - this.totalIndicadoresAreaTerminados,
        });
      } catch (error) {
        console.error(`Error al obtener logros para el área ${area.idArea}:`, error);
      }
    }

    this.sharedData.setDatosTrim(this.datosTrim);
  
    // Ordenar los datos según el orden deseado
    this.datosTrim.sort((a, b) => {
      // 1. Terminados (totalIndicadoresFaltantes === 0)
      if (a.totalIndicadoresFaltantes === 0 && b.totalIndicadoresFaltantes !== 0) return -1;
      if (b.totalIndicadoresFaltantes === 0 && a.totalIndicadoresFaltantes !== 0) return 1;
  
      // 2. En progreso (totalIndicadoresTerm > totalIndicadoresFaltantes)
      if (a.totalIndicadoresTerm > a.totalIndicadoresFaltantes && b.totalIndicadoresTerm <= b.totalIndicadoresFaltantes) return -1;
      if (b.totalIndicadoresTerm > b.totalIndicadoresFaltantes && a.totalIndicadoresTerm <= a.totalIndicadoresFaltantes) return 1;
  
      // 3. En peligro (totalIndicadoresTerm <= totalIndicadoresFaltantes)
      return 0;
    });
  
    // Recorrer datos generales del trimestre para hacer cálculos
    this.datosTrim.forEach(element => {
      totalIndicadoresFinalizados += element.totalIndicadoresTerm;
  
      if (element.totalIndicadoresFaltantes === 0) {
        totalAreasConcluidas += 1;
      }
    });
  
    // Calcular totalAreasFaltantes correctamente
    totalAreasFaltantes = this.totalAreas - totalAreasConcluidas;
  
    // Guardar los totales en el arreglo
    this.dataTotales.push({
      totalAreasCulminadas: totalAreasConcluidas,
      totalAreasFaltantes: totalAreasFaltantes,
      totalComponentesTerminados: this.totalComponentesTerminados,
      totalActividadesTerminados: this.totalActividadesTerminadas,
    });
  
    // Actualizar los totales en el servicio compartido
    this.sharedData.setDataTotales(this.dataTotales);
  }
}