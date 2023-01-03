import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RainbowShooterComponent } from './rainbow-shooter.component';
describe('RainbowShooterComponent', () => {
    let component: RainbowShooterComponent;
    let fixture: ComponentFixture<RainbowShooterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RainbowShooterComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(RainbowShooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
