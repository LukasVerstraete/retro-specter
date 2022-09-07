import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'retro-start-game',
  templateUrl: './start-game.component.html',
  styleUrls: ['./start-game.component.scss']
})
export class StartGameComponent {

  @Output() joined: EventEmitter<void> = new EventEmitter();

  public constructor() { }

  public Join(): void {
    this.joined.emit();
  }

}
