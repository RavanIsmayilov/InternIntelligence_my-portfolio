import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';



@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ContactComponent {
  contactForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], 
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  sendMessage() {
    if (this.contactForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      this.isLoading = true;
      
      // 3 dəqiqə timeout (180000ms) - Render.com cold start üçün
      this.http.post(`${environment.API_URL}/contact`, this.contactForm.value)
        .pipe(
          timeout(180000), // 3 dəqiqə timeout
          catchError((error: any) => {
            this.isLoading = false;
            
            if (error.name === 'TimeoutError' || error.message === 'Timeout has occurred') {
              this.errorMessage = 'Request timeout. The server is taking too long to respond. Please try again.';
            } else if (error instanceof HttpErrorResponse) {
              if (error.status === 0) {
                this.errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
              } else if (error.status >= 500) {
                this.errorMessage = 'Server error. Please try again later.';
              } else {
                this.errorMessage = error.error?.error || error.error?.message || error.message || 'Message could not be sent, try again!';
              }
            } else {
              this.errorMessage = error.message || 'Message could not be sent, try again!';
            }
            this.successMessage = '';
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Your message has been sent successfully!';
            this.errorMessage = '';
            this.contactForm.reset();
          },
          error: () => {
            // Error already handled in catchError
          }
        });
    } else {
      this.errorMessage = 'Please fill all fields correctly!';
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}
