import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { verifydoneGuard } from './verifydone-guard';

describe('verifydoneGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => verifydoneGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
