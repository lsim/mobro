import {
  TestComponentBuilder,
  describe,
  expect,
  it,
  inject
} from 'angular2/testing';
import {Component} from 'angular2/core';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {LookupComponent} from './lookup.component';
import {NameListService} from '../../shared/index';


export function main() {
  describe('Lookup component', () => {
    it('should work',
      inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
        tcb.createAsync(TestComponent)
          .then(rootTC => {
            rootTC.detectChanges();

            let lookupInstance = rootTC.debugElement.children[0].componentInstance;
            let lookupDOMEl = rootTC.debugElement.children[0].nativeElement;
            let nameListLen = function () {
              return lookupInstance.nameListService.names.length;
            };

            expect(lookupInstance.nameListService).toEqual(jasmine.any(NameListService));
            expect(nameListLen()).toEqual(4);
            expect(DOM.querySelectorAll(lookupDOMEl, 'li').length).toEqual(nameListLen());

            lookupInstance.newName = 'Minko';
            lookupInstance.addName();
            rootTC.detectChanges();

            expect(nameListLen()).toEqual(5);
            expect(DOM.querySelectorAll(lookupDOMEl, 'li').length).toEqual(nameListLen());

            expect(DOM.querySelectorAll(lookupDOMEl, 'li')[4].textContent).toEqual('Minko');
          });
      }));
  });
}

@Component({
  providers: [NameListService],
  selector: 'test-cmp',
  template: '<mb-lookup></mb-lookup>',
  directives: [LookupComponent]
})
class TestComponent {}
