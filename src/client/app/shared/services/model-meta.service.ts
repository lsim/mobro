import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import 'rxjs/Rx';
import * as _ from 'lodash';

@Injectable()
export class ModelMetaService {

  allTypes: Array<IRawModelType>;

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
    // Lastly a pass to build ancestor lists
    _.values(modelTypeMap).forEach((modelType: ModelType) => modelType.createAndReturnAncestorList());
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
    let url = `/fapi.model.meta/${endpoint}${argPart}`;
    return this.http.get(url)
      .map((x: any) => x.json())
      .toPromise()
      .catch(error => console.debug(`Request for ${url} failed with error ${JSON.stringify(error)}`));
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
      .map((rawProp: IRawModelProperty) => new ModelProperty(rawProp, typeLookup)).sort((p1, p2) => p1.name.localeCompare(p2.name));
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

  addSubtype(type: ModelType) {
    this.subtypes.push(type);
  }
}
