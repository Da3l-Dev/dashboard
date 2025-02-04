import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardComponent } from "./card/card.component";
import {StyleClassModule} from 'primeng/styleclass';
import { ChartbarComponent } from './chartbar/chartbar.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { TablesAreasComponent } from './tables-areas/tables-areas.component';
import { AsideMenuComponent } from './aside-menu/aside-menu.component';
import { GraficaAnualComponent } from './grafica-anual/grafica-anual.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, 
    CardComponent,
    ProgressBarComponent,
    TablesAreasComponent,
    AsideMenuComponent,
    GraficaAnualComponent,
    StyleClassModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dashboard';
}
