import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../services/shared-data.service';
import { response } from 'express';

@Component({
  selector: 'app-card-info',
  standalone: true,
  templateUrl: './card-info.component.html',
  styleUrl: './card-info.component.scss'
})
export class CardInfoComponent implements OnInit{
  totalComponentes: number = 0;
  totalActividades: number = 0;

  datos: any[] = [];

  constructor(
    private sharedData : SharedDataService
  ){}

  ngOnInit(): void {
    this.sharedData.arregloGlobal$.subscribe(response => {
      this.datos = response;
      this.asignarValor(this.datos);
    });
  }


  asignarValor(data: any []): void{
    data.forEach(element => {
      this.totalComponentes = element.TotalComponentes;
      this.totalActividades = element.TotalActividades;
      
    })
  }

  
}
