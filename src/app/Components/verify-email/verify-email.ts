import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../Services/user';
import { EmailVerifyService } from '../../Services/email-verify-service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css']
})
export class VerifyEmail implements OnInit, OnDestroy {
  otp: string = '';
  errorMsg = '';
  successMsg = '';
  email: string = '';

  constructor(
    private router: Router,
    private user: User,
    private emailVerifyService: EmailVerifyService
  ) {}
  //otp: string = '';

  onOtpInput(event: any, idx: number) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    let otpArr = this.otp.split('');
    otpArr[idx] = value;
    this.otp = otpArr.join('').padEnd(6, '');
    // Move to next box if input
    if (value && idx < 5) {
      const next = event.target.parentElement.children[idx + 1];
      if (next) next.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, idx: number) {
    if (event.key === 'Backspace' && !this.otp[idx] && idx > 0) {
      const prev = (event.target as HTMLElement).parentElement!.children[idx - 1] as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  ngOnInit() {
    const header = document.querySelector('app-header') as HTMLElement | null;
    const footer = document.querySelector('app-footer') as HTMLElement | null;
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    this.email = sessionStorage.getItem('verify_email') || '';
  }

  ngOnDestroy() {
    const header = document.querySelector('app-header') as HTMLElement | null;
    const footer = document.querySelector('app-footer') as HTMLElement | null;
    if (header) header.style.display = '';
    if (footer) footer.style.display = '';
  }

  verifyEmail() {
    const code = this.otp.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      this.errorMsg = 'Please enter a valid 6-digit code.';
      this.successMsg = '';
      return;
    }
    this.emailVerifyService.validateCode(this.email, code).subscribe(
      (res: any) => {
        // res is plain text, not JSON
        if (typeof res === 'string' && res.includes('OTP validated successfully')) {
          this.successMsg = 'Email verified successfully!';
          this.errorMsg = '';
          // Optionally, redirect to home
          this.router.navigate(['/home']);
        } else {
          this.errorMsg = 'Unexpected response from server.';
          this.successMsg = '';
        }
      },
      error => {
        console.error('API error:', error);
        this.errorMsg = error.error?.message || 'Invalid verification code.';
        this.successMsg = '';
      }
    );
  }
  resendCode(event: Event) {
    event.preventDefault();
    this.emailVerifyService.sendCode(this.email).subscribe({
      next: () => {
        this.successMsg = 'Verification code resent!';
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to resend code.';
        this.successMsg = '';
      }
    });
  }

  changeEmail(event: Event) {
    event.preventDefault();
    this.successMsg = '';
    this.errorMsg = 'Change email address feature not implemented yet.';
  }
}
