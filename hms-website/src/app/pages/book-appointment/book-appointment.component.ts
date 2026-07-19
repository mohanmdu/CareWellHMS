import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.scss'
})
export class BookAppointmentComponent {
  readonly bookingUrl = `${environment.hmsAppUrl}/appointments/book`;
}
