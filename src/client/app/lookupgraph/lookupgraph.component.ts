import { Component } from '@angular/core';
import { ModelMetaService, ModelType, LogService } from '../shared/index';
import * as _ from 'lodash';


@Component({
  selector: 'mb-lookupgraph',
  templateUrl: 'app/lookupgraph/lookupgraph.component.html',
  styleUrls: ['app/lookupgraph/lookupgraph.component.css']
})
export class LookupGraphComponent {

  allTypes: Array<string>;
  allProperties: Array<string>;
  typeMap: {[key: string]: ModelType};
  typeSearchString = '';
  propSearchString = '';
  modelTypes: Array<ModelType> = [];

  constructor(public modelMetaService: ModelMetaService, public logService: LogService) {
    modelMetaService.hostChanged.subscribe((newHost: string) => this.initFromSource(newHost));
    this.initFromSource(modelMetaService.currentModelMetaHost);
  }

  initFromSource(host: string) {
    let selectedTypes = this.modelTypes.map((modelType) => modelType.name);
    this.clearSelection();
    this.modelMetaService.getFullTypeHierarchy().then((fullTypeHierarchy) => {
      this.typeMap = fullTypeHierarchy;
      this.allTypes = _.keys(fullTypeHierarchy);
      this.allProperties = this.getAllProperties(fullTypeHierarchy);
      this.logService.logMsg(`Loaded ${this.allTypes.length} entities and ${this.allProperties.length} properties from ${host}`);
      selectedTypes.forEach((typeName) => this.addTypeByName(typeName));
    }).catch((error) => {
      this.logService.logErr(`Failed loading type information from ${host}`);
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
