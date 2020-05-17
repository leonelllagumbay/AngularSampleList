import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LittlestTokyoComponent } from './littlest-tokyo.component';

describe('LittlestTokyoComponent', () => {
  let component: LittlestTokyoComponent;
  let fixture: ComponentFixture<LittlestTokyoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LittlestTokyoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LittlestTokyoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
