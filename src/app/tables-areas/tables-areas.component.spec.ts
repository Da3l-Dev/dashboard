import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesAreasComponent } from './tables-areas.component';

describe('TablesAreasComponent', () => {
  let component: TablesAreasComponent;
  let fixture: ComponentFixture<TablesAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablesAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
