import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../services/shared-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [
    CommonModule
  ]
})
export class CardComponent implements OnInit{
  constructor( private sharedData: SharedDataService){}

  mostrarCard: boolean = false;
  areasFinalizadas: number = 0;
  areasFaltantes: number = 0;
  componentesFinalizados: number = 0;
  actividadesFinalizadas: number = 0;

  tipoData: string = ''

  dataTotales: any [] = [];

  ngOnInit(): void {

    this.sharedData.arregloGlobal$.subscribe(data => {
      if(data.length > 0){
        this.tipoData = data[0].tipoData
      }
    });

    // Obtencion de datos totales de componentes
    this.sharedData.dataTotales$.subscribe(data => {
      if(data.length > 0 ){
        this.dataTotales = data;
        this.areasFinalizadas = this.dataTotales[0].totalAreasCulminadas;
        this.areasFaltantes = this.dataTotales[0].totalAreasFaltantes;
        this.componentesFinalizados = this.dataTotales[0].totalComponentesTerminados;
        this.actividadesFinalizadas = this.dataTotales[0].totalActividadesTerminados;
      }
    });
  }
}
