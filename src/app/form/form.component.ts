import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message/message.service';
import { User } from './user';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  model: User;

  constructor(private messageService: MessageService) {
    this.model = new User();
  }

  submit() {
    this.messageService.success(
      `Submitted lastName: ${this.model.lastName}, firstName: ${this.model.firstName}, Group: ${this.model.group}`
    );
  }

  clear() {
    this.model = new User();
    this.messageService.info('Cleared form');
  }

  ngOnInit() {}
}
