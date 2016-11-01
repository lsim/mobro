import {Component,Input,Output,EventEmitter} from '@angular/core';
//import {NgSwitchCase,NgSwitch} from '@angular/common';
import {ModelType} from '../../shared/services/model-meta.service';
//import * as _ from 'lodash';


@Component({
  selector: 'mapientityproperties',
  templateUrl: 'app/shared/mapientity/mapientity.properties.component.html',
  styleUrls: ['app/shared/mapientity/mapientity.properties.component.css']
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
