import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CameraChallengeComponent } from './camera-challenge.component';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule],
    declarations: [CameraChallengeComponent],
    exports: [CameraChallengeComponent]
})
export class CameraChallengeModule { }
