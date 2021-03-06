import {provide, enableProdMode} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {JSONP_PROVIDERS,HTTP_PROVIDERS} from 'angular2/http';
import {APP_BASE_HREF} from 'angular2/platform/common';
import {AppComponent} from './app/components/app.component';
import 'rxjs/Rx';
//import 'rxjs/add/operator/*';

if ('<%= ENV %>' === 'prod') { enableProdMode(); }
enableProdMode(); // To see if this fixes the memory leaks (it does)
bootstrap(AppComponent, [
  ROUTER_PROVIDERS,
  JSONP_PROVIDERS,
  HTTP_PROVIDERS,
  provide(APP_BASE_HREF, { useValue: '<%= APP_BASE %>' })
]);

// In order to start the Service Worker located at "./worker.js"
// uncomment this line. More about Service Workers here
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
//
// if ('serviceWorker' in navigator) {
//   (<any>navigator).serviceWorker.register('./worker.js').then((registration: any) =>
//       console.log('ServiceWorker registration successful with scope: ', registration.scope))
//     .catch((err: any) =>
//       console.log('ServiceWorker registration failed: ', err));
// }
