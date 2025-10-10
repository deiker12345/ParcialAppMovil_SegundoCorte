import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      switchMap(isAuth => {
        if (!isAuth) {
          this.router.navigate(['/login']);
          return [false];
        }

        const currentUserId = this.authService.getCurrentUserId();
        if (!currentUserId) {
          this.router.navigate(['/login']);
          return [false];
        }

        return from(this.userService.getUserById(currentUserId)).pipe(
          map(user => {
            if (!user) {
              this.router.navigate(['/profile']);
              return false;
            }

            // Verificar que el perfil esté completo
            const isProfileComplete = this.isProfileComplete(user);
            if (!isProfileComplete) {
              this.router.navigate(['/profile']);
              return false;
            }

            return true;
          })
        );
      })
    );
  }

  private isProfileComplete(user: any): boolean {
    return !!(
      user.name?.trim() &&
      user.lastName?.trim() &&
      user.city?.trim() &&
      user.country?.trim() &&
      user.photos?.length > 0
    );
  }
}