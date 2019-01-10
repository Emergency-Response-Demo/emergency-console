import { Component, OnInit } from '@angular/core';
import { Color } from 'ng2-charts';
import { ChartsService } from './charts.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit {
  doughnutChartLabels: string[] = ['Active', 'Idle'];
  doughnutChartData: number[] = [];
  doughnutChartColors: Color[] = [{ backgroundColor: ['#20c997', '#20a8d8'] }];
  doughnutChartType = 'doughnut';

  constructor(private chartsService: ChartsService) {}

  ngOnInit() {
    this.chartsService.getStatus().subscribe(res => {
      this.doughnutChartData = [res.active, res.idle];
    });
  }
}
