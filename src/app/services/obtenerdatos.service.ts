import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, ObservedValueOf } from 'rxjs';
import { environment } from '../../environment';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class ObtenerdatosService {

  private baseUrl = environment.apiUrl + '/admin';
  private baseUrlProyect = environment.apiUrl + '/proyecto'

  constructor(
    private http: HttpClient
  ) { }

  getAllAreas(): Observable<any[]>{
    return this.http.get<any>(`${this.baseUrl}/obtenerAreas`).pipe(
      map(response => Array.isArray(response) ? response: response.data || [])
    )
  }

    // Método para obtener los datos del proyecto
    getDataProyects(idArea: number, year: number): Observable<any[]> {
      const params = new HttpParams()
        .set('idArea', idArea.toString())
        .set('Year', year.toString());
      return this.http.get<any>(`${this.baseUrlProyect}/datos`, { params }).pipe(
        map(response => Array.isArray(response) ? response : response.data || [])
      );
    }


    getDataLogros(idArea: number): Observable<any[]>{
      const params = new HttpParams()
      .set('idArea', idArea.toString());

      return this.http.get<any>(`${this.baseUrl}/obtenerLogro`, {params}).pipe(
        map(response => Array.isArray(response) ? response: response.data || [])
      );
    }

    getDataSeguimiento(idArea: number, year: number): Observable<any[]>{
      const params = new HttpParams()
        .set('idArea', idArea.toString())
        .set('year', year.toString());

      return this.http.get<any>(`${this.baseUrl}/obtenerDataSeguimiento`,{params}).pipe(
        map(response => Array.isArray(response) ? response : response.data || [])
      );
    }
}
