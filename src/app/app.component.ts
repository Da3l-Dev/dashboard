import { Component, OnInit } from '@angular/core';
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
import { lastValueFrom } from 'rxjs'; // Importa lastValueFrom
import { log } from 'console';

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
export class AppComponent implements OnInit {
  constructor(
    private datosProyecto: ObtenerdatosService,
    private sharedData: SharedDataService,
  ) {}

  totalDeComponentes: number = 0;
  totalDeActividades: number = 0;

  // Total de logros por trimestre
  totalLogrosTrim1: number = 0;
  totalLogrosTrim2: number = 0;
  totalLogrosTrim3: number = 0;
  totalLogrosTrim4: number = 0;

  // Total de Causas Terminadas 
  totalCausaTerminadaTrim1: number = 0;
  totalCausaTerminadaTrim2: number = 0;
  totalCausaTerminadaTrim3: number = 0;
  totalCausaTerminadaTrim4: number = 0;

  datosGlobales: any[] = [];
  datosTrimestre: any[] = [];
  areas: any[] = [];

  // Método inicial para obtener los datos
  async ngOnInit(): Promise<void> {
    try {
      // Obtener las áreas usando lastValueFrom
      this.areas = await lastValueFrom(this.datosProyecto.getAllAreas());


      // Realizar el conteo de componentes y actividades
      await this.conteoElementos(this.areas);

      // Ingresar el conteo de todos los elementos a un arreglo para datos globales
      this.datosGlobales.push({
        TotalComponentes: this.totalDeComponentes,
        TotalActividades: this.totalDeActividades
      }
      );


      this.datosTrimestre.push({
        trimestre: 1,
        totalLogros: this.totalLogrosTrim1,
        totalCuasaTrim1: this.totalCausaTerminadaTrim1,
      },
      {
        trimestre: 2,
        totalLogros: this.totalLogrosTrim2,
        totalCuasaTrim1: this.totalCausaTerminadaTrim2,
      },
      {
        trimestre: 3,
        totalLogros: this.totalLogrosTrim3,
        totalCuasaTrim1: this.totalCausaTerminadaTrim3,
      },
      {
        trimestre: 4,
        totalLogros: this.totalLogrosTrim4,
        totalCuasaTrim1: this.totalCausaTerminadaTrim4,
      },
  
    )

      console.log(this.datosTrimestre);
      // Compartir los datos a los componentes de angular
      this.sharedData.setArregloGlobal(this.datosGlobales);
      this.sharedData.setArregloAreas(this.areas);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
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


        // Obtener Logros de cada area para poder hacer un analisis
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


  // Metodo para sacar todo los datos requeridos en 

  async analisisDatos(logrosData: any[]): Promise<void>{
    logrosData.forEach(element => {
      if(element.idTrimestre === 1){
        this.totalLogrosTrim1 += 1;
        if(element.causa != null){
          this.totalCausaTerminadaTrim1 += 1;
        }
      }
      else if(element.idTrimestre === 2){
        this.totalLogrosTrim2 += 1;
        if(element.causa != null){
          this.totalCausaTerminadaTrim2 += 1;
        }
      }
      else if(element.idTrimestre === 3){
        this.totalLogrosTrim3 += 1;
        if(element.causa != null){
          this.totalCausaTerminadaTrim3 += 1;
        }
      }
      else if(element.idTrimestre === 4){
        this.totalLogrosTrim4 += 1;
        if(element.causa != null){
          this.totalCausaTerminadaTrim4 += 1;
        }
      }
    });
  }
}