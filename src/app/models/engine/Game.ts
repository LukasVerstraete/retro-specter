import { Colliding, MoveResult, TryMove, Vector2 } from './CollisionUtil';
import { Player, PlayerDto } from './../Player';
import { InputController } from './InputController';
import { EngineService } from './../../services/engine.service';

import * as PIXI from 'pixi.js';
import { BoxObject, CreateWorldMap, LoadPlayerAnimations, PlayerAnimations, WorldMap } from './graphics/SpriteMap';
export class Game {

    private GAME_SCALE = 8;
    private PLAYER_SPEED = 0.8;
    public currentPlayer?: Player;
    public players: Player[] = [];
    public map: WorldMap;
    public playerCollider: BoxObject = {
        x: 0, y: 0,
        width: 4, height: 2
    };

    public isInRetro = false;
    public iCantEven = false;

    public get Loader(): PIXI.Loader {
        return this.engine.app.loader;
    }

    public constructor(
        private engine: EngineService
    ) {}

    public InitAssets(): void {
        const app: PIXI.Application = this.engine.app;
        app.loader.baseUrl = './assets/images';
        app.loader.add('office_map', 'office.json');
        app.loader.add('tilemap', 'Plantyn.png');
        app.loader.add('player_sheet', 'players.png');
    }

    public Init(player: PlayerDto): void {
        this.SetupSocketActions();
        this.SetupMap();
        const x: number = this.map.spawnPoint.x;
        const y: number = this.map.spawnPoint.y;
        this.engine.socketService.Send('JOIN', { name: player.name, x, y, textureIndex: player.textureIndex, dbId: player.id });
    }

    public SetupMap(): void {
        this.map = CreateWorldMap(this.Loader.resources.office_map.data, this.Loader.resources.tilemap.texture);
        this.map.mapContainer.scale.set(this.GAME_SCALE);
        this.engine.app.stage.addChild(this.map.mapContainer);
    }

    public SetupSocketActions(): void {
        this.engine.socketService.SetupActions([
            {type: 'JOIN', callback: this.OnPlayerJoined.bind(this)},
            {type: 'DISCONNECTED', callback: this.OnPlayerDisconnected.bind(this)},
            {type: 'PLAYER_LIST', callback: this.OnPlayerList.bind(this)},
            {type: 'CHANGE_DIRECTION', callback: this.OnPlayerChangedDirection.bind(this)}
        ]);
    }

    public OnPlayerJoined(player: Player): void {
        this.registerPlayer(player);
    }

    public OnPlayerDisconnected(data: {id: string}): void {
        const player: Player = this.players.find((p: Player) => p.id === data.id );
        player.sprite.destroy();
        this.players = this.players.filter((p: Player) => p.id !== data.id);
    }

    public OnPlayerList(players: {players: Player[]}): void {
        players.players.forEach((player: Player) => {
            if (player.isCurrent) {
                this.currentPlayer = player;
            }
            this.registerPlayer(player);
        });
    }

    public OnPlayerChangedDirection(data: {id: string, x: number, y: number, dx: number, dy: number}): void {
        const player: Player = this.players.find((p: Player) => p.id === data.id);

        console.log(player, data);

        if (!player) { return; }

        player.x = data.x;
        player.y = data.y;
        this.SetSpritePosition(player.sprite, new Vector2(data.x, data.y));
        this.SetPlayerSpriteOnDirectionChange(player, data.dx, data.dy);
        player.directionX = data.dx;
        player.directionY = data.dy;
    }

    private SetSpritePosition(sprite: PIXI.Sprite, position: Vector2): void {
        sprite.position.x = position.x - ((sprite.width - this.playerCollider.width) / 2);
        sprite.position.y = position.y - (sprite.height - this.playerCollider.height);
    }

    private SetPlayerSpriteOnDirectionChange(player: Player, newDirectionX: number, newDirectionY: number): void {
        if (player.directionX !== newDirectionX || player.directionY !== newDirectionY) {
            const isMoving: boolean = newDirectionX !== 0 || newDirectionY !== 0;
            if (isMoving) {
                let textures: PIXI.Texture[];
                if (newDirectionX > 0) {
                    textures = player.textures.walkRight;
                }
                if (newDirectionX < 0) {
                    textures = player.textures.walkLeft;
                }
                if (newDirectionY < 0) {
                    textures = player.textures.walkUp;
                }
                if (newDirectionY > 0) {
                    textures = player.textures.walkDown;
                }
                player.sprite.textures = textures;
            } else {
                let texture: PIXI.Texture;
                if (player.directionX > 0) {
                    texture = player.textures.lookRight;
                }
                if (player.directionX < 0) {
                    texture = player.textures.lookLeft;
                }
                if (player.directionY < 0) {
                    texture = player.textures.lookUp;
                }
                if (player.directionY > 0) {
                    texture = player.textures.lookDown;
                }
                player.sprite.textures = [texture];
            }
            player.sprite.play();
        }
    }

    public registerPlayer(player: Player): void {
        this.players.push(player);
        this.CreatePlayerSprite(player);
    }

    private CreatePlayerSprite(player: Player): void {
        console.log(player.textureIndex)
        const playerTextures: PlayerAnimations = LoadPlayerAnimations(
            player.textureIndex,
            this.Loader.resources.player_sheet.texture,
            16,
            16
        );
        const sprite: PIXI.AnimatedSprite = new PIXI.AnimatedSprite([playerTextures.lookDown], true);
        sprite.loop = true;
        sprite.animationSpeed = 0.1;
        sprite.play();
        this.SetSpritePosition(sprite, new Vector2(player.x, player.y));
        sprite.zIndex = sprite.position.y;
        this.map.sortingLayer.addChild(sprite);
        player.sprite = sprite;
        player.textures = playerTextures;
    }

    public Update(deltaTime: number): void {
        this.ResetObscuring();
        this.players.forEach((player: Player) => {
            const direction: Vector2 = new Vector2(player.directionX, player.directionY);
            const newPosition: Vector2 = new Vector2(
                player.x + direction.x * this.PLAYER_SPEED * deltaTime,
                player.y + direction.y * this.PLAYER_SPEED * deltaTime
            );

            
            if (player.id === this.currentPlayer?.id) {
                const currentPosition: Vector2 = new Vector2(player.x, player.y);
                const collider: BoxObject = {x: 0, y: 0, width: this.playerCollider.width, height: this.playerCollider.height};
                const moveResult: MoveResult = TryMove(newPosition, currentPosition, direction, collider, this.map.colliders);

                newPosition.SetFromVector(moveResult.position);

                if (moveResult.hasCollided) {
                    this.engine.socketService.Send('CHANGE_DIRECTION', {
                        x: newPosition.x,
                        y: newPosition.y,
                        dx: moveResult.direction.x,
                        dy: moveResult.direction.y
                    });
                }

                this.iCantEven = this.ICantEven(collider);
            }
            player.x = newPosition.x;
            player.y = newPosition.y;
            this.SetSpritePosition(player.sprite, newPosition);
            player.sprite.zIndex = player.sprite.position.y;
            this.ComputeObscuring(player);
        });
        this.FollowPlayer();
    }

    private ICantEven(playerCollider: BoxObject): boolean {
        if (!this.currentPlayer) { return false; }
        for (const cantEven of this.map.cantEvens) {
            if (Colliding(playerCollider, cantEven)) {
                return true;
            }
        }
    }

    private ResetObscuring(): void {
        this.map.obscureLayer.forEach((sprite: PIXI.Sprite) => sprite.alpha = 1);
    }

    private ComputeObscuring(player: Player): void {
        const playerCollider: BoxObject = {
            x: player.sprite.x,
            y: player.sprite.y,
            width: player.sprite.width,
            height: player.sprite.height
        };
        const playerZ: number = player.sprite.zIndex;
        this.map.obscureLayer.forEach((sprite: PIXI.Sprite) => {
            if (sprite.zIndex > playerZ) {
                const collider: BoxObject = {
                    x: sprite.x,
                    y: sprite.y,
                    width: sprite.width,
                    height: sprite.height
                };
                if (Colliding(playerCollider, collider)) {
                    sprite.alpha = 0.5;
                }
            }
        });
    }

    private FollowPlayer(): void {
        if (this.currentPlayer) {
            let x: number = this.currentPlayer.x * this.GAME_SCALE
                + (this.currentPlayer.sprite.width / 2) - this.engine.app.screen.width / 2;
            let y: number = this.currentPlayer.y * this.GAME_SCALE
                + (this.currentPlayer.sprite.height / 2) - this.engine.app.screen.height / 2;

            x = Math.max(x, 0);
            x = Math.min(x, this.map.mapContainer.width - this.engine.app.screen.width);
            y = Math.max(y, 0);
            y = Math.min(y, this.map.mapContainer.height - this.engine.app.screen.height);

            this.map.mapContainer.position.set(Math.round(-x), Math.round(-y));
        }
    }

    public Input(): void {
        if (!this.isInRetro) {
            const input: InputController = this.engine.inputController;

            const oldDirection: Vector2 = new Vector2(
                this.currentPlayer.directionX,
                this.currentPlayer.directionY
            );

            const newDirection: Vector2 = new Vector2(0, 0);

            if (input.keys.UP) {
                newDirection.y -= 1;
            }
            if (input.keys.DOWN) {
                newDirection.y += 1;
            }
            if (input.keys.LEFT) {
                newDirection.x -= 1;
            }
            if (input.keys.RIGHT) {
                newDirection.x += 1;
            }

            if (oldDirection.x !== newDirection.x || oldDirection.y !== newDirection.y) {
                newDirection.Normalise();
                this.engine.socketService.Send('CHANGE_DIRECTION', {
                    x: this.currentPlayer.x,
                    y: this.currentPlayer.y,
                    dx: newDirection.x,
                    dy: newDirection.y
                });
            }
        }
    }
}
