import { faExclamationTriangle, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'retro-cant-even',
  templateUrl: './cant-even.component.html',
  styleUrls: ['./cant-even.component.scss']
})
export class CantEvenComponent implements OnInit {


  public alertIcon: IconDefinition = faExclamationTriangle;

  public constructor() { }

  public ngOnInit(): void {
  }

}
