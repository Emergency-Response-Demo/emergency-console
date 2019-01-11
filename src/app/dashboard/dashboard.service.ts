import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public reload$: Subject<String>;

  refresh() {
    this.reload$.next('reload');
  }

  constructor() {
    this.reload$ = new Subject();
  }
}
