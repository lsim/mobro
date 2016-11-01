import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  ToolbarComponent,
  AutocompleteComponent,
  DraggableDirective,
  MapiEntityComponent,
  MapiEntityPropertiesComponent,
  ToggleButtonComponent,
  TypeGraphComponent } from './index';

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule],
  declarations: [
    ToolbarComponent,
    AutocompleteComponent,
    DraggableDirective,
    MapiEntityComponent,
    MapiEntityPropertiesComponent,
    ToggleButtonComponent,
    TypeGraphComponent
  ],
  exports: [
    ToolbarComponent,
    AutocompleteComponent,
    DraggableDirective,
    MapiEntityComponent,
    MapiEntityPropertiesComponent,
    ToggleButtonComponent,
    TypeGraphComponent,
    CommonModule, FormsModule, RouterModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
