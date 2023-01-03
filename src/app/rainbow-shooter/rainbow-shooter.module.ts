import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RainbowShooterComponent } from './rainbow-shooter.component';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule],
    declarations: [RainbowShooterComponent],
    exports: [RainbowShooterComponent]
})
export class RainbowShooterModule { }
