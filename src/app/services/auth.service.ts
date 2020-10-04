import { Player } from './../models/Player';
import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
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

  public GetActivePlayer(): Observable<Player> {
    return this.afAuth.authState.pipe(
      switchMap((fireUser: User) => {
        if (fireUser) {
          const userId: string = fireUser.uid;
          return this.fireStore.doc<Player>(`players/${userId}`).valueChanges();
        }
        return of(null);
      })
    );
  }

  public IsAuthenticated(): Observable<boolean> {
    return this.GetActivePlayer().pipe(
      take(1),
      map((player: Player) => {
        return player !== null;
      })
    );
  }

  public async Login(email: string, password: string): Promise<void> {
    await this.afAuth.signInWithEmailAndPassword(email, password);
    await this.GetActivePlayer().pipe(
      tap((player: Player) => {
        if (player) {
          player.isOnline = true;
          this.fireStore.doc<Player>(`players/${player.id}`).set(player);
        }
      }),
      take(1)
    ).toPromise();
  }
}
