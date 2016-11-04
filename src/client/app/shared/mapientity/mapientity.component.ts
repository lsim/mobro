import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModelType } from '../../shared/index';

@Component({
  selector: 'mb-mapientity',
  templateUrl: 'app/shared/mapientity/mapientity.component.html',
  styleUrls: ['app/shared/mapientity/mapientity.component.css']
  //directives: [MapiEntityPropertiesComponent]
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
