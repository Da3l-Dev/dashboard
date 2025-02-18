import { Component } from '@angular/core';
import { SharedDataService } from '../services/shared-data.service';
import { response } from 'express';
import { share } from 'rxjs';

@Component({
  selector: 'app-aside-menu',
  imports: [],
  standalone:true,
  templateUrl: './aside-menu.component.html',
  styleUrl: './aside-menu.component.scss'
})
export class AsideMenuComponent {
  constructor(private sharedData: SharedDataService) {}
  data: any[] = [];

  selectedTrimestre(trimestre: number): void {
    let dataShared: any[] = [];

    this.sharedData.arregloGlobal$.subscribe(response => {
      this.data = response;

      this.data.forEach(element => {
        dataShared.push({
          TotalAreas: element.TotalAreas,
          TotalActividades: element.TotalActividades,
          TotalComponentes: element.TotalComponentes,
          trimestre: trimestre,
        });
      });
    });

    // Actualizar el arreglo global con el nuevo trimestre
    this.sharedData.setArregloGlobal(dataShared);
  }
}