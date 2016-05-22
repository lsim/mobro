import {Component} from 'angular2/core';
import {TypeGraphComponent,ModelType,ModelMetaService} from '../../shared/index';
import * as _ from 'lodash';

@Component({
  selector: 'mb-about',
  templateUrl: 'app/+about/components/about.component.html',
  styleUrls: ['app/+about/components/about.component.css'],
  directives: [TypeGraphComponent]
})
export class AboutComponent {

  typeMap: {[key: string]: ModelType};
  modelTypes: Array<ModelType> = [];

  constructor(public modelMetaService: ModelMetaService) {
    modelMetaService.getFullTypeHierarchy().then((fullTypeHierarchy) => {
      this.typeMap = fullTypeHierarchy;
      this.modelTypes = <Array<ModelType>>_.take(_.values(fullTypeHierarchy), 55);
    });
  }
}
