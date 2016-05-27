import {Directive, EventEmitter, HostListener, Output} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';// To make .map available on Observables

@Directive({
  selector: '[draggable]'
})
export class DraggableDirective {

  @Output() mousedrag: Observable<{x: number, y: number}>;
  @Output() dragend = new EventEmitter<void>();
  mousedown = new EventEmitter<MouseEvent>();
  mousemove = new EventEmitter<MouseEvent>();
  dragActive = false;

  @HostListener('document:mouseup', ['$event'])
  onMouseup(event: MouseEvent) {
    if(this.dragActive) {
      this.dragend.emit(null);
      this.dragActive = false;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent) {
    this.mousedown.emit(event);
  }

  @HostListener('document:mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    if(this.dragActive) {
      this.mousemove.emit(event);
      return false;
    }
    return true;
  }

  constructor() {
    this.mousedrag = this.mousedown.map((event: MouseEvent) => {
      this.dragActive = true;
      return { x: event.clientX, y: event.clientY };
    }).flatMap((mouseDownPos: {x: number, y: number}) => this.mousemove.map((moveEvent: MouseEvent) => {
      return { x: moveEvent.clientX - mouseDownPos.x, y: moveEvent.clientY - mouseDownPos.y };
    }).takeUntil(this.dragend));
  }

}
