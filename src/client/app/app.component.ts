import { Component } from '@angular/core';
import { Config } from './shared/index';
import './operators';
import { ModelMetaService, LogService } from './shared/index';

/**
 * This class represents the main application component. Within the @Routes annotation is the configuration of the
 * applications routes, configuring the paths for the lazy loaded components (HomeComponent, AboutComponent).
 */
@Component({
  selector: 'mb-app',
  providers: [ModelMetaService, LogService], //Singleton services provided at this level
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/app.component.css']
})

export class AppComponent {
  constructor() {
    console.log('Environment config', Config);
  }
}
