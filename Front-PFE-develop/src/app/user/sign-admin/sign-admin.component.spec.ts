import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignAdminComponent } from './sign-admin.component';

describe('SignAdminComponent', () => {
  let component: SignAdminComponent;
  let fixture: ComponentFixture<SignAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});