import { HTTP_PROVIDERS, XHRBackend, ResponseOptions, Response } from '@angular/http';
import { provide } from '@angular/core';
import { beforeEachProviders,inject,it } from '@angular/testing';
import { MockBackend,MockConnection } from '@angular/http/testing';
import { ModelMetaService } from './model-meta.service';

export function main() {
  describe('ModelMeta Service', () => {

    beforeEachProviders(() => {
      return [
        HTTP_PROVIDERS,
        provide(XHRBackend, {useClass: MockBackend}),
        ModelMetaService
      ];
    });

    //beforeEach(() => {
    //
    //});

    it('should do math', () => {
      expect(2 + 3).toBe(5);
    });

    it('should get all types', inject([XHRBackend,ModelMetaService],(mockBackend: MockBackend, modelMetaService: ModelMetaService) => {

      mockBackend.connections.subscribe(
        (connection: MockConnection) => {
          connection.mockRespond(new Response(
            new ResponseOptions({
                body: ['type1','type2','type3']
              })
          ));
        });

      //modelMetaService.getTypes().then((types: string[]) => {
      //  expect(types.length).toBe(3);
      //  expect(types[0]).toBe('type2');
      //});
    }));
  });
}
