import { Note } from './Note';

export interface RetroColumn {
    id: string;
    title: string;
    notes: Note[];
    order: number;
}
