export interface Player {
    id: string;
    name: string;
    isOnline: boolean;
    isCurrent: boolean;
    directionX: number;
    directionY: number;
    positionX: number;
    positionY: number;
}

export interface PlayerDTO {
    id: string;
    name: string;
    isOnline: boolean;
    directionX: number;
    directionY: number;
    positionX: number;
    positionY: number;
}

export function GetPlayerDTO(player: Player): PlayerDTO {
    const dto: PlayerDTO = {
        ...player
    };

    delete player.isCurrent;

    return dto;
}
