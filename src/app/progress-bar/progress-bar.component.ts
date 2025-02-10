import { Component, OnInit } from '@angular/core';
import ApexCharts from 'apexcharts';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CardModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent implements OnInit {
  private options = {
    chart: {
      width:190,
      height:300,
      type: "radialBar"
    },
    
    series: [70], // Cambiado a 70 para que coincida con el valor que quieres mostrar
    
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: "70%"
        },
       
        dataLabels: {
          showOn: "always",
          name: {
            offsetY: -10,
            show: true,
            color: "#888",
            fontSize: "13px"
          },
          value: {
            color: "#111",
            fontSize: "15px",
            show: true,
            offsetY: -10, // Ajusta este valor para centrar el número
          }
        }
      }
    },
  
    stroke: {
      lineCap: "round",
    },
    labels: [" "]
  };




  ngOnInit(): void {

    const progress1 = new ApexCharts(document.querySelector("#chart-progress1"), this.options);
    progress1.render()

    const progress2 = new ApexCharts(document.querySelector("#chart-progress2"), this.options);
    progress2.render()
  }

}
