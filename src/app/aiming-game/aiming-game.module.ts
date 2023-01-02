import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AimingGameComponent } from './aiming-game.component';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule],
    declarations: [AimingGameComponent],
    exports: [AimingGameComponent]
})
export class AimingGameModule { }
