import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GetPlayerDTO, Player, PlayerDTO } from '../models/Player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public constructor(
    private store: AngularFirestore,
    private auth: AuthService
  ) {

  }

  public GetPlayers(): Observable<Player[]> {
    return this.store.collection<Player>('players', ref => ref.where('isOnline', '==', true))
      .valueChanges().pipe(
        switchMap((players: Player[]) => {
          return this.auth.GetActivePlayer().pipe(
            map((activePlayer: Player) => {
              return players.map((player: Player) => {
                player.isCurrent = player.id === activePlayer.id;
                return player;
              });
            })
          );
        })
      );
  }

  public async SetDirection(player: Player): Promise<void> {
    await this.store.doc<PlayerDTO>(`players/${player.id}`).set(GetPlayerDTO(player));
  }
}
