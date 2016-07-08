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
  allProperties: Array<string>;
  typeMap: {[key: string]: ModelType};
  typeSearchString = '';
  propSearchString = '';
  modelTypes: Array<ModelType> = [];

  constructor(modelMetaService: ModelMetaService) {
    modelMetaService.getFullTypeHierarchy().then((fullTypeHierarchy) => {
      this.typeMap = fullTypeHierarchy;
      this.allTypes = _.keys(fullTypeHierarchy);
      this.allProperties = this.getAllProperties(fullTypeHierarchy);
    });
  }

  getAllProperties(typeMap: {[key: string]: ModelType}): Array<string> {
    let result: Array<string> = [];
    _.values(typeMap).forEach((type: ModelType) => {
      result = result.concat(type.properties.map((p) => `${type.name}.${p.name}`));
    });
    result.sort();
    return result;
  }

  addTypeByName(name: string): ModelType {
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

  lookupEntity() {
    console.debug(this.typeSearchString, this.propSearchString);
    if(this.typeSearchString) {
      if(this.addTypeByName(this.typeSearchString)) {
        this.typeSearchString = '';
      }
    } else if(this.propSearchString) {
      let typeNameMatch = this.propSearchString.match(/^[^\.]+/);
      if(typeNameMatch && this.addTypeByName(typeNameMatch[0])) {
        this.propSearchString = '';
      }
    }
  }

  modelTypeClicked({ modelType: modelType, event: event }: {modelType: ModelType, event: MouseEvent}) {
    if(event.detail === 2) { // double click
      this.toggleTypeInCollection(modelType);
    }
    //console.debug('modelTypeClicked', modelType, event);
  }

  clearSelection() {
    this.modelTypes = [];
  }
}
