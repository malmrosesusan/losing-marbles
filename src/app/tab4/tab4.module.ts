import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab4Page } from './tab4.page';

import { Tab4PageRoutingModule } from './tab4-routing.module';
import { CameraChallengeModule } from '../phaser-frogger/camera-challenge.module';
import { AimingGameComponent } from '../aiming-game/aiming-game.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        CameraChallengeModule,
        Tab4PageRoutingModule
    ],
    declarations: [Tab4Page,AimingGameComponent]
})
export class Tab4PageModule { }
