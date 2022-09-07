import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public constructor(
    private store: AngularFirestore,
    private auth: AuthService
  ) {}
}
