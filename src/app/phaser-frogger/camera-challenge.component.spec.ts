import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CameraChallengeComponent } from './camera-challenge.component';

describe('CameraChallengeComponent', () => {
    let component: CameraChallengeComponent;
    let fixture: ComponentFixture<CameraChallengeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CameraChallengeComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(CameraChallengeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
