import {Component} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';

import {ModelMetaService,AutocompleteComponent,MapiEntityComponent,ModelType} from '../../shared/index';
import * as _ from 'lodash';

@Component({
  selector: 'mb-lookup',
  templateUrl: 'app/+lookup/components/lookup.component.html',
  styleUrls: ['app/+lookup/components/lookup.component.css'],
  directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, AutocompleteComponent, MapiEntityComponent]
})
export class LookupComponent {

  allTypes: Array<string>;
  typeMap: {[key: string]: ModelType};
  searchString = '';
  modelTypes: Array<ModelType> = [];

  constructor(public modelMetaService: ModelMetaService) {
    //modelMetaService.getTypes().then(types => this.allTypes = types);
    modelMetaService.getFullTypeHierarchy().then((fullTypeHierarchy) => {
      this.typeMap = fullTypeHierarchy;
      this.allTypes = _.keys(fullTypeHierarchy);
    });
  }

  addModelType(newModelType: ModelType) {
    if(newModelType && !this.modelTypes.find((e) => e === newModelType)) {
      this.modelTypes.push(newModelType);
    }

  }

  lookupEntity(query: string) {
    let newModelType = this.typeMap[query];
    if(!query) {
      return;
    }
    this.searchString = '';
    this.addModelType(newModelType);
  }

  removeEntity(index: number) {
    this.modelTypes.splice(index, 1);
  }
}
