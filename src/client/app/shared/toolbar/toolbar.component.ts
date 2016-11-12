import { Component } from '@angular/core';
import { ModelMetaService, ModelDetails } from "../services/model-meta.service";
import { LocalStorage } from "../services/localstorage.service";

@Component({
  selector: 'mb-toolbar',
  providers: [LocalStorage],
  templateUrl: 'app/shared/toolbar/toolbar.component.html',
  styleUrls: ['app/shared/toolbar/toolbar.component.css']
})
export class ToolbarComponent {
  inputContent: string = "";
  selectedHost: string = "";
  knownHosts: string[] = [];
  modelDetails: ModelDetails = null;

  constructor(public modelMetaService: ModelMetaService, public localStorage: LocalStorage) {
    this.loadHostConfig();
    modelMetaService.detailsChanged.subscribe((modelDetails: ModelDetails) => {
      this.modelDetails = modelDetails;
      this.addKnownHost(modelDetails.host);
      this.selectedHost = modelDetails.host;
      this.localStorage.set('selectedHost', this.selectedHost);
    });
  }

  loadHostConfig() {
    let selectedHost = this.localStorage.get('selectedHost');
    if(selectedHost) {
      this.selectedHost = selectedHost;
      this.setCurrentCis(this.selectedHost);
    }
    let knownHostObj = this.localStorage.getObject('knownHosts');
    if(knownHostObj && knownHostObj.knownHosts) {
      this.knownHosts = knownHostObj.knownHosts;
    }
  }

  addKnownHost(host: string) {
    if(this.knownHosts.indexOf(host) === -1) {
      this.knownHosts.push(host);
      this.knownHosts.sort();
      this.localStorage.setObject('knownHosts', { knownHosts: this.knownHosts});
    }
  }

  setCurrentCis(metaModelHostName: string) {
    this.modelMetaService.setModelMetaHost(metaModelHostName);
    this.inputContent = "";
  }
}
