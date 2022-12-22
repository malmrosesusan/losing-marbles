import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { SinkingMarblesModule } from '../sinking-marbles/sinking-marbles.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        SinkingMarblesModule,
        Tab1PageRoutingModule
    ],
    declarations: [Tab1Page]
})
export class Tab1PageModule { }