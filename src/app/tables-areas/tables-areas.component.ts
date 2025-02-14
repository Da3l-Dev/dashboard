import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ObtenerdatosService } from '../services/obtenerdatos.service';
import { response } from 'express';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Tag } from 'primeng/tag';
import { SharedDataService } from '../services/shared-data.service';
import { elementAt } from 'rxjs';
import { log } from 'console';


@Component({
  selector: 'app-tables-areas',
  imports: [TableModule,
    HttpClientModule,
    Tag,
  ],
  standalone: true,
  templateUrl: './tables-areas.component.html',
  styleUrl: './tables-areas.component.scss'
})

export class TablesAreasComponent implements OnInit{
  datos: any[] = [];
  logros: any[] = [];
  resultados: any[] = [];
  totales: any[] =[];


  total: number = 0;
  constructor (
    private dataService: ObtenerdatosService,
    private sharedData: SharedDataService
  ){}
  async ngOnInit(): Promise<void> {
    try{
      await this.obtenerDatos();
      await this.conteoLogros(this.datos);

      console.log(this.total);
    }catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  async obtenerDatos(): Promise<void>{
    this.sharedData.arregloAreas$.subscribe(async data => {
      this.datos = data;
    })
  }

  async conteoLogros(logro: any): Promise<void>{ 
    
    this.datos.forEach(element => {
      this.dataService.getDataLogros(element.idArea).subscribe(data => {
        this.logros = data;

        this.resultados = this.logros.filter(element => element.idTrimestre === 1);


        this.resultados.forEach(element => {
          if(element.causa != null){
            this.total += 1;
          }
        });

      });
    });
  }
}
