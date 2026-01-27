import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  public sidebarCollapsed$: Observable<boolean> =
    this.sidebarCollapsedSubject.asObservable();

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
  }

  getSidebarCollapsed(): boolean {
    return this.sidebarCollapsedSubject.value;
  }
}
