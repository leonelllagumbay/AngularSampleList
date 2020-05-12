import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LightsHemisphereComponent } from './lights-hemisphere.component';

describe('LightsHemisphereComponent', () => {
  let component: LightsHemisphereComponent;
  let fixture: ComponentFixture<LightsHemisphereComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LightsHemisphereComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LightsHemisphereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
