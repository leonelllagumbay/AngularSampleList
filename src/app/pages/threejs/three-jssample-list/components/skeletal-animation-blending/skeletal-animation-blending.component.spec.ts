import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SkeletalAnimationBlendingComponent } from './skeletal-animation-blending.component';

describe('SkeletalAnimationBlendingComponent', () => {
  let component: SkeletalAnimationBlendingComponent;
  let fixture: ComponentFixture<SkeletalAnimationBlendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkeletalAnimationBlendingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletalAnimationBlendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
