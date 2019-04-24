import { Component, OnInit, Input } from '@angular/core';
import { Color } from 'ng2-charts';
import { ResponderStatus } from '../models/responder-status';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit {
  @Input() status: ResponderStatus;

  labels: string[] = ['Active', 'Idle'];
  data: number[] = new Array();

  // colors pulled from https://coreui.io/docs/getting-started/ui-kit/
  colors: Color[] = [{ backgroundColor: ['#4dbd74', '#20a8d8'] }];
  type = 'doughnut';

  constructor() { }

  ngOnInit() { }
}
