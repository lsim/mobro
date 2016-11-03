import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/Rx';
import * as _ from 'lodash';

@Injectable()
export class ModelMetaService {

  allTypes: Array<IRawModelType>;
  currentUrl = 'http://cis47:8081/fapi.model.meta/all'; // TODO: default to something else

  constructor(private http: Http) {
  }

  getAllTypes() {
    return this.sendFapiRequest('browser');
  }

  getSubtypesOfType(type: string) : Promise<string[]> {
    return this.sendFapiRequest('subtypes', type);
  }

  getEntityInfo(type: string) {
    return this.sendFapiRequest('browser', type);
  }

  buildTypeHierarchy(allTypes: Array<IRawModelType>) {
    let modelTypeMap: {[key: string]: ModelType} = {};
    // First a pass to create an object instance for each raw type object
    allTypes.forEach((rawType:IRawModelType) => modelTypeMap[rawType.path] = new ModelType(rawType));
    let typeLookup = (s: string) => <ModelType>modelTypeMap[s];
    // Then a pass to set up references between object instances
    _.values(modelTypeMap).forEach((modelType: ModelType) => modelType.setReferenceProperties(typeLookup));
    // Lastly a pass to build ancestor lists and set inbound references
    _.values(modelTypeMap).forEach((modelType: ModelType) => {
      modelType.createAndReturnAncestorList();
      modelType.setInboundReferences(<Array<ModelType>>_.values(modelTypeMap));
    });
    return modelTypeMap;
  }

  getFullTypeHierarchy(): Promise<{[key: string]: ModelType}> {
    if(this.allTypes) {
      return new Promise((resolve) => {
        const typeHierarchy = this.buildTypeHierarchy(this.allTypes);
        resolve(typeHierarchy);
      });
    }
    return this.sendFapiRequest('all')
      .then((allTypesObj) => _.values(allTypesObj))
      .then((allTypes: Array<IRawModelType>) => {
        this.allTypes = allTypes;
        return this.buildTypeHierarchy(allTypes);
    });
  }

  private sendFapiRequest(endpoint: string, ...args: string[]) {
    let argPart = args.length > 0 ? '/' + args.join('/') : '';
    let url = `/api/${endpoint}${argPart}`;

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(url, {target: this.currentUrl}, options)
      .map((x: any) => x.json())
      .toPromise()
      .catch(error => console.debug(`Request for ${url} failed with error ${error}`));
  }

  setUrl(url: string) {
    this.currentUrl = url;
  }
}

enum PropertyType {
  primitive,
  object,
  enum,
  reference,
  collection
}

interface IRawModelProperty {
  type: string; //all
  propertyName: string; //all
  attributes: Array<string>; //all
  path: string; //all
  referenceType: string; //type object/reference
  values: Array<string>; //type enum
  isMember: boolean;
  name: string; //type primitive
  collectionType: string; //type collection
  parameterType: string; //type collection
}

let propertyMapper: any = {
  primitive: { description: (p: any) => p.name },
  object: { description: (p: any) => p.referenceType },
  enum: { description: (p: any) => `enum (${p.values.join(',')})` },
  reference: { description: (p: any) => p.referenceType, referencedTypeName: (p: any) => p.referenceType },
  collection: { description: (p: any) => p.parameterType + '+', referencedTypeName: (p: any) => p.parameterType }
};

export class ModelProperty {
  name: string;
  isNullable: boolean;
  isNotNull: boolean;
  isImmutable: boolean;
  description: string;
  referencedType: ModelType;
  type: string;

  constructor(rawProp: IRawModelProperty, typeLookup: (s: string) => ModelType) {
    this.name = rawProp.propertyName;
    this.isNullable = rawProp.attributes.indexOf('Nullable') >= 0;
    this.isNotNull = rawProp.attributes.indexOf('NotNull') >= 0;
    this.isImmutable = rawProp.attributes.indexOf('Immutable') >= 0;
    this.type = rawProp.type;

    let mapper = propertyMapper[rawProp.type];
    this.description = mapper.description(rawProp);
    if(mapper.referencedTypeName) {
      let refTypeName = mapper.referencedTypeName(rawProp);
      if(refTypeName) {
        this.referencedType = typeLookup(refTypeName);
      }
    }
  }
}

interface IRawModelType {
  _extends: string;
  attributes: string[];
  fields: any;// Seems we can't use the Map<string, stuff> yet. Browser complains.
  path: string;
}

export class ModelType {
  name: string;
  superType: ModelType;
  ancestors: Array<ModelType>;
  properties: Array<ModelProperty>;
  attributes: Array<string>;
  rawModelEntity: IRawModelType;
  subtypes: Array<ModelType> = [];
  inboundRefs: Array<InboundReference> = [];

  constructor(rawModelEntity: IRawModelType) {
    this.rawModelEntity = rawModelEntity;
    this.name = rawModelEntity.path;
    this.attributes = rawModelEntity.attributes;
  }

  setReferenceProperties(typeLookup: (s: string) => ModelType) {
    this.superType = typeLookup(this.rawModelEntity._extends);
    if(this.superType !== undefined) {
      this.superType.addSubtype(this);
    }
    this.properties = _.values(this.rawModelEntity.fields)
      .map((prop: any) => {
        if(typeof prop.attributes === 'object') { // In berlin and older versions, attributes is an object
          let attributes: Array<String> = [];
          for(let fieldName in prop.attributes) {
            if(fieldName === 'nullable' && prop.attributes[fieldName] === 'true') {
              attributes.push('Nullable');
            } else if(fieldName === 'nullable' && prop.attributes[fieldName] === 'false') {
              attributes.push('NotNull');
            }
          }
          if(_.keys(prop.attributes).length === 0) {
            attributes.push('Immutable');
          }
          prop.attributes = attributes;
        }
        return prop;
      })
      .map((rawProp: IRawModelProperty) => new ModelProperty(rawProp, typeLookup))
      .sort((p1, p2) => p1.name.localeCompare(p2.name));
  }

  createAndReturnAncestorList(): Array<ModelType> {
    if(this.ancestors) {
      return this.ancestors;
    }
    this.ancestors = [];
    if(this.superType !== undefined) {
      this.ancestors = [this.superType].concat(this.superType.createAndReturnAncestorList());
    }
    return this.ancestors;
  }

  setInboundReferences(allTypes: Array<ModelType>) {
    let result: Array<InboundReference> = [];
    allTypes.forEach((t) => {
      let newInboundRefs = t.properties
        .filter((p) => p.referencedType === this)
        .map((p: ModelProperty) => new InboundReference(p.name, t));
      if(newInboundRefs.length > 0) {
        result = result.concat(newInboundRefs);
      }
    });
    this.inboundRefs = result;
  }


  addSubtype(type: ModelType) {//TODO: create UI allowing the user to set this
    this.subtypes.push(type);
  }
}

export class InboundReference {
  constructor(public propName: string, public ownerType: ModelType) {}
}
