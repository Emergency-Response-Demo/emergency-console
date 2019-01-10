import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng } from 'leaflet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  options = {
    layers: [tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })],
    zoom: 5,
    center: latLng(46.879966, -121.726909)
  };

  onMapReady(map: L.Map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }

  constructor() {}

  ngOnInit() {}
}
