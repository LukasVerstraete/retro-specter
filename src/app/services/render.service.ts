import { Injectable } from '@angular/core';

import * as PIXI from 'pixi.js';

@Injectable({
  providedIn: 'root'
})
export class RenderService {

  public app: PIXI.Application;

  public Init(canvasContainer: HTMLDivElement): void {
    this.app = new PIXI.Application({
      resizeTo: canvasContainer,
      backgroundColor: 0xFFFFFF,
      transparent: true
    });
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    canvasContainer.appendChild(this.app.view);
  }
}
