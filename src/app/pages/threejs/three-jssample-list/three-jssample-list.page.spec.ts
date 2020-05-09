import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThreeJSSampleListPage } from './three-jssample-list.page';

describe('ThreeJSSampleListPage', () => {
  let component: ThreeJSSampleListPage;
  let fixture: ComponentFixture<ThreeJSSampleListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreeJSSampleListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThreeJSSampleListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
