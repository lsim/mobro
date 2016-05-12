import {Component,Input,Output,EventEmitter} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {ModelType} from '../../../shared/index';
import {MapiEntityPropertiesComponent} from './mapientity.properties.component';
//import * as _ from 'lodash';


@Component({
  selector: 'mapientity',
  templateUrl: 'app/shared/components/mapientity/mapientity.component.html',
  styleUrls: ['app/shared/components/mapientity/mapientity.component.css'],
  directives: [CORE_DIRECTIVES,MapiEntityPropertiesComponent]
})
export class MapiEntityComponent {

  @Input() modelType: ModelType;
  @Output() navigate: EventEmitter<any> = new EventEmitter();
  @Output() remove: EventEmitter<any> = new EventEmitter();

  onRemoveClick() {
    this.remove.emit('');
  }

  navigateTo(name: string) {
    if(name) {
      this.navigate.emit(name);
    }
  }
}
