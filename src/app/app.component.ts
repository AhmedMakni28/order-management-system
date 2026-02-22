import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalService, ModalConfig } from '../services/modal.service';
import { ModalComponent } from './shared/modal/modal.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'order-management-system';
  @ViewChild(ModalComponent) modalComponent!: ModalComponent;

  isModalOpen$: Observable<boolean>;
  modalConfig$: Observable<ModalConfig | null>;

  constructor(private modalService: ModalService) {
    this.isModalOpen$ = this.modalService.isOpen$;
    this.modalConfig$ = this.modalService.modalConfig$;
  }

  ngOnInit(): void {}

  onModalConfirm(): void {
    this.modalService.confirmModal();
  }

  onModalCancel(): void {
    this.modalService.cancelModal();
  }
}
