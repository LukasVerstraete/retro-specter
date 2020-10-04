import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  public constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.IsAuthenticated().pipe(
      map((isAuthenticated: boolean) => {
        if (isAuthenticated === true) {
          return true;
        }
        return this.router.createUrlTree(['/login']);
      })
    );
  }

}
