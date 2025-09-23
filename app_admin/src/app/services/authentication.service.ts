import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from './trip-data.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // Variable to handle Authentication Responses
  authResp: AuthResponse = new AuthResponse();

  // Setup our storage and service access
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService
  ) { }

  // Get our token from our Storage provider.
  public getToken(): string {
    let out: any;
    out = this.storage.getItem('travlr-token');
    if (!out) {
      return '';
    }
    return out;
  }

  // Save our token to our Storage provider.
  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
  }

  // Logout of our application and remove the JWT from Storage
  public logout(): void {
    this.storage.removeItem('travlr-token');
  }

  // Boolean to determine if we are logged in and the token is still valid
  public isLoggedIn(): boolean {
  const token = this.getToken();
  if (token && token.split('.').length === 3) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      console.error('Invalid token payload:', e);
      return false;
    }
  }
  return false;
}

  // Retrieve the current user
  public getCurrentUser(): User {
  const token = this.getToken();
  if (token && token.split('.').length === 3) {
    try {
      const { email, name } = JSON.parse(atob(token.split('.')[1]));
      return { email, name } as User;
    } catch (e) {
      console.error('Invalid token payload:', e);
    }
  }
  return { email: '', name: '' } as User;
}

  // Login method
  public login(user: User, passwd: string): Observable<AuthResponse> {
    return this.tripDataService.login(user, passwd).pipe(
      tap((value: AuthResponse) => {
        if (value) {
          this.authResp = value;
          this.saveToken(value.token);
        }
      })
    );
  }

  // Register method
  public register(user: User, passwd: string): Observable<AuthResponse> {
    return this.tripDataService.register(user, passwd).pipe(
      tap((value: AuthResponse) => {
        if (value) {
          this.authResp = value;
          this.saveToken(value.token);
        }
      })
    );
  }
}
