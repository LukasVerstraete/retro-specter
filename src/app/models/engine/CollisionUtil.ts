import { BoxObject } from './graphics/SpriteMap';
export class Vector2 {

    public constructor(public x: number, public y: number) {}

    public Normalise(): void {
        const length: number = this.Length();
        if (length > 0) {
            this.x = this.x / length;
            this.y = this.y / length;
        }
    }

    public Set(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public SetFromVector(vector: Vector2): void {
        this.x = vector.x;
        this.y = vector.y;
    }

    public Normalized(): Vector2 {
        const normalized: Vector2 = new Vector2(this.x, this.y);
        normalized.Normalise();
        return normalized;
    }

    public Length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public Copy(): Vector2 {
        return new Vector2(this.x, this.y);
    }
}

export interface MoveResult {
    position: Vector2;
    direction: Vector2;
    hasCollided: boolean;
}


export function TryMove(
    newPosition: Vector2,
    position: Vector2,
    direction: Vector2,
    playerCollider: BoxObject,
    colliders: BoxObject[]
): MoveResult {
    const result: MoveResult = {
        hasCollided: false,
        position: newPosition.Copy(),
        direction: direction.Copy()
    };
    playerCollider.x = newPosition.x;
    playerCollider.y = newPosition.y;
    colliders.forEach((collider: BoxObject) => {
        if (Colliding(playerCollider, collider)) {
            result.hasCollided = true;
            TryMoveX(position, playerCollider.width, playerCollider.height, result, collider);
            const xPosition: Vector2 = new Vector2(result.position.x, position.y);
            TryMoveY(xPosition, playerCollider.width, playerCollider.height, result, collider);
        }
    });

    return result;
}

function TryMoveX(
    position: Vector2,
    playerWidth: number,
    playerHeight: number,
    result: MoveResult,
    collider: BoxObject
): void {
    const playerCollider: BoxObject = {
        x: result.position.x,
        y: position.y,
        width: playerWidth,
        height: playerHeight
    };
    const xCollision: boolean = Colliding(playerCollider, collider);
    if (!xCollision) { return; }
    if (result.direction.x > 0) {
        result.position.x = collider.x - playerWidth;
        result.direction.x = 0;
        return;
    }
    if (result.direction.x < 0) {
        result.position.x = collider.x + collider.width;
        result.direction.x = 0;
        return;
    }
}

function TryMoveY(
    position: Vector2,
    playerWidth: number,
    playerHeight: number,
    result: MoveResult,
    collider: BoxObject
): void {
    const playerCollider: BoxObject = {
        x: position.x,
        y: result.position.y,
        width: playerWidth,
        height: playerHeight
    };
    const yCollision: boolean = Colliding(playerCollider, collider);
    if (!yCollision) { return; }

    if (result.direction.y > 0) {
        result.position.y = collider.y - playerHeight;
        result.direction.y = 0;
        return;
    }
    if (result.direction.y < 0) {
        result.position.y = collider.y + collider.height;
        result.direction.y = 0;
        return;
    }
}

export function Colliding(object1: BoxObject, object2: BoxObject): boolean {
    return object1.x < object2.x + object2.width &&
        object1.x + object1.width > object2.x &&
        object1.y < object2.y + object2.height &&
        object1.y + object1.height > object2.y;
}
