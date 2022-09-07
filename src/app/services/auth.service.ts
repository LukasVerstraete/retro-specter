import { Player, PlayerDto } from './../models/Player';
import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public constructor(
    private afAuth: AngularFireAuth,
    private fireStore: AngularFirestore
  ) { }

  public GetActivePlayer(): Observable<PlayerDto> {
    return this.afAuth.authState.pipe(
      switchMap((fireUser: User) => {
        if (fireUser) {
          const userId: string = fireUser.uid;
          return this.fireStore.doc<PlayerDto>(`players/${userId}`).valueChanges();
        }
        return of(null);
      })
    );
  }

  public IsAuthenticated(): Observable<boolean> {
    return this.GetActivePlayer().pipe(
      take(1),
      map((player: PlayerDto) => {
        return player !== null;
      })
    );
  }

  public async Login(email: string, password: string): Promise<void> {
    await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  public SetPlayerPosition(playerId: string, positionX: number, positionY: number): Observable<void> {
    return from(this.fireStore.doc<PlayerDto>(`players/${playerId}`).update({positionX, positionY}));
  }
}
