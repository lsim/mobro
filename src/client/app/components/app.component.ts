import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {NavbarComponent} from './navbar.component';
import {ToolbarComponent} from './toolbar.component';
import {NameListService,ModelMetaService} from '../shared/index';
import {LookupComponent} from '../+lookup/index';
import {AboutComponent} from '../+about/index';

@Component({
  selector: 'mb-app',
  viewProviders: [NameListService, ModelMetaService],
  templateUrl: 'app/components/app.component.html',
  directives: [ROUTER_DIRECTIVES, NavbarComponent, ToolbarComponent]
})
@RouteConfig([
  {
    path: '/',
    name: 'Lookup',
    component: LookupComponent
  },
  {
    path: '/about',
    name: 'About',
    component: AboutComponent
  }
])
export class AppComponent {}
