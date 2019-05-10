import { Component, OnInit } from '@angular/core';
import { Incident } from '../models/incident';
import { IncidentService } from '../services/incident.service';
import { FormControl } from '@angular/forms';
import { AppUtil } from '../app-util';


@Component({
  selector: 'app-incident-dashboard',
  templateUrl: './incident-dashboard.component.html'
})
export class IncidentDashboardComponent implements OnInit {
  incidents: Incident[] = [];
  filter = new FormControl('');
  page = 1;
  pageSize = 10;
  isMobile = AppUtil.isMobile();

  constructor(private incidentService: IncidentService) {}

  get currentPageIncidents(): Incident[] {
    return this.filteredIncidents
      .map((country, i) => ({id: i + 1, ...country}))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  get filteredIncidents(): Incident[] {
    return this.filterIncidents(this.filter.value);
  }

  filterIncidents(text: string): Incident[] {
    if (!text) {
      return this.incidents;
    }
    const lowerText = text.toLowerCase();
    return this.incidents.filter(incident => {
      return incident.id.toLowerCase().includes(lowerText) ||
      incident.victimName.toLowerCase().includes(lowerText) ||
      incident.victimPhoneNumber.toLowerCase().includes(lowerText) ||
      incident.status.toLowerCase().includes(lowerText);
    });
  }

  ngOnInit() {
    this.incidentService.getAll().then((incidents: Incident[]) => {
      this.incidents = incidents;
    });
    this.filter.valueChanges.subscribe(this.filterIncidents.bind(this));
  }
}
