import { Player } from './../models/Player';
import { RetroPlayer } from './../models/RetroPlayer';
import { map, switchMap, take } from 'rxjs/operators';
import { RetroColumn } from './../models/RetroColumn';
import { Retro } from './../models/Retro';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { combineLatest, from, Observable } from 'rxjs';
import { Note } from '../models/Note';

@Injectable({
  providedIn: 'root'
})
export class RetroService {

  public constructor(
    private store: AngularFirestore
  ) { }

  public GetRetros(): Observable<Retro[]> {
    return this.store.collection<Retro>('retros').valueChanges().pipe(
      switchMap((retros: Retro[]) => {
        const observables: Observable<Retro>[] = retros.map((retro: Retro) => {
          return this.store.collection<RetroColumn>(`retros/${retro.id}/columns`).valueChanges().pipe(
            map((columns: RetroColumn[]) => {
              retro.columns = columns;
              return retro;
            })
          );
        });

        return combineLatest(observables);
      })
    );
  }

  public GetRetro(retroId: string): Observable<Retro> {
    return this.store.doc<Retro>(`retros/${retroId}`).valueChanges().pipe(
      switchMap((retro: Retro) => {
        return this.store.collection<RetroColumn>(`retros/${retroId}/columns`).valueChanges().pipe(
          map((columns: RetroColumn[]) => {
            retro.columns = columns.sort((c1: RetroColumn, c2: RetroColumn) => c1.order - c2.order);
            return retro;
          })
        );
      })
    );
  }

  public GetBasicRetro(retroId: string): Observable<Retro> {
      return this.store.doc<Retro>(`retros/${retroId}`).valueChanges();
  }

  public CreateRetro(name: string): Observable<void> {
    const retro: Retro = {
      id: this.store.createId(),
      name,
      players: [],
      columns: [],
      actionPoints: [],
    };

    return from(this.store.doc<Retro>(`retros/${retro.id}`).set(retro));
  }

  public AddColumn(retroId: string, columnName: string, order: number): Observable<void> {
    const column: RetroColumn = {
      id: this.store.createId(),
      title: columnName,
      notes: [],
      order
    };

    return from(this.store.doc<RetroColumn>(`retros/${retroId}/columns/${column.id}`).set(column));
  }

  public ReOrderColumns(retroId: string, columns: RetroColumn[]): Observable<void> {
    const batch: firebase.firestore.WriteBatch = this.store.firestore.batch();

    columns.forEach((column: RetroColumn, index: number) => {
      const columnDocument: DocumentReference = this.store.doc<RetroColumn>(`retros/${retroId}/columns/${column.id}`).ref;
      batch.update(columnDocument, {order: index});
    });

    return from(batch.commit()).pipe(take(1));
  }

  public DeleteRetro(retroId: string): Observable<void> {
    return from(this.store.doc<Retro>(`retros/${retroId}`).delete());
  }

  public DeleteColumn(retroId: string, columnId: string): Observable<void> {
    return from(this.store.doc<RetroColumn>(`retros/${retroId}/columns/${columnId}`).delete());
  }

  public AddPlayer(retroId: string, playerId: string): Observable<void> {
    const player: RetroPlayer = {
      id: playerId,
      notes: []
    };

    return from(this.store.doc<RetroPlayer>(`retros/${retroId}/players/${playerId}`).set(player));
  }

  public AddPlayerNote(retroId: string, playerId: string, text: string): Observable<void> {
      return this.store.doc<Player>(`players/${playerId}`).valueChanges().pipe(
          take(1),
          switchMap((player: Player) => {
            const note: Note = {
                id: this.store.createId(),
                text,
                by: player.name
            };
            return from(this.store.doc<Note>(`retros/${retroId}/players/${playerId}/notes/${note.id}`).set(note));
        })
    );

  }

  public AddColumnsNoteFromPlayer(retroId: string, playerId: string, noteId: string, columnId: string): Observable<void> {
    return this.store.doc<Note>(`retros/${retroId}/players/${playerId}/notes/${noteId}`).valueChanges().pipe(
      take(1),
      switchMap((note: Note) => {
        return from(this.store.doc<Note>(`retros/${retroId}/players/${playerId}/notes/${noteId}`).delete()).pipe(
          switchMap(() => {
            return from(this.store.doc<Note>(`retros/${retroId}/columns/${columnId}/notes/${noteId}`).set(note));
          })
        );
      })
    );
  }

  public MoveNoteBetweenColumns(retroId: string, note: Note, currentColumnId: string, newColumnId: string): Observable<void> {
    return from(this.store.doc<Note>(`retros/${retroId}/columns/${currentColumnId}/notes/${note.id}`).delete()).pipe(
        take(1),
        switchMap(() => {
            return from(this.store.doc<Note>(`retros/${retroId}/columns/${newColumnId}/notes/${note.id}`).set(note));
        })
    );
  }

  public GetPlayerNotes(retroId: string, playerId): Observable<Note[]> {
    return this.store.collection<Note>(`retros/${retroId}/players/${playerId}/notes`).valueChanges();
  }

  public GetColumnsWithNotes(retroId: string): Observable<RetroColumn[]> {
    return this.store.collection<RetroColumn>(`retros/${retroId}/columns`).valueChanges().pipe(
      switchMap((columns: RetroColumn[]) => {
        const observables: Observable<RetroColumn>[] = columns.map((column: RetroColumn) => {
          return this.store.collection<Note>(`retros/${retroId}/columns/${column.id}/notes`).valueChanges().pipe(
            map((notes: Note[]) => {
              column.notes = notes;
              return column;
            })
          );
        });

        return combineLatest(observables);
      })
    );
  }

  public SaveActionPoints(retroId: string, actionPoints: string[]): Observable<void> {
      return from(this.store.doc<Retro>(`retros/${retroId}`).update({actionPoints}));
  }
}
