import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalConfigSubject = new BehaviorSubject<ModalConfig | null>(null);
  public modalConfig$ = this.modalConfigSubject.asObservable();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();

  private confirmSubject = new BehaviorSubject<boolean | null>(null);
  public confirm$ = this.confirmSubject.asObservable();

  constructor() {}

  /**
   * Open a confirmation modal
   * Returns a promise that resolves to true if confirmed, false if cancelled
   */
  openConfirmation(config: ModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const subscription = this.confirm$.subscribe((result) => {
        if (result !== null) {
          subscription.unsubscribe();
          this.resetModal();
          resolve(result);
        }
      });

      this.modalConfigSubject.next(config);
      this.isOpenSubject.next(true);
    });
  }

  /**
   * Confirm the modal (user clicked Confirm button)
   */
  confirmModal(): void {
    this.confirmSubject.next(true);
  }

  /**
   * Cancel the modal (user clicked Cancel button or backdrop)
   */
  cancelModal(): void {
    this.confirmSubject.next(false);
  }

  /**
   * Close the modal
   */
  closeModal(): void {
    this.isOpenSubject.next(false);
  }

  /**
   * Reset the modal state
   */
  private resetModal(): void {
    this.isOpenSubject.next(false);
    this.modalConfigSubject.next(null);
    this.confirmSubject.next(null);
  }
}
