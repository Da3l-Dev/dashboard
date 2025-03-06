import { Component, OnInit, OnDestroy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ObtenerdatosService } from '../services/obtenerdatos.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedDataService } from '../services/shared-data.service';
import { elementAt, isEmpty, lastValueFrom, Subscription } from 'rxjs';
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

  // Subscripción para detectar cambios en el trimestre
  private globalSubscription: Subscription | undefined;

  constructor(
    private dataService: ObtenerdatosService,
    private sharedData: SharedDataService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Escuchar cambios en los datos globales (incluyendo el trimestre y tipoData)
      this.globalSubscription = this.sharedData.arregloGlobal$.subscribe(async (globalData) => {
        if (globalData.length > 0) {
          const nuevoTrimestre = globalData[0].trimestre;
          this.tipoData = globalData[0].tipoData;
  
          // Proceso para el cálculo del avance de áreas
          if (this.tipoData === 'areas') {
            if (this.trimestre !== nuevoTrimestre) {
              this.trimestre = nuevoTrimestre;
              this.totalAreas = globalData[0].TotalAreas;
  
              // Recalcular los datos con el nuevo trimestre
              await this.actualizarDatos();
            }
          }
  
          // Proceso para calcular los datos del seguimiento de un área
          if (this.tipoData === 'seguimiento') {
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
  
          // Solo actualizar datos si no está en modo de seguimiento
          if (this.tipoData !== 'seguimiento') {
            await this.actualizarDatos();
          }
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

    
    this.datosTrim.sort((a, b) => {
      // 1. Mueve los que no tienen nada (totalIndicadoresTerm === 0) al final
      if (a.totalIndicadoresTerm === 0 && b.totalIndicadoresTerm !== 0) return 1; // 'a' no tiene nada, 'b' sí, entonces 'a' va al final
      if (b.totalIndicadoresTerm === 0 && a.totalIndicadoresTerm !== 0) return -1; // 'b' no tiene nada, 'a' sí, entonces 'b' va al final
    
      // 2. Mueve las áreas que han terminado (totalIndicadoresFaltantes === 0) al principio
      if (a.totalIndicadoresFaltantes === 0 && b.totalIndicadoresFaltantes !== 0) return -1;
      if (b.totalIndicadoresFaltantes === 0 && a.totalIndicadoresFaltantes !== 0) return 1;
    
      // 3. Mantén el orden original para los demás casos
      return 0;
    });
    
    this.sharedData.setDatosTrim(this.datosTrim);

    
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


  // Función para el conteo de datos del seguimiento de las áreas
  async calculosSeguimiento(areas: any[], trimestre: number): Promise<void> {
    let idArea: number = 0;
    let totalComponenteSeguido: number = 0;
    let dataSeguimientoTable: any[] = [];
    this.datosCargados = false;
    let dataGeneralesSeguimiento: any[] = [];

    // Variables para contar áreas terminadas y faltantes
    let totalAreasTerminadas: number = 0;
    let totalAreasFaltantes: number = 0;

    // Verifica que el trimestre esté en el rango válido (1-4)
    if (trimestre < 1 || trimestre > 4) {
        console.error('Trimestre no válido. Debe ser un valor entre 1 y 4.');
        return;
    }

    for (let i = 0; i < areas.length; i++) {
        try {
            // Obtención del idArea para poder calcular sus datos de seguimiento
            idArea = areas[i].idArea;

            // Obtención de los datos de seguimiento por área
            const seguimientoTemp = await lastValueFrom(this.dataService.getDataSeguimiento(idArea, 2024));
            // Datos area (ficha técnica)
            const datosArea = await lastValueFrom(this.dataService.getDataProyects(idArea, 2024));

            // Crear un objeto para el área actual
            const areaData = {
                idArea: idArea,
                cUnidadOperante: areas[i].cUnidadOperante || '', // Nombre del área
                datos: seguimientoTemp.map(seguimiento => {
                    // Buscar la ficha técnica correspondiente al idIndicador
                    const fichaTecnica = datosArea.find(ficha => ficha.idIndicador === seguimiento.idIndicador);

                    // Combinar los datos de seguimiento y ficha técnica (solo los campos necesarios)
                    return {
                        ...seguimiento, // Datos de seguimiento
                        idComponente: fichaTecnica?.idComponente || null, // Campo de ficha técnica
                        idActividad: fichaTecnica?.idActividad || null,   // Campo de ficha técnica
                        numCA: fichaTecnica?.numCA || null               // Campo de ficha técnica
                    };
                })
            };

            // Agregar el área al arreglo unificado
            dataGeneralesSeguimiento.push(areaData);

            // Recorrido de los datos unificados para el área actual
            areaData.datos.forEach(element => {
                // Construye dinámicamente los nombres de los campos según el trimestre
                const camposRequeridos = [
                    element[`hallazgosTrim${trimestre}`],
                    element[`indicadorTrim${trimestre}`],
                    element[`justificaTrim${trimestre}`],
                    element[`mediosTrim${trimestre}`],
                    element[`mejoraTrim${trimestre}`],
                    element[`metaTrim${trimestre}`],
                    element[`resumenTrim${trimestre}`]
                ];

                // Verifica si todos los campos requeridos no son nulos
                if (camposRequeridos.every(campo => campo != null)) {
                    totalComponenteSeguido += 1;
                }
            });

            // Agregar datos a la tabla de seguimiento
            dataSeguimientoTable.push({
                UnidadOperante: areas[i].cUnidadOperante || '',
                totalIndicadoresTerm: totalComponenteSeguido,
                totalIndicadoresFaltantes: areaData.datos.length - totalComponenteSeguido,
            });

            // Reiniciar conteo de seguimiento concluido por área
            totalComponenteSeguido = 0;

        } catch (error) {
            console.error(`Error al obtener datos de seguimiento para el área ${idArea}:`, error);
        }
    }

    // Ordenar los datos para imprimir en la gráfica del seguimiento
    this.datosTrim = dataSeguimientoTable.sort((a, b) => {
        // 1. Mueve los que no tienen nada (totalIndicadoresTerm === 0) al final
        if (a.totalIndicadoresTerm === 0 && b.totalIndicadoresTerm !== 0) return 1; // 'a' no tiene nada, 'b' sí, entonces 'a' va al final
        if (b.totalIndicadoresTerm === 0 && a.totalIndicadoresTerm !== 0) return -1; // 'b' no tiene nada, 'a' sí, entonces 'b' va al final

        // 2. Mueve las áreas que han terminado (totalIndicadoresFaltantes === 0) al principio
        if (a.totalIndicadoresFaltantes === 0 && b.totalIndicadoresFaltantes !== 0) return -1;
        if (b.totalIndicadoresFaltantes === 0 && a.totalIndicadoresFaltantes !== 0) return 1;

        // 3. Mantén el orden original para los demás casos
        return 0;
    });

    // Inicializar contadores
    this.totalIndicadoresAreaTerminados = 0;
    this.totalComponentesTerminados = 0;
    this.totalActividadesTerminadas = 0;

    // Obtener todos los datos de las áreas
    const todosLosDatos = dataGeneralesSeguimiento.flatMap(area => area.datos);

    // Recorrer cada dato
    todosLosDatos.forEach(dato => {
        // Construir dinámicamente los nombres de los campos según el trimestre
        const camposRequeridos = [
            dato[`hallazgosTrim${trimestre}`],
            dato[`indicadorTrim${trimestre}`],
            dato[`justificaTrim${trimestre}`],
            dato[`mediosTrim${trimestre}`],
            dato[`mejoraTrim${trimestre}`],
            dato[`metaTrim${trimestre}`],
            dato[`resumenTrim${trimestre}`]
        ];

        // Verificar si todos los campos requeridos están completos
        if (camposRequeridos.every(campo => campo != null)) {
            this.totalIndicadoresAreaTerminados++;

            // Verificar si es un componente o una actividad
            if (dato.idComponente !== 0 && (dato.idActividad === 0 || dato.idActividad === null)) {
                this.totalComponentesTerminados++;
            }

            if (!isNaN(parseFloat(dato.numCA)) && parseFloat(dato.numCA) % 1 !== 0) {
                this.totalActividadesTerminadas++;
            }
        }
    });

    // Contar áreas terminadas y faltantes
    totalAreasTerminadas = this.datosTrim.filter(area => area.totalIndicadoresFaltantes === 0).length;
    totalAreasFaltantes = areas.length - totalAreasTerminadas;

    // Actualizar dataTotales con los nuevos valores
    this.dataTotales = [{
        totalAreasCulminadas: totalAreasTerminadas,
        totalAreasFaltantes: totalAreasFaltantes,
        totalComponentesTerminados: this.totalComponentesTerminados,
        totalActividadesTerminados: this.totalActividadesTerminadas,
    }];

    // Enviar los datos actualizados al servicio compartido
    this.sharedData.setDataTotales(this.dataTotales);
    this.sharedData.setDatosTrim(this.datosTrim);

    this.datosCargados = true;
    this.trimestre = 0;
}
}
