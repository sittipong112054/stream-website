import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSubheader } from './subheader';

describe('StoreSubheader', () => {
  let component: StoreSubheader;
  let fixture: ComponentFixture<StoreSubheader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreSubheader]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StoreSubheader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
