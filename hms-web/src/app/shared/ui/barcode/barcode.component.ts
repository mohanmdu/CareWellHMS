import { AfterViewInit, Component, ElementRef, input, OnChanges, ViewChild } from '@angular/core';
import JsBarcode from 'jsbarcode';

/** Renders a CODE128 barcode for the given value (e.g. an Inpatient ID) onto a canvas. */
@Component({
  selector: 'app-barcode',
  standalone: true,
  template: '<canvas #canvas></canvas>'
})
export class BarcodeComponent implements AfterViewInit, OnChanges {
  readonly value = input.required<string>();

  @ViewChild('canvas') private canvasRef?: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
    this.render();
  }

  private render(): void {
    const canvas = this.canvasRef?.nativeElement;
    const value = this.value();
    if (!canvas || !value) {
      return;
    }
    JsBarcode(canvas, value, { format: 'CODE128', displayValue: true, width: 1.6, height: 40, fontSize: 14, margin: 4 });
  }
}
