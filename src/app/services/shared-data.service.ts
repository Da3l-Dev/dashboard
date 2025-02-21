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

  // Arreglo compartido de los datos de cada Area
  private ArregloDataArea = new BehaviorSubject<any[]>([]);
  arregloDataArea$ = this.ArregloDataArea.asObservable();


  private DataTotales = new BehaviorSubject<any[]>([]);
  dataTotales$ = this.DataTotales.asObservable();

  

  private areasDatosTrim = new BehaviorSubject<any[]>([]);
  areasDatosTrim$ = this.areasDatosTrim.asObservable();

  setArregloAreas(data: any[]): void{
    this.ArregloAreas.next(data);
  }

  setArregloGlobal(data: any[]): void{
    this.ArregloGlobal.next(data);
  }

  setArregloDataAreas(data: any[]): void{
    this.ArregloDataArea.next(data);
  }

  setDataTotales(data: any[]): void{
    this.DataTotales.next(data);
  }

  setDatosTrim(data: any[]): void{
    this.areasDatosTrim.next(data);
  }
}
