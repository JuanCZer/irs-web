import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  fetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    return fetch(input, {
      ...init,
      credentials: 'include',
      headers: new Headers(init.headers),
    });
  }
}
