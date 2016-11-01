import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupGraphComponent } from './lookupgraph.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [LookupGraphComponent],
  exports: [LookupGraphComponent]
})

export class LookupGraphModule { }
