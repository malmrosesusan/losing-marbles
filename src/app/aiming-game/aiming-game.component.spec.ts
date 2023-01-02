import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AimingGameComponent } from './aiming-game.component';

describe('AimingGameComponent', () => {
    let component: AimingGameComponent;
    let fixture: ComponentFixture<AimingGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AimingGameComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(AimingGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
