import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossiersDocumentsComponent } from './dossiers-documents.component';

describe('DossiersDocumentsComponent', () => {
  let component: DossiersDocumentsComponent;
  let fixture: ComponentFixture<DossiersDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossiersDocumentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DossiersDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
