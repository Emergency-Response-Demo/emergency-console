import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { Shelter } from '../models/shelter';

@Injectable({
  providedIn: 'root'
})
export class ShelterService {

    private url = 'assets/data/shelters.json';

    getShelters(): Observable<Shelter[]> {
      return this.http.get<Shelter[]>(this.url).pipe(
        catchError(res => this.handleError('getShelters()', res))
      );
    }

    private handleError(method: string, res: HttpErrorResponse): Observable<any> {
      this.messageService.error(`${method} ${res.message}`);
      console.error(res.error);
      return of(null);
    }

    constructor(private messageService: MessageService, private http: HttpClient) { }
}
