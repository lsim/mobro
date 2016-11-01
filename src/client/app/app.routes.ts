import { Routes } from '@angular/router';

import { LookupGraphRoutes } from './lookupgraph/index';
//import { AboutRoutes } from './about/index';
//import { HomeRoutes } from './home/index';

export const routes: Routes = [
  ...LookupGraphRoutes
  //...HomeRoutes,
  //...AboutRoutes
];
