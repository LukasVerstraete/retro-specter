import { AuthService } from './auth.service';
import { InputController, KEY_TYPE } from './../models/engine/InputController';
import { PlayerService } from './player.service';
import { GameLoop } from './../models/engine/GameLoop';
import { RenderService } from './render.service';
import { Injectable, OnDestroy } from '@angular/core';

import * as PIXI from 'pixi.js';
import { Game } from '../models/engine/Game';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {

  public app: PIXI.Application;
  public inputController: InputController;
  private game: Game;

  private test: PIXI.Spritesheet;
  private animatedSprite: PIXI.AnimatedSprite;

  public constructor(
    public renderer: RenderService,
    public playerService: PlayerService
  ) { }

  public Init(canvasContainer: HTMLDivElement): void {
    this.renderer.Init(canvasContainer);
    this.app = this.renderer.app;
    this.inputController = new InputController(this.Input.bind(this));
    this.game = new Game(this);

    this.game.InitAssets();
    this.app.loader.onComplete.add(() => {
      this.game.Init();
      this.Start();
    });
    this.app.loader.load();
  }

  public ngOnDestroy(): void {
    this.game.CleanUp();
  }

  public Start(): void {
    this.app.ticker.add(this.Logic.bind(this));
  }

  private Logic(deltaTime: number): void {
    this.game.Update(deltaTime);
  }

  private Input(): void {
    this.game.Input();
  }
}
