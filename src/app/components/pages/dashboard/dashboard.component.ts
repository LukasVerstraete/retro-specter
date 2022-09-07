import { Note } from 'src/app/models/Note';
import { map, switchMap } from 'rxjs/operators';
import { faPlay, faUserFriends, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Observable, combineLatest } from 'rxjs';
import { RetroService } from './../../../services/retro.service';
import { Component, OnInit } from '@angular/core';
import { Retro } from 'src/app/models/Retro';
import { RetroColumn } from 'src/app/models/RetroColumn';

@Component({
  selector: 'retro-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public $retros: Observable<Retro[]>;
  public playIcon: IconDefinition = faPlay;
  public peopleIcon: IconDefinition = faUserFriends;
  public openMarkdown: {[id: string]: boolean} = {};

  public constructor(public retroService: RetroService) { }

  public ngOnInit(): void {
    this.$retros = this.retroService.GetRetros().pipe(
        switchMap((retros: Retro[]) => {
            const observables: Observable<Retro>[] = retros.map((retro: Retro) => {
                return this.retroService.GetColumnsWithNotes(retro.id).pipe(
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

  public GetColumns(retroId: string): Observable<RetroColumn[]> {
      return this.retroService.GetColumnsWithNotes(retroId);
  }

  public GetRetroMarkdown(retro: Retro): string {
      let markdown = '';
      markdown += `# ${retro.name} \n`;
      markdown += '## Action Points \n';
      retro.actionPoints.forEach((actionPoint: string) => {
          markdown += `* ${actionPoint.trim()} \n`;
      });
      markdown += '\n';
      retro.columns.forEach((column: RetroColumn) => {
        markdown += `## ${column.title} \n`;
        column.notes.forEach((note: Note) => {
            markdown += `* ${note.text.trim()} \n`;
        });
        markdown += '\n';
      });
      return markdown;
  }

  public IsMarkdownOpen(retroId: string): boolean {
      return this.openMarkdown[retroId];
  }

  public ToggleMarkdown(retroId: string): void {
      if (this.openMarkdown[retroId] === undefined) {
          this.openMarkdown[retroId] = false;
      }
      this.openMarkdown[retroId] = !this.openMarkdown[retroId];
  }
}
