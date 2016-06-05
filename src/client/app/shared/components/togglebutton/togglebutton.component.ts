import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {CORE_DIRECTIVES,FORM_DIRECTIVES} from 'angular2/common';

@Component({
  selector: 'togglebutton',
  templateUrl: 'app/shared/components/togglebutton/togglebutton.component.html',
  styleUrls: ['app/shared/components/togglebutton/togglebutton.component.css'],
  directives: [CORE_DIRECTIVES,FORM_DIRECTIVES]
})

export class ToggleButtonComponent {
  randomId: string = '' + Math.random();
  @Input() textOn: string = 'On';
  @Input() textOff: string = 'Off';
  @Input() checkedState: boolean = false;

  @Output() checkedStateChange = new EventEmitter<boolean>();

  onStateChange(newState: boolean) {
    this.checkedState = newState;
    this.checkedStateChange.emit(newState);
  }
}
