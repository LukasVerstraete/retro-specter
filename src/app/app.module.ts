import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { firebaseConfig } from './config/FirebaseConfig';

import { AppRoutingModule } from './app-routing.module';
import { RetroComponent } from './retro.component';
import { LoginComponent } from './components/pages/login/login.component';
import { SpecterComponent } from './components/pages/specter/specter.component';
import { PostItComponent } from './components/post-it/post-it.component';
import { StartGameComponent } from './components/start-game/start-game.component';
import { AdminComponent } from './components/pages/admin/admin.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RetroBoardComponent } from './components/retro-board/retro-board.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { CantEvenComponent } from './components/cant-even/cant-even.component';

@NgModule({
  declarations: [
    RetroComponent,
    LoginComponent,
    SpecterComponent,
    PostItComponent,
    StartGameComponent,
    AdminComponent,
    RetroBoardComponent,
    DashboardComponent,
    CantEvenComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig.firebase),
    AngularFirestoreModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    DragDropModule,
    PickerModule
  ],
  providers: [],
  bootstrap: [RetroComponent]
})
export class AppModule { }
