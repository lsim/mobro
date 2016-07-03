import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {NavbarComponent} from './navbar.component';
import {ToolbarComponent} from './toolbar.component';
import {ModelMetaService} from '../shared/index';
import {LookupComponent} from '../+lookup/index';
import {AboutComponent} from '../+about/index';
import {LookupGraphComponent} from '../+lookupgraph/index';

@Component({
  selector: 'mb-app',
  viewProviders: [ModelMetaService],
  templateUrl: 'app/components/app.component.html',
  styleUrls: ['app/components/app.component.css'],
  directives: [ROUTER_DIRECTIVES, NavbarComponent, ToolbarComponent]
})
@RouteConfig([
  {
    path: '/lookup',
    name: 'Lookup',
    component: LookupComponent
  },
  {
    path: '/about',
    name: 'About',
    component: AboutComponent
  },
  {
    path: '/',
    name: 'LookupGraph',
    component: LookupGraphComponent
  }
])
export class AppComponent {}
