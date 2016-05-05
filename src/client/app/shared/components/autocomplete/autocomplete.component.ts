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

  highlightedIndex = 0;

  @Input() placeholder = 'query';
  @Input('options') allOptions: string[] = [];
  @Input() value: string;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  filter() {
    if(this.value) {
      let camelcaseMatcher = this.value.split("").join("[a-z]*");
      let regex = new RegExp(camelcaseMatcher, "gi");
      this.filteredList = this.allOptions.filter((option) => option.search(regex) > -1);
    } else {
      this.filteredList = [];
    }
    this.optionsShown = this.filteredList.length > 0;
    this.valueChange.emit(this.value);
  }

  setNewValue(value: string) {
    this.value = value;
    this.valueChange.emit(this.value);
  }

  dismissSuggestions() {
    this.optionsShown = false;
  }

  select(item: string) {
    this.setNewValue(item);
    this.dismissSuggestions();
  }

  onKeydown(event: any) {
    if(event.code === "ArrowUp") {
      this.highlightedIndex--;
    } else if(event.code === "ArrowDown") {
      this.highlightedIndex++;
    } else if(event.code === "Enter" &&
      this.filteredList.length > this.highlightedIndex &&
      this.optionsShown) {
      this.setNewValue(this.filteredList[this.highlightedIndex]);
      this.dismissSuggestions();
    } else {
      return;
    }

    console.debug("event", event);
    if(this.highlightedIndex < 0) {
      this.highlightedIndex = this.filteredList.length + this.highlightedIndex;
    } else if(this.highlightedIndex >= this.filteredList.length) {
      this.highlightedIndex = this.highlightedIndex - this.filteredList.length;
    }
    event.preventDefault();
    //event.stopImmediatePropagation();
    //event.stopPropagation();
  }
}
