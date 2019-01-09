import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MessageService } from '../message/message.service';
import { CarService } from './car.service';
import { Car } from './car';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { IconDefinition, faSync, faEraser, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  @ViewChild('editTemplate')
  editTemplate: TemplateRef<any>;

  @ViewChild('deleteTemplate')
  deleteTemplate: TemplateRef<any>;

  dtOptions: any;
  cars: Car[];
  selectedCar: Car;
  dtTrigger: Subject<any>;
  modalRef: BsModalRef;
  refreshIcon: IconDefinition;
  clearIcon: IconDefinition;
  deleteIcon: IconDefinition;
  addIcon: IconDefinition;
  years: string[];

  constructor(private messageService: MessageService, private carService: CarService, private modalService: BsModalService) {
    this.dtOptions = {};
    this.cars = new Array();
    this.dtTrigger = new Subject();
    this.refreshIcon = faSync;
    this.clearIcon = faEraser;
    this.addIcon = faPlusCircle;
    this.deleteIcon = faTrash;

    const year: number = new Date().getFullYear();
    const range = [];
    range.push(year.toString());

    for (let i = 1; i < 30; i++) {
      range.push((year - i).toString());
    }
    this.years = range;
  }

  load(): void {
    this.carService.getCars().subscribe(res => {
      this.cars = res;
      this.rerender();

      if (this.cars != null) {
        this.messageService.success(`Successfully loaded ${this.cars.length} car from service`);
      }
    });
  }

  rerender(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();

        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
    } else {
      this.dtTrigger.next();
    }
  }

  clear(): void {
    this.cars = [];
    this.rerender();
    this.messageService.info('Cleared data');
  }

  add(): void {
    this.selectedCar = new Car();
    this.modalRef = this.modalService.show(this.editTemplate);
  }

  edit(car: Car): void {
    this.selectedCar = car;
    this.modalRef = this.modalService.show(this.editTemplate);
  }

  warning(car: Car) {
    this.selectedCar = car;
    this.modalRef = this.modalService.show(this.deleteTemplate);
  }

  saveOrUpdate(): void {
    if (this.selectedCar.id != null) {
      this.carService.updateCar(this.selectedCar).subscribe(res => {
        if (res != null) {
          this.messageService.success(`Successfully updated Car with ID ${res.id}`);
          this.load();
        }
      });
    } else {
      this.carService.saveCar(this.selectedCar).subscribe(res => {
        if (res != null) {
          this.messageService.success(`Successfully added new Car with ID ${res.id}`);
          this.load();
        }
      });
    }
    this.dismiss();
  }

  delete(id: number): void {
    this.carService.deleteCar(id).subscribe(_ => {
      this.messageService.success(`Successfully deleted Car`);
      this.load();
    });
    this.dismiss();
  }

  dismiss(): void {
    this.modalRef.hide();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'simple',
      responsive: true,
      pageLength: 10,
      language: {
        lengthMenu:
          'Display \
        <select class="custom-select"> \
          <option value="10">10</option> \
          <option value="30">30</option> \
          <option value="-1">All</option> \
        </select>'
      }
    };
  }

  ngAfterViewInit() {
    this.rerender();
  }
}
