import {Component,Input,Output,EventEmitter} from 'angular2/core';
import {CORE_DIRECTIVES,FORM_DIRECTIVES} from 'angular2/common';

@Component({
  selector: 'autocomplete',
  templateUrl: 'app/shared/components/autocomplete/autocomplete.component.html',
  styleUrls: ['app/shared/components/autocomplete/autocomplete.component.css'],
  directives: [CORE_DIRECTIVES,FORM_DIRECTIVES]
})

export class AutocompleteComponent {
  filteredList: string[] = [];
  suggestionsShown = false;

  highlightedIndex = 0;

  @Input() placeholder = 'query';
  @Input() options: string[] = [];
  @Input() value: string;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  escapeRegexChars(str: string): string {
    return str.replace(/\.|\*|\+|\?|\\|\^|\$|\(|\)|\[|\]|\{|\}/g, (regexChar: string) => '\\' + regexChar);
  }

  updateSuggestions() {
    if(this.value) {
      let camelcaseMatcher = this.value
        .split('')
        .map((x:string) => this.escapeRegexChars(x))
        .join('[a-z]*');
      let regex = new RegExp(camelcaseMatcher);

      this.filteredList = this.options
        .map(o => <Relevancy>{option: o, search: o.search(regex)}) // add relevancy
        .filter((r) => r.search > -1) // filter out irrelevant
        .sort((r1,r2) => { return r1.search - r2.search; }) // sort by relevancy
        .map((r) => r.option); // remove relevancy

    } else {
      this.filteredList = [];
    }
    this.suggestionsShown = this.filteredList.length > 0;
    this.highlightedIndex = 0;
    this.valueChange.emit(this.value);
  }

  setNewValue(value: string) {
    this.value = value;
    this.valueChange.emit(this.value);
  }

  dismissSuggestions() {
    this.suggestionsShown = false;
  }

  select(item: string) {
    this.setNewValue(item);
    this.dismissSuggestions();
  }

  onKeydown(event: any) {
    if(event.code === 'ArrowUp') {
      this.highlightedIndex--;
    } else if(event.code === 'ArrowDown') {
      this.highlightedIndex++;
    } else if(event.code === 'Enter' &&
      this.filteredList.length > this.highlightedIndex &&
      this.suggestionsShown) {
      this.setNewValue(this.filteredList[this.highlightedIndex]);
      this.dismissSuggestions();
    } else {
      return;
    }

    if(this.highlightedIndex < 0) {
      this.highlightedIndex = this.filteredList.length + this.highlightedIndex;
    } else if(this.highlightedIndex >= this.filteredList.length) {
      this.highlightedIndex = this.highlightedIndex - this.filteredList.length;
    }
    event.preventDefault();
  }
}
interface Relevancy {
  option: string;
  search: number;
}
