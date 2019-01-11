import { Component, OnInit } from '@angular/core';
import { Color } from 'ng2-charts';
import { ChartsService } from './charts.service';
import { DashboardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit {
  doughnutChartLabels: string[] = ['Active', 'Idle'];
  doughnutChartData: number[] = [];
  doughnutChartColors: Color[] = [{ backgroundColor: ['#20c997', '#20a8d8'] }];
  doughnutChartType = 'doughnut';

  constructor(private chartsService: ChartsService, private dashboardService: DashboardService) {
    this.dashboardService.reload$.subscribe(res => {
      console.log(`Chart component ${res}`);
      this.load();
    });
  }

  load(): void {
    this.chartsService.getStatus().subscribe(res => {
      const active: number = res.active;
      const idle: number = res.total - active;
      this.doughnutChartData = [active, idle];
    });
  }

  ngOnInit() {
    this.load();
  }
}
