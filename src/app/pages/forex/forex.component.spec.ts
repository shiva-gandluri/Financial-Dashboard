import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForexComponent } from './forex.component';

describe('ForexComponent', () => {
  let component: ForexComponent;
  let fixture: ComponentFixture<ForexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
