import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarTachesComponent } from './calendar-taches.component';

describe('CalendarTachesComponent', () => {
  let component: CalendarTachesComponent;
  let fixture: ComponentFixture<CalendarTachesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarTachesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalendarTachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
