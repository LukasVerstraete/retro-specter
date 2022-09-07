import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { RetroService } from './../../../services/retro.service';
import { Component, OnInit } from '@angular/core';
import { Retro } from 'src/app/models/Retro';
import { map, tap } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { RetroColumn } from 'src/app/models/RetroColumn';
import { faTrash, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'retro-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public $retros: Observable<Retro[]>;
  public retroForm: FormGroup;
  public columnNames: string[] = [];
  public baseUrl: string = window.location.origin;

  public trashIcon: IconDefinition = faTrash;

  public constructor(
    private retroService: RetroService,
    private fromBuilder: FormBuilder
  ) { }

  public ngOnInit(): void {
    this.$retros = this.retroService.GetRetros().pipe(
      tap((retros: Retro[]) => {
        retros.forEach(() => {
          this.columnNames.push('');
        });
      }),
      map((retros: Retro[]) => {
        retros.forEach((retro: Retro) => {
          retro.columns = retro.columns.sort((c1: RetroColumn, c2: RetroColumn) => c1.order - c2.order);
        });
        return retros;
      })
    );
    this.retroForm = this.fromBuilder.group({
      name: ''
    });
  }
  public CreateRetro(): void {
    if (this.retroForm.value.name.length) {
      this.retroService.CreateRetro(this.retroForm.value.name);
      this.retroForm.reset();
    }
  }

  public CreateColumn(retroId: string, index: number, order: number): void {
    if (this.columnNames[index].length) {
      this.retroService.AddColumn(retroId, this.columnNames[index], order);
      this.columnNames[index] = '';
    }
  }

  public dropColumn(retroId: string, columns: RetroColumn[], event: CdkDragDrop<RetroColumn[]>) {
    moveItemInArray(columns, event.previousIndex, event.currentIndex);
    this.retroService.ReOrderColumns(retroId, columns);
  }

  public DeleteColumn(retroId: string, columnId: string): void {
    this.retroService.DeleteColumn(retroId, columnId);
  }

  public DeleteRetro(retroId: string): void {
    this.retroService.DeleteRetro(retroId);
  }
}
