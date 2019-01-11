import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message/message.service';
import { IconDefinition, faSync } from '@fortawesome/free-solid-svg-icons';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  refreshIcon: IconDefinition;

  constructor(private messageService: MessageService, private dashboardService: DashboardService) {
    this.refreshIcon = faSync;
  }

  refresh() {
    this.messageService.info('Reloading data');
    this.dashboardService.refresh();
  }

  ngOnInit() {}
}
