import { PlayerAnimations } from './engine/graphics/SpriteMap';
import * as PIXI from 'pixi.js';

export interface Player {
    id: string;
    name: string;
    x: number;
    y: number;
    directionX: number;
    directionY: number;
    sprite: PIXI.AnimatedSprite;
    isCurrent: boolean;
    textures: PlayerAnimations;
    textureIndex: number;
}

export interface PlayerDto {
    id: string;
    positionX: number;
    positionY: number;
    textureIndex: number;
    name: string;
}
