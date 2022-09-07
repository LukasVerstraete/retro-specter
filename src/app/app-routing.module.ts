import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { AdminComponent } from './components/pages/admin/admin.component';
import { AuthGuard } from './services/auth.guard';
import { SpecterComponent } from './components/pages/specter/specter.component';
import { LoginComponent } from './components/pages/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'retro/:retroId', component: SpecterComponent, canActivate: [AuthGuard]},
  {path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
