import { RetroColumn } from './../../models/RetroColumn';
import { faArrowsAlt, faChevronLeft, faPlus, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faLaugh } from '@fortawesome/free-regular-svg-icons';
import { RetroService } from './../../services/retro.service';
import { Observable } from 'rxjs';
import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Retro } from 'src/app/models/Retro';
import { Note } from 'src/app/models/Note';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { take, tap } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Container } from 'pixi.js';

@Component({
  selector: 'retro-retro-board',
  templateUrl: './retro-board.component.html',
  styleUrls: ['./retro-board.component.scss']
})
export class RetroBoardComponent implements OnInit {

  @Input() retroId: string;
  @Input() playerId: string;
  @Output() closeBoard: EventEmitter<void> = new EventEmitter();
  @ViewChild('newNote') noteTextArea: ElementRef<HTMLTextAreaElement>;
  public $retroColumns: Observable<RetroColumn[]>;
  public $playerNotes: Observable<Note[]>;
  public $retro: Observable<Retro>;
  public newNoteText = '';
  public showEmojiPicker = false;
  public emojiIcon: IconDefinition = faLaugh;
  public dragIcon: IconDefinition = faArrowsAlt;
  public closeIcon: IconDefinition = faTimes;
  public addIcon: IconDefinition = faPlus;
  public chevronIcon: IconDefinition = faChevronLeft;
  public playerNoteContainerId = 'player-notes';
  public newActionPoint = '';
  public showActionPoints = false;

  public constructor(
    private retroService: RetroService
  ) { }

  public ngOnInit(): void {
    this.$retroColumns = this.retroService.GetColumnsWithNotes(this.retroId);
    this.$playerNotes = this.retroService.GetPlayerNotes(this.retroId, this.playerId);
    this.$retro = this.retroService.GetBasicRetro(this.retroId);
  }

  public EmojiSelected($event: EmojiEvent): void {
    const { selectionStart, selectionEnd } = this.noteTextArea.nativeElement;
    const beforeSelection: string = this.newNoteText.substr(0, selectionStart);
    const afterSelection: string = this.newNoteText.substr(selectionEnd, this.newNoteText.length);

    if (selectionStart || selectionStart === 0) {
      this.newNoteText = `${beforeSelection}${$event.emoji.native}${afterSelection}`;
    }
  }

  public AddPlayerNote(): void {
    this.retroService.AddPlayerNote(this.retroId, this.playerId, this.newNoteText).pipe(take(1)).subscribe(() => {
      this.newNoteText = '';
    });
  }

  public NoteDropped(event: CdkDragDrop<RetroColumn>) {
    if (event.container.id !== event.previousContainer.id) {
      if (event.previousContainer.id === this.playerNoteContainerId) {
        this.retroService.AddColumnsNoteFromPlayer(this.retroId, this.playerId, event.item.data.id, event.container.data.id).subscribe();
      } else {
        this.retroService
            .MoveNoteBetweenColumns(this.retroId, event.item.data, event.previousContainer.data.id, event.container.data.id)
            .subscribe();
      }
    }
  }

  public CloseRetroBoard(): void {
    this.closeBoard.emit();
  }

  public addActionPoint(retro: Retro): void {
    if (this.newActionPoint.length === 0) { return; }
    const actionPoints: string[] = [...retro.actionPoints, this.newActionPoint];
    this.retroService.SaveActionPoints(retro.id, actionPoints).pipe(take(1)).subscribe(() => {
        this.newActionPoint = '';
    });
  }

  public removeActionPoint(retro: Retro, index: number): void {
    let newActions: string[] = retro.actionPoints;
    newActions = [...newActions.slice(0, index), ...newActions.slice(index + 1, newActions.length)];

    this.retroService.SaveActionPoints(retro.id, [...newActions]);
  }
}
