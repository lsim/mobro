import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import 'rxjs/Rx';

@Injectable()
export class ModelMetaService {

  private allTypesPromise: Promise<string[]> = null;

  constructor(private http: Http) {
    // Trigger load of all entities from the /all endpoint
    this.allTypesPromise = this.initTypes();
  }

  initTypes() {
    return this.sendFapiRequest('browser');
  }

  getTypes() {
    return this.allTypesPromise;
  }

  getSubtypesOfType(type: string) : Promise<string[]> {
    return this.sendFapiRequest('subtypes', type);
  }

  getEntityInfo(type: string) {
    return this.sendFapiRequest('browser', type);
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
