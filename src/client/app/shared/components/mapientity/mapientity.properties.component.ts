import {Component,Input,Output,EventEmitter} from 'angular2/core';
import {CORE_DIRECTIVES,NgSwitchWhen,NgSwitch} from 'angular2/common';
import {ModelType} from '../../../shared/services/model-meta.service';
//import * as _ from 'lodash';


@Component({
  selector: 'mapientityproperties',
  templateUrl: 'app/shared/components/mapientity/mapientity.properties.component.html',
  styleUrls: ['app/shared/components/mapientity/mapientity.properties.component.css'],
  directives: [CORE_DIRECTIVES,NgSwitch,NgSwitchWhen]
})
export class MapiEntityPropertiesComponent {

  @Input() modelType: ModelType;
  @Output() navigate: EventEmitter<any> = new EventEmitter();

  navigateTo(name: string) {
    if(name) {
      this.navigate.emit(name);
    }
  }
}
