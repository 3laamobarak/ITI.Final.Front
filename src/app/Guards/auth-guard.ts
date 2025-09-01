import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { User } from '../Services/user';

export const authGuard: CanActivateFn = (route, state) => {
  const user = inject(User);
  return user.isLoggedIn();
};
