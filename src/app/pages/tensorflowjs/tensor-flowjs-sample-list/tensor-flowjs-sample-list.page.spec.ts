import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TensorFlowjsSampleListPage } from './tensor-flowjs-sample-list.page';

describe('TensorFlowjsSampleListPage', () => {
  let component: TensorFlowjsSampleListPage;
  let fixture: ComponentFixture<TensorFlowjsSampleListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TensorFlowjsSampleListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TensorFlowjsSampleListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
