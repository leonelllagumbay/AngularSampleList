import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CumsumComponent } from './cumsum.component';

describe('CumsumComponent', () => {
  let component: CumsumComponent;
  let fixture: ComponentFixture<CumsumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CumsumComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CumsumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
