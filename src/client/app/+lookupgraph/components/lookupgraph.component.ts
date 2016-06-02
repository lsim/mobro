import {Component} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';

import {
  ModelMetaService,
  AutocompleteComponent,
  MapiEntityComponent,
  ModelType,
  TypeGraphComponent,
  ToggleButtonComponent} from '../../shared/index';
import * as _ from 'lodash';


@Component({
  selector: 'mb-lookupgraph',
  templateUrl: 'app/+lookupgraph/components/lookupgraph.component.html',
  styleUrls: ['app/+lookupgraph/components/lookupgraph.component.css'],
  directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, AutocompleteComponent, TypeGraphComponent, MapiEntityComponent, ToggleButtonComponent]
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

  addTypeByName(name: string): ModelType {
    console.debug('addTypeByName', name);
    const newModelType = this.typeMap[name];
    if(newModelType) {
      this.addTypeToCollection(newModelType);
    }
    return newModelType;
  }

  addTypeToCollection(modelType: ModelType) {
    if(modelType && this.modelTypes.indexOf(modelType) < 0) {
      this.modelTypes.push(modelType);
      this.modelTypes = this.modelTypes.slice(); // Force angular to detect the change to the array
    }
  }

  toggleTypeInCollection(modelType: ModelType) {
    const index = this.modelTypes.indexOf(modelType);
    if(index >= 0) {
      this.modelTypes.splice(index, 1);
    } else {
      this.modelTypes.push(modelType);
    }
    this.modelTypes = this.modelTypes.slice();
  }

  lookupEntity(query: string) {
    if(this.addTypeByName(query)) {
      this.searchString = '';
    }
  }

  modelTypeClicked({ modelType: modelType, event: event }: {modelType: ModelType, event: MouseEvent}) {
    if(event.detail === 2) { // double click
      this.toggleTypeInCollection(modelType);
    }
    console.debug('modelTypeClicked', modelType, event);
  }
}
