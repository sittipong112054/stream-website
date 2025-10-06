import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { EditProfile } from './edit-profiles';

describe('EditProfile', () => {
  let component: EditProfile;
  let fixture: ComponentFixture<EditProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
