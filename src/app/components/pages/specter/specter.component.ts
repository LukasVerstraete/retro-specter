import { EngineService } from './../../../services/engine.service';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'retro-specter',
  templateUrl: './specter.component.html',
  styleUrls: ['./specter.component.scss']
})
export class SpecterComponent implements OnInit, AfterViewInit {
  @ViewChild('retroCanvasContainer') canvasContainer: ElementRef;
  get CanvasContainer(): HTMLDivElement {
    return this.canvasContainer.nativeElement as HTMLDivElement;
  }

  public constructor(
    private engine: EngineService
  ) { }

  public ngOnInit(): void {

  }

  public ngAfterViewInit(): void {
    this.engine.Init(this.CanvasContainer);
    // this.engine.Start();
  }

}
