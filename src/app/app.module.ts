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

@NgModule({
  declarations: [
    RetroComponent,
    LoginComponent,
    SpecterComponent,
    PostItComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig.firebase),
    AngularFirestoreModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [RetroComponent]
})
export class AppModule { }
