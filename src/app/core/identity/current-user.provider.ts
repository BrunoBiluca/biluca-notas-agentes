import { InjectionToken } from '@angular/core';

export interface CurrentUserProvider {
  getUserId(): string;
}

export const CURRENT_USER_PROVIDER = new InjectionToken<CurrentUserProvider>(
  'CURRENT_USER_PROVIDER',
);

export const LOCAL_USER_PROVIDER: CurrentUserProvider = {
  getUserId: () => 'local-user',
};
