import {Component} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';

import {ModelMetaService,AutocompleteComponent,MapiEntityComponent,ModelType,TypeGraphComponent} from '../../shared/index';
import * as _ from 'lodash';


@Component({
  selector: 'mb-lookupgraph',
  templateUrl: 'app/+lookupgraph/components/lookupgraph.component.html',
  styleUrls: ['app/+lookupgraph/components/lookupgraph.component.css'],
  directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, AutocompleteComponent, TypeGraphComponent, MapiEntityComponent]
})
export class LookupGraphComponent {

  allTypes: Array<string>;
  typeMap: {[key: string]: ModelType};
  searchString = '';
  modelTypes: Array<ModelType> = [];

  constructor(modelMetaService: ModelMetaService) {
    modelMetaService.getFullTypeHierarchy().then((fullTypeHierarchy) => {
      this.typeMap = fullTypeHierarchy;
      this.allTypes = _.keys(fullTypeHierarchy);
    });
  }

  addTypeToCollection(modelType: ModelType) {
    if(modelType && !this.modelTypes.find((e) => e === modelType)) {
      this.modelTypes = this.modelTypes.slice();
      this.modelTypes.push(modelType);
    }
  }

  addModelType(newModelType: ModelType) {
    this.addTypeToCollection(newModelType);
    newModelType.ancestors.forEach((ancestor) => this.addTypeToCollection(ancestor));
    newModelType.properties.forEach((property) => {
      if(property.referencedType) {
        this.addTypeToCollection(property.referencedType);
      }
    });
  }

  lookupEntity(query: string) {
    let newModelType = this.typeMap[query];
    if(!query) {
      return;
    }
    this.searchString = '';
    this.addModelType(newModelType);
  }
}
