import { Component } from '@angular/core';
import { SharedDataService } from '../services/shared-data.service';

@Component({
  selector: 'app-aside-menu',
  standalone: true,
  imports: [],
  templateUrl: './aside-menu.component.html',
  styleUrls: ['./aside-menu.component.scss']
})
export class AsideMenuComponent {
  // Variables para controlar el estado del menú
  isAreasOpen: boolean = false;
  isSeguimientoOpen: boolean = false;

  constructor(private sharedData: SharedDataService) {}

  // Función para alternar el menú desplegable
  toggleDropdown(menu: string): void {
    if (menu === 'areas') {
      this.isAreasOpen = !this.isAreasOpen;
    } else if (menu === 'seguimiento') {
      this.isSeguimientoOpen = !this.isSeguimientoOpen;
    }
  }

  // Función para manejar la selección del trimestre
  selectedTrimestre(trimestre: number, tipoData: string): void {
    let dataShared: any[] = [];

    this.sharedData.arregloGlobal$.subscribe(response => {
      response.forEach(element => {
        dataShared.push({
          TotalAreas: element.TotalAreas,
          TotalActividades: element.TotalActividades,
          TotalComponentes: element.TotalComponentes,
          trimestre: trimestre,
          tipoData: tipoData
        });
      });
    });

    // Actualizar el arreglo global con el nuevo trimestre
    this.sharedData.setArregloGlobal(dataShared);
  }
}