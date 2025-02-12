import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ObtenerdatosService } from '../services/obtenerdatos.service';
import { response } from 'express';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Tag } from 'primeng/tag';
import { SharedDataService } from '../services/shared-data.service';


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

  constructor (
    private dataService: ObtenerdatosService,
    private sharedData: SharedDataService
  ){}
  ngOnInit(): void {
    this.sharedData.arregloAreas$.subscribe(data => {
      this.datos = data;
    })
  }

}
