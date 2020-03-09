import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  storage: Storage;
  isEnabled = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    if (!isPlatformBrowser(platformId)) {
      this.isEnabled = false;
      return;
    }
    this.storage = window.localStorage;
    this.isEnabled = true;
  }

  set(key: string, value: string): void {
    if (this.isEnabled) {
      this.storage[key] = value;
    }
  }

  get(key: string): string {
    if (!this.isEnabled) {
      return '';
    }

    return this.storage[key] || false;
  }

  setObject(key: string, value: any): void {
    if (!this.isEnabled) {
      return;
    }
    this.storage[key] = JSON.stringify(value);
  }

  getObject(key: string): any {
    if (!this.isEnabled) {
      return null;
    }
    return JSON.parse(this.storage[key] || '{}');
  }

  getValue<TType>(key: string): TType {
    if (!this.isEnabled) {
      return null;
    }
    const obj = JSON.parse(this.storage[key] || null);
    return <TType>obj || null;
  }

  remove(key: string): any {
    if (!this.isEnabled) {
      return null;
    }
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }
}
