import {Component} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';

import {ModelMetaService,AutocompleteComponent,MapiEntityComponent,MapiEntity} from '../../shared/index';

@Component({
  selector: 'mb-lookup',
  templateUrl: 'app/+lookup/components/lookup.component.html',
  styleUrls: ['app/+lookup/components/lookup.component.css'],
  directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, AutocompleteComponent, MapiEntityComponent]
})
export class LookupComponent {

  allTypes: string[];
  searchString = '';
  entities: MapiEntity[] = [];

  constructor(public modelMetaService: ModelMetaService) {
    modelMetaService.getTypes().then(types => this.allTypes = types);
  }

  addEntity(entity: MapiEntity) {
    this.entities.push(entity);
  }

  lookupEntity(query: string) {
    if(!query || this.entities.find((e) => e.name === query)) {
      return;
    }
    this.searchString = '';
    Observable.forkJoin(
      this.modelMetaService.getSubtypesOfType(query),
      this.modelMetaService.getEntityInfo(query)
    ).subscribe(([subtypes, entityInfo]: Array<any>) => {
      this.addEntity(new MapiEntity(query, subtypes, entityInfo));
    });
  }

  removeEntity(index: number) {
    this.entities.splice(index, 1);
  }
}
