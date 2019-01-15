import { Component, OnInit, Input } from '@angular/core';
import { Color } from 'ng2-charts';
import { ChartsService } from './charts.service';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit {
  @Input()
  reload$: Subject<string>;

  labels: string[];
  data: number[];
  colors: Color[];
  type: string;
  options: any;
  total = 0;
  active = 0;
  idle = 0;

  constructor(private chartsService: ChartsService) {
    this.reload$ = new Subject();
    this.data = new Array();
    this.type = 'doughnut';

    // colors pulled from https://coreui.io/docs/getting-started/ui-kit/
    this.colors = [{ backgroundColor: ['#4dbd74', '#20a8d8'] }];
    this.labels = ['Active', 'Idle'];
  }

  load(): void {
    this.chartsService.getStatus().subscribe(res => {
      this.active = res.active;
      this.total = res.total;
      this.idle = this.total - this.active;
      this.data = [this.active, this.idle];
    });
  }

  ngOnInit() {
    this.load();

    this.reload$.subscribe(res => {
      this.load();
    });
  }
}
