import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }

  // Arreglo compartido de las areas
  private ArregloAreas = new BehaviorSubject<any[]>([]);
  arregloAreas$ = this.ArregloAreas.asObservable();


  // Arreglo compartido para datos generales
  private ArregloGlobal = new BehaviorSubject<any[]>([]);
  arregloGlobal$ = this.ArregloGlobal.asObservable();


  setArregloAreas(data: any[]){
    this.ArregloAreas.next(data);
  }

  setArregloGlobal(data: any[]){
    this.ArregloGlobal.next(data);
  }

}
