import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit {
  readonly YELLOW = '#ffc107';
  readonly BLUE = '#20a8d8';

  @Input()
  bottom: string;

  constructor() { }

  ngOnInit() {
  }

}
