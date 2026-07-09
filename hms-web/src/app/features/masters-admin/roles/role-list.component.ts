import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Role } from './role.model';
import { RoleService } from './role.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './role-list.component.html'
})
export class RoleListComponent {
  private readonly service = inject(RoleService);

  roles = signal<Role[]>([]);
  newRoleName = '';
  errorMessage = signal<string | null>(null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.service.list().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.errorMessage.set('Failed to load roles.')
    });
  }

  add(): void {
    if (!this.newRoleName.trim()) {
      return;
    }
    this.service.create({ name: this.newRoleName.trim() }).subscribe({
      next: () => {
        this.newRoleName = '';
        this.refresh();
      },
      error: () => this.errorMessage.set('Failed to create role.')
    });
  }

  deactivate(role: Role): void {
    if (role.id === null) {
      return;
    }
    this.service.deactivate(role.id).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to deactivate role.')
    });
  }
}
