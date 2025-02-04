import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-tables-areas',
  imports: [TableModule],
  standalone: true,
  templateUrl: './tables-areas.component.html',
  styleUrl: './tables-areas.component.scss'
})
export class TablesAreasComponent {

  data = [
    {
      unidadOperativa: 'Direccion General de Educacion Especial',
      indicadoresFinalizados: 10,
      indicadoresFaltantes: 20,
      totalAvance: '10%'
    },
    {
      unidadOperativa: 'Direccion General de Educacion Especial',
      indicadoresFinalizados: 10,
      indicadoresFaltantes: 20,
      totalAvance: '10%'
    },
    {
      unidadOperativa: 'Direccion General de Educacion Especial',
      indicadoresFinalizados: 10,
      indicadoresFaltantes: 20,
      totalAvance: '10%'
    },
    {
      unidadOperativa: 'Direccion General de Educacion Especial',
      indicadoresFinalizados: 10,
      indicadoresFaltantes: 20,
      totalAvance: '10%'
    },
    {
      unidadOperativa: 'Direccion General de Educacion Especial',
      indicadoresFinalizados: 10,
      indicadoresFaltantes: 20,
      totalAvance: '10%'
    },
    // puedes agregar más filas aquí
  ];
}
