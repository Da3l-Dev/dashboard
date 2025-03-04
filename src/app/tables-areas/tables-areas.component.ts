import { Component, OnInit, OnDestroy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ObtenerdatosService } from '../services/obtenerdatos.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedDataService } from '../services/shared-data.service';
import { elementAt, lastValueFrom, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tables-areas',
  imports: [TableModule, CommonModule, HttpClientModule],
  standalone: true,
  templateUrl: './tables-areas.component.html',
  styleUrl: './tables-areas.component.scss'
})
export class TablesAreasComponent implements OnInit, OnDestroy {
  // Arreglos de datos
  datosXArea: any[] = [];
  datos: any[] = [];
  logros: any[] = [];
  resultados: any[] = [];
  datosTrim: any[] = [];
  datosGlobales: any[] = [];
  dataTotales: any[] = [];
  dataSeguimiento: any[] = [];


  // Variables generales
  totalAreas: number = 0;
  trimestre: number = 1; // Inicialmente en el primer trimestre
  totalAreasTerminadas: number = 0;
  totalComponentesTerminados: number = 0;
  totalActividadesTerminadas: number = 0;
  totalIndicadoresAreaTerminados: number = 0;
  datosCargados: boolean = false;
  tipoData: string = '';

  // Variables de seguimiento
  areasFinalizadasSeguimiento: number = 0; 

  // Subscripción para detectar cambios en el trimestre
  private globalSubscription: Subscription | undefined;

  constructor(
    private dataService: ObtenerdatosService,
    private sharedData: SharedDataService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Escuchar cambios en los datos globales (incluyendo el trimestre)
      this.globalSubscription = this.sharedData.arregloGlobal$.subscribe(async (globalData) => {
        if (globalData.length > 0) {
          const nuevoTrimestre = globalData[0].trimestre;
          this.tipoData = globalData[0].tipoData;

          // Proceso para el calculo del avance de areas
          if (this.trimestre !== nuevoTrimestre && this.tipoData === 'areas') {
            this.trimestre = nuevoTrimestre;
            this.totalAreas = globalData[0].TotalAreas;



            // Recalcular los datos con el nuevo trimestre
            await this.actualizarDatos();
          } 

          // Proceso para poder calcular los datos del seguimiento de un area
          if(this.tipoData === 'seguimiento'){
            await this.calculosSeguimiento(this.datos, nuevoTrimestre); 

          }
        }
      });

      // Escuchar cambios en los datos por área
      this.sharedData.arregloDataArea$.subscribe((data) => {
        if (data.length > 0) {
          this.datosXArea = data;
          this.totalAreas = data.length;
        }
      });

      // Escuchar cambios en las áreas
      this.sharedData.arregloAreas$.subscribe(async (data) => {
        if (data.length > 0) {
          this.datos = data;
          await this.actualizarDatos();
        }
      });
    } catch (error) {
      console.error('Error en ngOnInit:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.globalSubscription) {
      this.globalSubscription.unsubscribe();
    }
  }

  /**
   * Método que recalcula los datos cuando cambia el trimestre
   */
  private async actualizarDatos(): Promise<void> {
    try {

      this.datosCargados = false; // Indicar que está recalculando

      // Reiniciar variables
      this.datosTrim = [];
      this.totalIndicadoresAreaTerminados = 0;
      this.totalComponentesTerminados = 0;
      this.totalActividadesTerminadas = 0;
      this.dataTotales = [];

      // Llamar a conteo de logros con el trimestre actualizado
      await this.conteoLogros(this.datos, this.trimestre);

      this.datosCargados = true; // Datos listos
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    }
  }

  /**
   * Método para contar logros por área en el trimestre seleccionado
   */
  async conteoLogros(areas: any[], trimestre: number): Promise<void> {
    let totalIndicadoresFinalizados: number = 0;
    let totalAreasConcluidas: number = 0;
    let totalAreasFaltantes: number = 0;

    this.totalComponentesTerminados = 0;
    this.totalActividadesTerminadas = 0;
    this.datosTrim = [];

    for (const area of areas) {
      try {
        this.totalIndicadoresAreaTerminados = 0;

        const logros = await lastValueFrom(this.dataService.getDataLogros(area.idArea));
        const datosGenerales = this.datosXArea.find((data) => data.idArea === area.idArea);

        this.logros = logros;
        this.resultados = this.logros.filter((logro) => logro.idTrimestre === trimestre && logro.idArea === area.idArea);

        this.resultados.forEach((element) => {
          if (element.causa && element.efecto && element.evidencia && element.obs1 && element.obs2) {
            this.totalIndicadoresAreaTerminados++;

            if (element.idComponente !== 0 && element.idActividad === 0) {
              this.totalComponentesTerminados++;
            }

            if (element.idComponente !== 0 && element.idActividad !== 0) {
              this.totalActividadesTerminadas++;
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

    this.datosTrim.sort((a, b) => {
      // 1. Áreas que ya culminaron (totalIndicadoresFaltantes === 0) van primero
      if (a.totalIndicadoresFaltantes === 0 && b.totalIndicadoresFaltantes !== 0) return -1;
      if (b.totalIndicadoresFaltantes === 0 && a.totalIndicadoresFaltantes !== 0) return 1;
    
      // 2. Si ambas áreas no han culminado, se ordenan por la diferencia entre completados y faltantes
      const diferenciaA = a.totalIndicadoresTerm - a.totalIndicadoresFaltantes;
      const diferenciaB = b.totalIndicadoresTerm - b.totalIndicadoresFaltantes;
    
      // Si una área tiene más completados que faltantes, va primero
      if (diferenciaA > diferenciaB) return -1;
      if (diferenciaA < diferenciaB) return 1;
    
      // 3. Si tienen la misma diferencia, se ordenan por el total de indicadores faltantes
      return a.totalIndicadoresFaltantes - b.totalIndicadoresFaltantes;
    });
    
    this.datosTrim.forEach((element) => {
      totalIndicadoresFinalizados += element.totalIndicadoresTerm;
      if (element.totalIndicadoresFaltantes === 0) totalAreasConcluidas++;
    });

    totalAreasFaltantes = this.totalAreas - totalAreasConcluidas;

    this.dataTotales = [{
      totalAreasCulminadas: totalAreasConcluidas,
      totalAreasFaltantes: totalAreasFaltantes,
      totalComponentesTerminados: this.totalComponentesTerminados,
      totalActividadesTerminados: this.totalActividadesTerminadas,
    }];

    this.sharedData.setDataTotales(this.dataTotales);
  }


  // Funcion para el conteo de datos del seguimiento de las areas 
  async calculosSeguimiento(areas: any[], trimestre: number): Promise<void> {
    let idArea: number = 0;


    for (const area of areas) {
        // Obtención del idArea para poder calcular sus datos de seguimiento
        idArea = area.idArea;

        // Obtencion de los datos de seguimiento por area
        const seguimiento =  await lastValueFrom(this.dataService.getDataSeguimiento(idArea, 2024));


        await seguimiento.forEach(element => {
          switch(trimestre){
            // Datos Trimestre 1
            case 1:
              if(element.hallazgosTrim1 != null && element.indicadorTrim1 != null && element.justificaTrim1 != null && element.mediosTrim1 != null && element.mejoraTrim1 != null  && element.metaTrim1 != null && element.resumenTrim1 != null){
                this.areasFinalizadasSeguimiento += 1;
              }
              break;

            // Datos Trimestre 2
            case 2:

              break;

            // Datos Trimestre 3
            case 3:

              break;
            // Datos Trimestre 4
            case 4:

                break;
          }
        })

    }

  } 
}


