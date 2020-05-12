import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Basic3Component } from './basic3.component';

describe('Basic3Component', () => {
  let component: Basic3Component;
  let fixture: ComponentFixture<Basic3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Basic3Component ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Basic3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
