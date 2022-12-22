import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SinkingMarblesComponent } from './sinking-marbles.component';

describe('SinkingMarblesComponent', () => {
    let component: SinkingMarblesComponent;
    let fixture: ComponentFixture<SinkingMarblesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SinkingMarblesComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(SinkingMarblesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
