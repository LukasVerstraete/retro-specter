import { Action, ActionRegistration } from './../models/engine/Actions';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private connection: SocketIOClient.Socket;

  public constructor() { }

  public Connect(): void {
    // this.connection = io('wss://retro-specter.ew.r.appspot.com');
    this.connection = io('ws://localhost:8080');
  }

  public SetupActions(actions: ActionRegistration[]): void {
    actions.forEach((action: ActionRegistration) => {
      this.RegisterAction(action.type, action.callback);
    });
  }

  private RegisterAction(action: Action, callback: (data: any) => void): void {
    this.connection.on(action, (data: any) => {
      callback(data);
    });
  }

  public Send(action: Action, data: any): void {
    this.connection.emit(action, data);
  }
}
