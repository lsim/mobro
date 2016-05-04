import {Component,Input,Output,EventEmitter} from 'angular2/core';
import {CORE_DIRECTIVES,FORM_DIRECTIVES} from "angular2/common";

@Component({
  selector: 'autocomplete',
  templateUrl: 'app/shared/components/autocomplete/autocomplete.component.html',
  styleUrls: ['app/shared/components/autocomplete/autocomplete.component.css'],
  directives: [CORE_DIRECTIVES,FORM_DIRECTIVES]
})
export class AutocompleteComponent {
  filteredList: string[] = [];
  optionsShown = false;

  @Input() placeholder = 'query';
  @Input('options') allOptions: string[] = [];
  @Input() value: string;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  filter() {
    if(this.value) {
      let regex = new RegExp(this.value, "gi");
      this.filteredList = this.allOptions.filter((option) => option.search(regex) > -1);
    } else {
      this.filteredList = [];
    }
    this.optionsShown = this.filteredList.length > 0;
    this.valueChanged.emit(this.value);
  }

  setNewValue(value: string) {
    this.value = value;
    this.valueChanged.emit(this.value);
  }

  dismissSuggestions() {
    this.optionsShown = false;
  }

  select(item: string) {
    this.setNewValue(item);
    this.dismissSuggestions();
  }
}
