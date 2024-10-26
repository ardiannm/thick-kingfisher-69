import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaretComponent } from './caret.component';

describe('CaretComponent', () => {
  let component: CaretComponent;
  let fixture: ComponentFixture<CaretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
