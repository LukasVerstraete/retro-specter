import * as PIXI from 'pixi.js';

export interface PlayerAnimations {
    lookDown: PIXI.Texture;
    lookUp: PIXI.Texture;
    lookLeft: PIXI.Texture;
    lookRight: PIXI.Texture;
    walkDown: PIXI.Texture[];
    walkUp: PIXI.Texture[];
    walkLeft: PIXI.Texture[];
    walkRight: PIXI.Texture[];
}

export interface WorldMap {
    mapContainer: PIXI.Container;
    mapLayers: PIXI.Container[];
    sortingLayer: PIXI.Container;
    obscureLayer: PIXI.Sprite[];
    colliders: BoxObject[];
    cantEvens: BoxObject[];
    spawnPoint: BoxObject;
    gameRoom: BoxObject;
}

export interface BoxObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type MAP_LAYER_TYPE = 'objectgroup' | 'tilelayer';

export async function LoadSpriteMap(loader: PIXI.Loader, data: any, callback: (map: PIXI.Sprite) => void): Promise<void> {
    const mapWidth: number = data.layers[0].width;
    const mapHeight: number = data.layers[0].height;
    const spriteWidth: number = data.tilesets[0].tilewidth;
    const spriteHeight: number = data.tilesets[0].tileheight;

    const spriteSheetImage: HTMLImageElement = new Image();

    spriteSheetImage.onload = async () => {
        const promises: Promise<ImageBitmap>[] = [];
        for (let y = 0; y < data.tilesets[0].tilecount / data.tilesets[0].columns; y++) {
            for (let x = 0; x < data.tilesets[0].columns; x++) {
                promises.push(createImageBitmap(
                    spriteSheetImage,
                    spriteWidth * x,
                    spriteHeight * y,
                    spriteWidth,
                    spriteHeight
                ));
            }
        }
        const sprites: ImageBitmap[] = await Promise.all(promises);
        const mapData: number[] = data.layers[0].data;

        const canvas: OffscreenCanvas = new OffscreenCanvas(
            mapWidth * spriteWidth,
            mapHeight * spriteHeight
        );
        const ctx: OffscreenCanvasRenderingContext2D = canvas.getContext('2d');

        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                ctx.drawImage(
                    sprites[mapData[x + mapWidth * y] - 1],
                    x * spriteWidth,
                    y * spriteHeight,
                    spriteWidth,
                    spriteHeight
                );
            }
        }
        loader.add('plantyn_layer', await createImageBitmap(canvas));
    };

    spriteSheetImage.src = data.tilesets[0].image;
}

export function CreateWorldMap(mapData: any, textureMap: PIXI.Texture): WorldMap {

    const textures: PIXI.Texture[] = LoadTextures(mapData, textureMap);
    const container: PIXI.Container = new PIXI.Container();
    const layers: any[] = mapData.layers;
    const mapLayers: PIXI.Container[] = [];
    const sortingLayer: PIXI.Container = new PIXI.Container();
    sortingLayer.sortableChildren = true;
    const obscureLayer: PIXI.Sprite[] = [];
    sortingLayer.sortableChildren = true;
    const mapWidth: number = mapData.width;
    const mapHeight: number = mapData.height;
    let gameRoom: BoxObject;

    let spawnPoint: BoxObject;
    const colliders: BoxObject[] = [];
    const cantEvens: BoxObject[] = [];

    layers.forEach((mapLayer: any) => {
        const layerType: MAP_LAYER_TYPE = mapLayer.type;
        const layerContainer: PIXI.Container = new PIXI.Container();
        const layerName: string = mapLayer.name;
        const isSortLayer: boolean = mapLayer.properties.find((property: any) => property.name === 'sort_layer').value;
        const isForeground: boolean = mapLayer.properties.find((property: any) => property.name === 'foreground').value;
        const isBackground: boolean = mapLayer.properties.find((property: any) => property.name === 'background').value;
        const isObscuring: boolean = mapLayer.properties.find((property: any) => property.name === 'obscuring').value;

        if (layerName === 'Spawnpoint') {
            const spawnObject: any = mapLayer.objects[0];
            spawnPoint = {x: spawnObject.x - 16, y: spawnObject.y - 16, width: 0, height: 0};
        } else if (layerName === 'Collision') {
            const objects: any[] = mapLayer.objects;
            objects.forEach((collider: any) => {
                const x: number = Math.round(collider.x);
                const y: number = Math.round(collider.y);
                const width: number = Math.round(collider.width);
                const height: number = Math.round(collider.height);
                colliders.push({x, y, width, height});
            });
        } else if (layerName === 'GameRoom') {
            const rawObject: any = mapLayer.objects[0];
            gameRoom = {
                x: Math.round(rawObject.x),
                y: Math.round(rawObject.y),
                width: Math.round(rawObject.width),
                height: Math.round(rawObject.height)
            };
        } else if (layerName === 'cant_even') {
            const objects: any[] = mapLayer.objects;
            objects.forEach((cantEven: any) => {
                const x: number = Math.round(cantEven.x);
                const y: number = Math.round(cantEven.y);
                const width: number = Math.round(cantEven.width);
                const height: number = Math.round(cantEven.height);
                cantEvens.push({x, y, width, height});
            });
        } else {
            if (layerType === 'tilelayer') {
                const layerData: number[] = mapLayer.data;
                for (let x = 0; x < mapWidth; x++) {
                    for (let y = 0; y < mapHeight; y++) {
                        const index: number = (x + mapWidth * y);
                        if (layerData[index] !== 0) {
                            const texture: PIXI.Texture = textures[layerData[index] - 1];
                            const sprite: PIXI.Sprite = new PIXI.Sprite(texture);
                            sprite.position.set(x * sprite.width, y * sprite.height);
                            if (isSortLayer) {
                                sortingLayer.addChild(sprite);
                            } else {
                                if (isBackground) { sprite.zIndex = -1; }
                                if (isForeground) { sprite.zIndex = mapHeight * 16; }
                                layerContainer.addChild(sprite);
                            }
                            if (isObscuring) {
                                obscureLayer.push(sprite);
                            }
                        }
                    }
                }
            }

            if (layerType === 'objectgroup') {
                const objects: any[] = mapLayer.objects;
                objects.forEach((layerObject: any) => {
                    const index: number = layerObject.gid;
                    const texture: PIXI.Texture = textures[index - 1];
                    const sprite: PIXI.Sprite = new PIXI.Sprite(texture);
                    const x: number = layerObject.x;
                    const y: number = layerObject.y;
                    sprite.position.set(x, y - sprite.height);
                    if (isSortLayer) {
                        sortingLayer.addChild(sprite);
                    } else {
                        layerContainer.addChild(sprite);
                    }
                });
            }

            if (!isSortLayer) {
                if (isForeground) {
                    layerContainer.zIndex = mapHeight * 16;
                }
                if (isBackground) {
                    layerContainer.zIndex = -1;
                }
                if (!isObscuring) {
                    layerContainer.cacheAsBitmap = true;
                }
                mapLayers.push(layerContainer);
                container.addChild(layerContainer);
            }
        }
    });

    SetSortingLayerZIndex(sortingLayer);
    container.addChild(sortingLayer);

    container.sortChildren();
    return {
        mapContainer: container,
        mapLayers,
        colliders,
        spawnPoint,
        sortingLayer,
        obscureLayer,
        gameRoom,
        cantEvens
    };
}

function SetSortingLayerZIndex(sortingLayer: PIXI.Container): void {
    sortingLayer.children.forEach((child: PIXI.DisplayObject) => {
        child.zIndex = child.y;
    });
}

export function LoadTextures(data: any, textureMap: PIXI.Texture): PIXI.Texture[] {
    const spriteWidth: number = data.tilesets[0].tilewidth;
    const spriteHeight: number = data.tilesets[0].tileheight;
    const textureMapWidth: number = textureMap.width;
    const textureMapHeight: number = textureMap.height;

    const textures: PIXI.Texture[] = [];

    for (let y = 0; y < textureMapHeight / spriteHeight; y++) {
        for (let x = 0; x < textureMapWidth / spriteWidth; x++) {
            textures.push(new PIXI.Texture(
                textureMap.baseTexture,
                new PIXI.Rectangle(
                    x * spriteWidth,
                    y * spriteHeight,
                    spriteWidth,
                    spriteHeight
                )
            ));
        }
    }

    return textures;
}

export function LoadPlayerAnimations(
    spriteSheetIndex: number,
    textureMap: PIXI.Texture,
    playerSpriteWidth: number,
    playerSpriteHeight: number
): PlayerAnimations {
    const x: number = spriteSheetIndex * playerSpriteWidth;
    const lookDown: PIXI.Texture = new PIXI.Texture(
        textureMap.baseTexture,
        new PIXI.Rectangle(x, 0 * playerSpriteHeight, playerSpriteWidth, playerSpriteHeight)
    );
    const lookUp: PIXI.Texture = new PIXI.Texture(
        textureMap.baseTexture,
        new PIXI.Rectangle(x, 9 * playerSpriteHeight, playerSpriteWidth, playerSpriteHeight)
    );
    const lookLeft: PIXI.Texture = new PIXI.Texture(
        textureMap.baseTexture,
        new PIXI.Rectangle(x, 6 * playerSpriteHeight, playerSpriteWidth, playerSpriteHeight)
    );
    const lookRight: PIXI.Texture = new PIXI.Texture(
        textureMap.baseTexture,
        new PIXI.Rectangle(x, 3 * playerSpriteHeight, playerSpriteWidth, playerSpriteHeight)
    );
    const walkDown: PIXI.Texture[] = CreateWalkAnimationTextures(x, 0, textureMap, playerSpriteWidth, playerSpriteHeight);
    const walkUp: PIXI.Texture[] = CreateWalkAnimationTextures(x, 9, textureMap, playerSpriteWidth, playerSpriteHeight);
    const walkLeft: PIXI.Texture[] = CreateWalkAnimationTextures(x, 6, textureMap, playerSpriteWidth, playerSpriteHeight);
    const walkRight: PIXI.Texture[] = CreateWalkAnimationTextures(x, 3, textureMap, playerSpriteWidth, playerSpriteHeight);

    return {
        lookDown,
        lookUp,
        lookLeft,
        lookRight,
        walkDown,
        walkUp,
        walkLeft,
        walkRight
    };
}

function CreateWalkAnimationTextures(
    x: number,
    startYIndex: number,
    textureMap: PIXI.Texture,
    playerSpriteWidth: number,
    playerSpriteHeight: number
): PIXI.Texture[] {
    return [
        new PIXI.Texture(
            textureMap.baseTexture,
            new PIXI.Rectangle(x, (startYIndex + 1) * playerSpriteHeight, playerSpriteWidth, playerSpriteHeight)
        ),
        new PIXI.Texture(
            textureMap.baseTexture,
            new PIXI.Rectangle(x, startYIndex * playerSpriteHeight, playerSpriteWidth, playerSpriteHeight)
        ),
        new PIXI.Texture(
            textureMap.baseTexture,
            new PIXI.Rectangle(x, (startYIndex + 2) * playerSpriteHeight, playerSpriteWidth, playerSpriteHeight)
        ),
        new PIXI.Texture(
            textureMap.baseTexture,
            new PIXI.Rectangle(x, startYIndex * playerSpriteHeight, playerSpriteWidth, playerSpriteHeight)
        )
    ];
}
