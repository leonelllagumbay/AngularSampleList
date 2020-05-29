import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VersorDraggingMapComponent } from './versor-dragging-map.component';

describe('VersorDraggingMapComponent', () => {
  let component: VersorDraggingMapComponent;
  let fixture: ComponentFixture<VersorDraggingMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersorDraggingMapComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VersorDraggingMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
