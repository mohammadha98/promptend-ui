import { Injectable, ViewContainerRef, ComponentRef, Type, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

export interface DialogConfig {
  data?: any;
  width?: string;
  height?: string;
}

export interface DialogRef {
  close(result?: any): void;
  afterClosed(): Subject<any>;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private openDialogs: ComponentRef<any>[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    @Inject(DOCUMENT) private document: Document
  ) {}

  open<T>(component: Type<T>, config: DialogConfig = {}): DialogRef {
    // Create backdrop
    const backdrop = this.document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    backdrop.style.zIndex = '9999';
    
    // Create component
    const componentRef = createComponent(component, {
      environmentInjector: this.injector
    });
    
    const afterClosedSubject = new Subject<any>();

    // Set data and dialogRef on the component instance
    if (config.data) {
      (componentRef.instance as any).data = config.data;
    }

    const dialogRef: DialogRef = {
      close: (result?: any) => {
        this.closeDialog(componentRef, backdrop);
        afterClosedSubject.next(result);
        afterClosedSubject.complete();
      },
      afterClosed: () => afterClosedSubject
    };

    (componentRef.instance as any).dialogRef = dialogRef;
    
    // Attach component to application
    this.appRef.attachView(componentRef.hostView);
    
    // Append to backdrop
    backdrop.appendChild(componentRef.location.nativeElement);
    
    // Add backdrop to document body
    this.document.body.appendChild(backdrop);
    
    // Close on backdrop click
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        dialogRef.close();
      }
    });
    
    this.openDialogs.push(componentRef);

    return dialogRef;
  }

  private closeDialog(componentRef: ComponentRef<any>, backdrop: HTMLElement): void {
    const index = this.openDialogs.indexOf(componentRef);
    if (index > -1) {
      this.openDialogs.splice(index, 1);
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    }
  }
}