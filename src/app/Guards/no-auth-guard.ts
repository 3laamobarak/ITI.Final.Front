import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {User} from '../Services/user';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const user = inject(User);
  const router = inject(Router);
  if (user.isLoggedIn()) {
    router.navigate(['/home']);
    return false;
  }
  return true;
};
