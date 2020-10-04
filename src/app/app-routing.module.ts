import { AuthGuard } from './services/auth.guard';
import { SpecterComponent } from './components/pages/specter/specter.component';
import { LoginComponent } from './components/pages/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {path: '', component: SpecterComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'specter', component: SpecterComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
