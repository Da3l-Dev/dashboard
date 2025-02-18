import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../services/shared-data.service';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit{
  constructor( private sharedData: SharedDataService){}

  areasFinalizadas: number = 0;
  areasFaltantes: number = 0;

  dataTotales: any [] = [];

  ngOnInit(): void {
    this.sharedData.dataTotales$.subscribe(data => {
      if(data.length > 0 ){
        this.dataTotales = data;

        this.areasFinalizadas = this.dataTotales[0].totalAreasCulminadas;
        this.areasFaltantes = this.dataTotales[0].totalAreasFaltantes;
      }
    });
  }
}
