import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardComponent } from "./card/card.component";
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { TablesAreasComponent } from './tables-areas/tables-areas.component';
import { AsideMenuComponent } from './aside-menu/aside-menu.component';
import { GraficaAnualComponent } from './grafica-anual/grafica-anual.component';
import { CardInfoComponent } from './card-info/card-info.component';
import { HttpClientModule } from '@angular/common/http';
import { ObtenerdatosService } from './services/obtenerdatos.service';
import { SharedDataService } from './services/shared-data.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CardComponent,
    ProgressBarComponent,
    TablesAreasComponent,
    AsideMenuComponent,
    GraficaAnualComponent,
    CardInfoComponent,
    HttpClientModule,
  ],
  providers: [
    ObtenerdatosService,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private intervalSubscription: Subscription | undefined;

  constructor(
    private datosProyecto: ObtenerdatosService,
    private sharedData: SharedDataService,
  ) {}

  // Variables para almacenar los datos
  totalDeAreas: number = 0;
  totalDeComponentes: number = 0;
  totalDeActividades: number = 0;

  // Totales de logros, causas, efectos, evidencias, obs1 y obs2 por trimestre
  totalLogrosTrim1: number = 0;
  totalLogrosTrim2: number = 0;
  totalLogrosTrim3: number = 0;
  totalLogrosTrim4: number = 0;

  totalCausaTerminadaTrim1: number = 0;
  totalCausaTerminadaTrim2: number = 0;
  totalCausaTerminadaTrim3: number = 0;
  totalCausaTerminadaTrim4: number = 0;

  totalEfectoTerminadaTrim1: number = 0;
  totalEfectoTerminadaTrim2: number = 0;
  totalEfectoTerminadaTrim3: number = 0;
  totalEfectoTerminadaTrim4: number = 0;

  totalEvidenciasTerminadasTrim1: number = 0;
  totalEvidenciasTerminadasTrim2: number = 0;
  totalEvidenciasTerminadasTrim3: number = 0;
  totalEvidenciasTerminadasTrim4: number = 0;

  totalObs1TerminadasTrim1: number = 0;
  totalObs1TerminadasTrim2: number = 0;
  totalObs1TerminadasTrim3: number = 0;
  totalObs1TerminadasTrim4: number = 0;

  totalObs2TerminadasTrim1: number = 0;
  totalObs2TerminadasTrim2: number = 0;
  totalObs2TerminadasTrim3: number = 0;
  totalObs2TerminadasTrim4: number = 0;

  datosGlobales: any[] = [];
  datosTrimestre: any[] = [];
  datosArea: any[] = [];
  areas: any[] = [];

  // Método inicial para obtener los datos
  async ngOnInit(): Promise<void> {
    // Ejecutar la función inmediatamente al iniciar
    await this.obtenerDatos();

    // Ejecutar la función cada hora (3600000 ms)
    this.intervalSubscription = interval(3600000).subscribe(() => {
      this.obtenerDatos();
    });
  }

  ngOnDestroy(): void {
    // Limpiar la suscripción al intervalo cuando el componente se destruye
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  // Función para obtener y procesar los datos
  async obtenerDatos(): Promise<void> {
    try {
      console.log("Obteniendo datos...");
  
      // Reiniciar variables antes de calcular nuevos datos
      this.reiniciarVariables();
  
      // Obtener el trimestre actual desde SharedDataService o usar 1 si no hay datos
      let trimestreActual = 1;
      
      try {
        const globalData = await firstValueFrom(this.sharedData.arregloGlobal$);
        if (globalData && globalData.length > 0 && globalData[0].trimestre) {
          trimestreActual = globalData[0].trimestre; // Mantiene el trimestre seleccionado
        }
      } catch (error) {
        console.warn("No se pudo obtener el trimestre, usando el valor por defecto (1).");
      }
  
      // Obtener las áreas
      this.areas = await lastValueFrom(this.datosProyecto.getAllAreas());
      this.totalDeAreas = this.areas.length;
  
      // Realizar el conteo de componentes y actividades
      await this.conteoElementos(this.areas);
  
      // Guardar datos globales con el trimestre correcto
      this.datosGlobales = [{
        TotalAreas: this.totalDeAreas,
        TotalComponentes: this.totalDeComponentes,
        TotalActividades: this.totalDeActividades,
        trimestre: trimestreActual, // Mantener el trimestre seleccionado
      }];
  
  
      // Guardar datos trimestrales
      this.datosTrimestre = [
        {
          trimestre: 1,
          totalLogros: this.totalLogrosTrim1,
          totalCuasaTrim1: this.totalCausaTerminadaTrim1,
          totalEfectoTrim1: this.totalEfectoTerminadaTrim1,
          totalEvidenciaTrim1: this.totalEvidenciasTerminadasTrim1,
          totalObs1Trim1: this.totalObs1TerminadasTrim1,
          totalObs2Trim1: this.totalObs2TerminadasTrim1,
        },
        {
          trimestre: 2,
          totalLogros: this.totalLogrosTrim2,
          totalCuasaTrim2: this.totalCausaTerminadaTrim2,
          totalEfectoTrim2: this.totalEfectoTerminadaTrim2,
          totalEvidenciaTrim2: this.totalEvidenciasTerminadasTrim2,
          totalObs1Trim2: this.totalObs1TerminadasTrim2,
          totalObs2Trim2: this.totalObs2TerminadasTrim2,
        },
        {
          trimestre: 3,
          totalLogros: this.totalLogrosTrim3,
          totalCuasaTrim3: this.totalCausaTerminadaTrim3,
          totalEfectoTrim3: this.totalEfectoTerminadaTrim3,
          totalEvidenciaTrim3: this.totalEvidenciasTerminadasTrim3,
          totalObs1Trim3: this.totalObs1TerminadasTrim3,
          totalObs2Trim3: this.totalObs2TerminadasTrim3,
        },
        {
          trimestre: 4,
          totalLogros: this.totalLogrosTrim4,
          totalCuasaTrim4: this.totalCausaTerminadaTrim4,
          totalEfectoTrim4: this.totalEfectoTerminadaTrim4,
          totalEvidenciaTrim4: this.totalEvidenciasTerminadasTrim4,
          totalObs1Trim4: this.totalObs1TerminadasTrim4,
          totalObs2Trim4: this.totalObs2TerminadasTrim4,
        }
      ];
  
      // Enviar datos a SharedDataService
      this.sharedData.setArregloAreas(this.areas);
      this.sharedData.setArregloDataAreas(this.datosArea);
      this.sharedData.setArregloGlobal(this.datosGlobales);

  
      console.log('Datos enviados a SharedDataService con trimestre:', trimestreActual);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }
  

  // Función para reiniciar todas las variables
  private reiniciarVariables(): void {
    this.totalDeAreas = 0;
    this.totalDeComponentes = 0;
    this.totalDeActividades = 0;

    this.totalLogrosTrim1 = 0;
    this.totalLogrosTrim2 = 0;
    this.totalLogrosTrim3 = 0;
    this.totalLogrosTrim4 = 0;

    this.totalCausaTerminadaTrim1 = 0;
    this.totalCausaTerminadaTrim2 = 0;
    this.totalCausaTerminadaTrim3 = 0;
    this.totalCausaTerminadaTrim4 = 0;

    this.totalEfectoTerminadaTrim1 = 0;
    this.totalEfectoTerminadaTrim2 = 0;
    this.totalEfectoTerminadaTrim3 = 0;
    this.totalEfectoTerminadaTrim4 = 0;

    this.totalEvidenciasTerminadasTrim1 = 0;
    this.totalEvidenciasTerminadasTrim2 = 0;
    this.totalEvidenciasTerminadasTrim3 = 0;
    this.totalEvidenciasTerminadasTrim4 = 0;

    this.totalObs1TerminadasTrim1 = 0;
    this.totalObs1TerminadasTrim2 = 0;
    this.totalObs1TerminadasTrim3 = 0;
    this.totalObs1TerminadasTrim4 = 0;

    this.totalObs2TerminadasTrim1 = 0;
    this.totalObs2TerminadasTrim2 = 0;
    this.totalObs2TerminadasTrim3 = 0;
    this.totalObs2TerminadasTrim4 = 0;

    this.datosGlobales = [];
    this.datosTrimestre = [];
    this.datosArea = [];
    this.areas = [];
  }

  // Función para establecer el conteo total de componentes y actividades
  async conteoElementos(areas: any[]): Promise<void> {
    const year = 2024;

    // Recorrer todas las áreas y obtener sus datos
    for (const element of areas) {
      const idArea = element.idArea;

      try {
        // Obtener los datos de los proyectos para el área actual usando lastValueFrom
        const datos = await lastValueFrom(this.datosProyecto.getDataProyects(idArea, year));

        let total = datos.length;

        this.datosArea.push({
          idArea: element.idArea,
          cUnidadOperativa: element.cUnidadOperante,
          totalIndicadores: total,
        });

        total = 0;

        // Obtener Logros de cada área para poder hacer un análisis
        const logros = await lastValueFrom(this.datosProyecto.getDataLogros(idArea));

        await this.analisisDatos(logros);

        // Recorrer los datos de cada área y hacer el conteo de actividades y componentes
        datos.forEach((element) => {
          switch (element.idNivelIndicador) {
            case 3:
              this.totalDeComponentes += 1;
              break;
            case 4:
              this.totalDeActividades += 1;
              break;
          }
        });
      } catch (error) {
        console.error(`Error al obtener datos para el área ${idArea}:`, error);
      }
    }
  }

  // Método para analizar los datos de logros
  async analisisDatos(logrosData: any[]): Promise<void> {
    logrosData.forEach((element) => {
      // Primer Trimestre
      if (element.idTrimestre === 1) {
        this.totalLogrosTrim1 += 1;
        if (element.causa != null) {
          this.totalCausaTerminadaTrim1 += 1;
        }
        if (element.efecto != null) {
          this.totalEfectoTerminadaTrim1 += 1;
        }
        if (element.evidencia != null) {
          this.totalEvidenciasTerminadasTrim1 += 1;
        }
        if (element.obs1 != null) {
          this.totalObs1TerminadasTrim1 += 1;
        }
        if (element.obs2 != null) {
          this.totalObs2TerminadasTrim1 += 1;
        }
      }

      // Segundo Trimestre
      else if (element.idTrimestre === 2) {
        this.totalLogrosTrim2 += 1;
        if (element.causa != null) {
          this.totalCausaTerminadaTrim2 += 1;
        }
        if (element.efecto != null) {
          this.totalEfectoTerminadaTrim2 += 1;
        }
        if (element.evidencia != null) {
          this.totalEvidenciasTerminadasTrim2 += 1;
        }
        if (element.obs1 != null) {
          this.totalObs1TerminadasTrim2 += 1;
        }
        if (element.obs2 != null) {
          this.totalObs2TerminadasTrim2 += 1;
        }
      }

      // Tercer Trimestre
      else if (element.idTrimestre === 3) {
        this.totalLogrosTrim3 += 1;
        if (!(element.causa === null)) {
          this.totalCausaTerminadaTrim3 += 1;
        }
        if (!(element.efecto != null)) {
          this.totalEfectoTerminadaTrim3 += 1;
        }
        if (!(element.evidencia != null)) {
          this.totalEvidenciasTerminadasTrim3 += 1;
        }
        if (element.obs1 != null) {
          this.totalObs1TerminadasTrim3 += 1;
        }
        if (element.obs2 != null) {
          this.totalObs2TerminadasTrim3 += 1;
        }
      }

      // Cuarto Trimestre
      else if (element.idTrimestre === 4) {
        this.totalLogrosTrim4 += 1;
        if (element.causa != null) {
          this.totalCausaTerminadaTrim4 += 1;
        }
        if (element.efecto != null) {
          this.totalEfectoTerminadaTrim4 += 1;
        }
        if (element.evidencia != null) {
          this.totalEvidenciasTerminadasTrim4 += 1;
        }
        if (element.obs1 != null) {
          this.totalObs1TerminadasTrim4 += 1;
        }
        if (element.obs2 != null) {
          this.totalObs2TerminadasTrim4 += 1;
        }
      }
    });
  }
}