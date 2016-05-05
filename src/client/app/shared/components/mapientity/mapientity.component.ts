import {Component,Input,Output,EventEmitter} from 'angular2/core'
import {CORE_DIRECTIVES,NgSwitchWhen,NgSwitch} from 'angular2/common'
import * as _ from 'lodash'


@Component({
  selector: 'mapientity',
  templateUrl: 'app/shared/components/mapientity/mapientity.component.html',
  styleUrls: ['app/shared/components/mapientity/mapientity.component.css'],
  directives: [CORE_DIRECTIVES,NgSwitch,NgSwitchWhen]
})
export class MapiEntityComponent {

  @Input() mapiEntity: MapiEntity;
  @Output() navigate: EventEmitter<any> = new EventEmitter();
  @Output() remove: EventEmitter<any> = new EventEmitter();

  onRemoveClick() {
    this.remove.emit("");
  }

  navigateTo(name: string) {
    if(name) {
      this.navigate.emit(name);
    }
  }
}

export class MapiEntity {

  entityFields: Object[];
  superType: string;

  constructor(public name: string, public inheritors: string[], public entityInfo: any) {
    this.entityFields = this.toFieldViewModels(_.map(_.keys(entityInfo.fields).sort(), (f: string) => entityInfo.fields[f]));
    this.superType = entityInfo._extends;
    if(this.superType === "AbstractEntity") {
      this.superType = undefined;
    }
  }

  propertyMapper: any = {
    primitive: { display: (p: any) => p.name },
    object: { display: (p: any) => p.referenceType },
    enum: { display: (p: any) => `enum (${p.values.join(',')})` },
    reference: { display: (p: any) => p.referenceType, navigateTo: (p: any) => p.referenceType },
    collection: { display: (p: any) => p.parameterType + "+", navigateTo: (p: any) => p.parameterType }
  };

  toFieldViewModels(rawFields: Array<any>) {
    return rawFields.map(rawField => {
      let mapper = this.propertyMapper[rawField.type];
      return {
        name: rawField.propertyName,
        isNullable: rawField.attributes.includes("Nullable"),
        immutable: rawField.attributes.includes("Immutable"),
        notNull: rawField.attributes.includes("NotNull"),
        displayedType: mapper.display(rawField),
        navigationTarget: mapper.navigateTo != null ? mapper.navigateTo(rawField) : undefined
      };
    });
  }

}

