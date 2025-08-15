import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmIdentityComponent } from './confirm-identity.component';

describe('ConfirmIdentityComponent', () => {
  let component: ConfirmIdentityComponent;
  let fixture: ComponentFixture<ConfirmIdentityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmIdentityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmIdentityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
