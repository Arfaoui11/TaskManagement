import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDossierComponent } from './create-dossier.component';

describe('CreateDossierComponent', () => {
  let component: CreateDossierComponent;
  let fixture: ComponentFixture<CreateDossierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDossierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
