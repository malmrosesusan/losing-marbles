import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SinkingMarblesComponent } from './sinking-marbles.component';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule],
    declarations: [SinkingMarblesComponent],
    exports: [SinkingMarblesComponent]
})
export class SinkingMarblesModule { }
