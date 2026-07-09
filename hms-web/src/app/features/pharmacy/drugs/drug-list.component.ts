import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Drug } from './drug.model';
import { DrugService } from './drug.service';

@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './drug-list.component.html'
})
export class DrugListComponent {
  private readonly service = inject(DrugService);

  drugs = signal<Drug[]>([]);
  errorMessage = signal<string | null>(null);
  form = { name: '', genericName: '', manufacturer: '', unitOfMeasure: '' };

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.service.list().subscribe({
      next: (drugs) => this.drugs.set(drugs),
      error: () => this.errorMessage.set('Failed to load drugs.')
    });
  }

  add(): void {
    if (!this.form.name.trim()) {
      return;
    }
    this.service.create({ ...this.form }).subscribe({
      next: () => {
        this.form = { name: '', genericName: '', manufacturer: '', unitOfMeasure: '' };
        this.refresh();
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to create drug.')
    });
  }

  deactivate(drug: Drug): void {
    if (drug.id === null) return;
    this.service.deactivate(drug.id).subscribe({ next: () => this.refresh() });
  }
}
