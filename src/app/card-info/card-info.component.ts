import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../services/shared-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-info',
  standalone: true,
  templateUrl: './card-info.component.html',
  styleUrl: './card-info.component.scss'
})
export class CardInfoComponent implements OnInit {
  totalComponentes: number = 0;
  totalActividades: number = 0;
  totalAreas: number = 0;
  trimestreActual: number = 0;
  
  datosCargados: boolean = false; // Bandera para indicar que los datos están listos
  private dataSubscription: Subscription | undefined;

  constructor(private sharedData: SharedDataService) {}

  ngOnInit(): void {
    this.dataSubscription = this.sharedData.arregloGlobal$.subscribe(response => {
      if (response.length > 0) {
        this.datosCargados = false; // Iniciar la carga progresiva

        setTimeout(() => {
          this.asignarValores(response);
          this.datosCargados = true; // Activar bandera cuando termine la carga
        }, 500); // Simulación de carga progresiva
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
  }

  private asignarValores(data: any[]): void {
    const element = data[0]; // Tomar el primer elemento, ya que siempre es un array de un solo objeto
    this.totalComponentes = element.TotalComponentes;
    this.totalActividades = element.TotalActividades;
    this.totalAreas = element.TotalAreas;
    this.trimestreActual = element.trimestre;
  }
}
