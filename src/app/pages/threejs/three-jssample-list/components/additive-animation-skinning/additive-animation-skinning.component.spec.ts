import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AdditiveAnimationSkinningComponent } from './additive-animation-skinning.component';

describe('AdditiveAnimationSkinningComponent', () => {
  let component: AdditiveAnimationSkinningComponent;
  let fixture: ComponentFixture<AdditiveAnimationSkinningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditiveAnimationSkinningComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdditiveAnimationSkinningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
