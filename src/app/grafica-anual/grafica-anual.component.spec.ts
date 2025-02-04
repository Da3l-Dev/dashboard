import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficaAnualComponent } from './grafica-anual.component';

describe('GraficaAnualComponent', () => {
  let component: GraficaAnualComponent;
  let fixture: ComponentFixture<GraficaAnualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficaAnualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficaAnualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
