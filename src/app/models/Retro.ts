import { RetroColumn } from './RetroColumn';
import { RetroPlayer } from './RetroPlayer';

export interface Retro {
    id: string;
    name: string;
    players: RetroPlayer[];
    columns: RetroColumn[];
    actionPoints: string[];
}
