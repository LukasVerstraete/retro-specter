export type Action = 'JOIN' | 'DISCONNECTED' | 'PLAYER_LIST' | 'CHANGE_DIRECTION';

export interface ActionRegistration {
    type: Action;
    callback: (data: any) => void;
}
