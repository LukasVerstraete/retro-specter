import { Player } from './../Player';
import { InputController } from './InputController';
import { EngineService } from './../../services/engine.service';
import { Observable, Subscription } from 'rxjs';

import * as PIXI from 'pixi.js';
export class Game {

    private PLAYER_SPEED = 5;

    private players$: Subscription;
    private players: Player[] = [];
    private playerSprites: {[id: string]: PIXI.AnimatedSprite} = {};

    public constructor(
        private engine: EngineService
    ) {}

    public Init(): void {
        this.players$ = this.engine.playerService.GetPlayers().subscribe(this.ManagePlayerStateUpdates.bind(this));
    }

    public InitAssets(): void {
        const app: PIXI.Application = this.engine.app;
        app.loader.baseUrl = './assets/images';
        app.loader.add('test_map', 'test_map.json');
    }

    private ManagePlayerStateUpdates(players: Player[]): void {
        console.log(players);
        this.players = players;
        this.AddNewPlayers();

        this.players.forEach((player: Player) => {
            const sprite: PIXI.AnimatedSprite = this.playerSprites[player.id];
            sprite.position.x = player.positionX;
            sprite.position.y = player.positionY;
        });
    }

    private AddNewPlayers(): void {
        const newPlayers: Player[] = this.players.filter((player: Player) => {
            return !this.playerSprites[player.id];
        });

        const spriteSheet: PIXI.Spritesheet = this.engine.app.loader.resources.test_map.spritesheet;

        newPlayers.forEach((player: Player) => {
            player.positionX = 0;
            player.positionY = 0;
            this.CreatePlayer(player, spriteSheet);
        });
    }

    private CreatePlayer(player: Player, spriteSheet: PIXI.Spritesheet): void {
        const sprite: PIXI.AnimatedSprite = new PIXI.AnimatedSprite(spriteSheet.animations.test, true);
        sprite.loop = true;
        sprite.animationSpeed = 0.2;
        sprite.scale.set(4);
        sprite.play();
        sprite.position.set(player.positionX, player.positionY);
        this.playerSprites[player.id] = sprite;
        this.engine.app.stage.addChild(sprite);
    }

    public Update(deltaTime: number): void {
        this.players.forEach((player: Player) => {
            const sprite: PIXI.AnimatedSprite = this.playerSprites[player.id];
            const normalizedDirection: {x: number, y: number} = this.Normalize(player.directionX, player.directionY);
            sprite.position.x += normalizedDirection.x * this.PLAYER_SPEED * deltaTime;
            sprite.position.y += normalizedDirection.y * this.PLAYER_SPEED * deltaTime;
        });
    }

    public Normalize(x: number, y: number): { x: number, y: number } {
        const length: number = Math.sqrt(x * x + y * y);
        if (length > 0) {
            const norX: number = x / length;
            const norY: number = y / length;

            return { x: norX, y: norY };
        }
        return {x, y};
    }

    public Input(): void {
        const input: InputController = this.engine.inputController;
        const currentPlayer: Player = this.players.find((player: Player) => player.isCurrent);
        if (!currentPlayer) {
            return;
        }

        const oldX: number = currentPlayer.directionX;
        const oldY: number = currentPlayer.directionY;

        currentPlayer.directionX = 0;
        currentPlayer.directionY = 0;

        if (input.keys.UP) {
            currentPlayer.directionY = -1;
        }
        if (input.keys.DOWN) {
            currentPlayer.directionY = 1;
        }
        if (input.keys.LEFT) {
            currentPlayer.directionX = -1;
        }
        if (input.keys.RIGHT) {
            currentPlayer.directionX = 1;
        }

        if (oldX !== currentPlayer.directionX || oldY !== currentPlayer.directionY) {
            const currentPlayerSprite: PIXI.AnimatedSprite = this.playerSprites[currentPlayer.id];
            currentPlayer.positionX = currentPlayerSprite.position.x;
            currentPlayer.positionY = currentPlayerSprite.position.y;
            this.engine.playerService.SetDirection(currentPlayer);
        }
    }

    public CleanUp(): void {
        this.players$.unsubscribe();
    }
}
