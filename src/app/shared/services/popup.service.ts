import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type PopupType = 'alert' | 'confirm';

export interface PopupRequest {
  type: PopupType;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  tone: 'danger' | 'warning' | 'info';
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class PopupService {
  private requestSubject = new Subject<PopupRequest>();
  request$: Observable<PopupRequest> = this.requestSubject.asObservable();

  alert(message: string, options?: Partial<PopupRequest>): Promise<void> {
    return new Promise(resolve => {
      this.requestSubject.next({
        type: 'alert',
        title: options?.title || 'Aviso',
        message,
        confirmText: options?.confirmText || 'Entendi',
        cancelText: undefined,
        tone: options?.tone || 'info',
        resolve: () => resolve()
      });
    });
  }

  confirm(message: string, options?: Partial<PopupRequest>): Promise<boolean> {
    return new Promise(resolve => {
      this.requestSubject.next({
        type: 'confirm',
        title: options?.title || 'Confirmar ação',
        message,
        confirmText: options?.confirmText || 'Confirmar',
        cancelText: options?.cancelText || 'Cancelar',
        tone: options?.tone || 'warning',
        resolve
      });
    });
  }
}
