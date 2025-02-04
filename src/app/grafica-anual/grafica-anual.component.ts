import { Component, OnInit } from '@angular/core';
import ApexCharts from 'apexcharts';


@Component({
  selector: 'app-grafica-anual',
  standalone:true,
  templateUrl: './grafica-anual.component.html',
  styleUrl: './grafica-anual.component.scss'
})
export class GraficaAnualComponent implements OnInit {
  private options = {
    series: [{
    name: 'series1',
    data: [31, 40, 28, 51, 42, 109, 100]
  }, {
    name: 'series2',
    data: [11, 32, 45, 32, 34, 52, 41]
  }],
    chart: {
    type: 'area'
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  xaxis: {
    type: 'datetime',
    categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
  },
  tooltip: {
    x: {
      format: 'dd/MM/yy HH:mm'
    },
  },
  };

  ngOnInit(): void {
    const chart = new ApexCharts(document.querySelector("#grafica-anual"), this.options);
    chart.render();
  }

}
