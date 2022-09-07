import { PlayerDto } from './../../../models/Player';
import { AuthService } from './../../../services/auth.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { EngineService } from './../../../services/engine.service';
import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { faStickyNote, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'retro-specter',
  templateUrl: './specter.component.html',
  styleUrls: ['./specter.component.scss']
})
export class SpecterComponent implements AfterViewInit, OnInit {

  public retroId: string;
  public $player: Observable<PlayerDto>;
  public stickyNoteIcon: IconDefinition = faStickyNote;

  @ViewChild('retroCanvasContainer') canvasContainer: ElementRef;
  get CanvasContainer(): HTMLDivElement {
    return this.canvasContainer.nativeElement as HTMLDivElement;
  }

  get IsInRetro(): boolean {
    return this.engine.IsInRetro;
  }

  public get ICantEven(): boolean {
      return this.engine.canIEven;
  }

  public constructor(
    private engine: EngineService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  public ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe((params: Params) => {
      this.retroId = params.retroId;
    });
    this.$player = this.authService.GetActivePlayer();
  }

  public ngAfterViewInit(): void {
    this.$player.pipe(take(1)).subscribe((player: PlayerDto) => {
      this.engine.Init(this.CanvasContainer, player);
    });
  }

  public JoinRetro(): void {
    this.engine.EnterRetro();
  }

  public ExitRetro(): void {
    this.engine.LeaveRetro();
  }
}
