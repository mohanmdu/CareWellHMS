import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container section" style="text-align: center;">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a routerLink="/" class="btn btn-primary">Back to Home</a>
    </div>
  `
})
export class NotFoundComponent {}
