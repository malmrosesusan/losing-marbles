import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab5Page } from './tab5.page';

import { Tab5PageRoutingModule } from './tab5-routing.module';
import { CameraChallengeModule } from '../phaser-frogger/camera-challenge.module';
import { RainbowShooterComponent } from '../rainbow-shooter/rainbow-shooter.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        CameraChallengeModule,
        Tab5PageRoutingModule
    ],
    declarations: [Tab5Page,RainbowShooterComponent]
})
export class Tab5PageModule { }
