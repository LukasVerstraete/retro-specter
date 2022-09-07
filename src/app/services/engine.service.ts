import { SocketService } from './socket.service';
import { InputController } from './../models/engine/InputController';
import { RenderService } from './render.service';
import { Injectable } from '@angular/core';

import * as PIXI from 'pixi.js';
import { Game } from '../models/engine/Game';
import { Player, PlayerDto } from '../models/Player';

@Injectable({
  providedIn: 'root'
})
export class EngineService {

  public app: PIXI.Application;
  public inputController: InputController;
  private game: Game;

  get IsInRetro(): boolean {
    return this.game ? this.game.isInRetro : false;
  }

  get player(): Player {
    return this.game.currentPlayer;
  }

  get canIEven(): boolean {
      return this.game ? this.game.iCantEven : false;
  }

  public constructor(
    public renderer: RenderService,
    public socketService: SocketService
  ) { }

  public Init(canvasContainer: HTMLDivElement, player: PlayerDto): void {
    this.renderer.Init(canvasContainer);
    this.app = this.renderer.app;
    this.inputController = new InputController(this.Input.bind(this));
    this.socketService.Connect();
    this.game = new Game(this);

    this.game.InitAssets();
    this.app.loader.onComplete.add(() => {
      this.game.Init(player);
      this.Start();
    });
    this.app.loader.load();
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

  public EnterRetro(): void {
    this.game.isInRetro = true;
    this.app.ticker.stop();
  }

  public LeaveRetro(): void {
    this.game.isInRetro = false;
    this.app.ticker.start();
  }
}
