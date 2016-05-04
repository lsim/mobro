import {Component} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';

import {ModelMetaService,AutocompleteComponent} from '../../shared/index';

@Component({
  selector: 'mb-home',
  templateUrl: 'app/+home/components/home.component.html',
  styleUrls: ['app/+home/components/home.component.css'],
  directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, AutocompleteComponent]
})
export class HomeComponent {

  allTypes: string[];

  searchString = "";

  entities: FapiEntity[] = [];

  constructor(public modelMetaService: ModelMetaService) {
    modelMetaService.getTypes().then(types => this.allTypes = types);
  }

  searchStringChanged(event: any) {
    //TODO: double binding should leave this method redundant!
    this.searchString = event;
  }

  lookupEntity() {
    let query = this.searchString;
    if(this.entities.find((e) => e.name === query)) {
      return;
    }
    this.searchString = "";
    Observable.forkJoin(
      this.modelMetaService.getSubtypesOfType(query),
      this.modelMetaService.getEntityInfo(query)
    ).subscribe(([subtypes, entityInfo]) => {
      this.entities.push(new FapiEntity(query, subtypes, entityInfo));
    });
  }
}

class FapiEntity {

  infoJson: string;

  constructor(public name: string, public subtypes: string[], public entityInfo: any) {
    this.infoJson = JSON.stringify(entityInfo);
  }
}
