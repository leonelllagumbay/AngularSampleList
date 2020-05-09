import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { D3jsSampleListPage } from './d3js-sample-list.page';

describe('D3jsSampleListPage', () => {
  let component: D3jsSampleListPage;
  let fixture: ComponentFixture<D3jsSampleListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3jsSampleListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(D3jsSampleListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
