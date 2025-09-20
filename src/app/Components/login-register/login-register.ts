import { Component } from '@angular/core';
import { Auth } from '../../Services/auth';
import { User } from '../../Services/user';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { Iuser } from '../../Models/iuser';
import { Router } from '@angular/router';
import { EmailVerifyService } from '../../Services/email-verify-service';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.html',
  styleUrls: ['./login-register.css'],
  standalone: true, // Mark this as a standalone component
  imports: [CommonModule, FormsModule] // Add modules to the imports array
})
export class LoginRegister {
  isLogin = true;
  bookHeight = '450px';

  showLoginPassword = false;
  showRegisterPassword = false;
  showRegisterConfirmPassword = false;

  loginData = {
    email: '',
    password: ''
  };
  registerData: Iuser & { otpcode: string } = {
    userName: '',
    firstName: '',
    lastName: '',
    nid: '',
    email: '',
    password: '',
    confirmPassword: '',
    otpcode: 'string'
  };

  loginErrors: any = {};
  registerErrors: any = {};
  errorMsg = '';
  successMsg = '';

  // OTP popup properties
  showOtpPopup = false;
  otpCode = '';
  otpError = '';
  otpSuccess = '';
  isVerifyingOtp = false;

  constructor(
    private auth: Auth, 
    private user: User, 
    private router: Router,
    private emailVerifyService: EmailVerifyService
  ) {}

  // Password validation method
  isValidPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    return hasUpperCase && hasLowerCase && hasSpecialChar;
  }

  // Get password validation details
  getPasswordValidationDetails(password: string) {
    return {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      hasMinLength: password.length >= 6
    };
  }

  // Check if error message indicates email already exists
  isEmailAlreadyExistsError(errorMessage: string): boolean {
    const lowerMessage = errorMessage.toLowerCase();
    return lowerMessage.includes('email already exists') || 
           lowerMessage.includes('user with this email already exists') ||
           lowerMessage.includes('email is already taken') ||
           lowerMessage.includes('duplicate email') ||
           lowerMessage.includes('email address is already registered');
  }

  // Check if error message indicates username already exists
  isUsernameAlreadyExistsError(errorMessage: string): boolean {
    const lowerMessage = errorMessage.toLowerCase();
    return lowerMessage.includes('duplicateusername') ||
           lowerMessage.includes('username already exists') ||
           lowerMessage.includes('username is already taken') ||
           lowerMessage.includes('duplicate username');
  }

  toggleForm(isLogin: boolean) {
    this.isLogin = isLogin;
    this.errorMsg = '';
    this.successMsg = '';
    this.loginErrors = {};
    this.registerErrors = {};
    this.bookHeight = isLogin ? '450px' : '750px';
  }

  // New method to validate all login fields at once
  validateLoginFields() {
    let isValid = true;
    this.loginErrors = {};

    if (!this.loginData.email) {
      this.loginErrors.email = 'Email is required';
      isValid = false;
    }

    if (!this.loginData.password || this.loginData.password.length < 6) {
      this.loginErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    return isValid;
  }

  onLoginSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.validateLoginFields()) {
      this.auth.login({
        UserNameOrEmail: this.loginData.email,
        Password: this.loginData.password
      }).subscribe({
        next: (res) => {
          if (res.token) {
            this.user.setToken(res.token);
            this.user.setUser(this.loginData.email);
            this.successMsg = 'Login successful!';
            // You can add a router redirect here
          } else {
            this.errorMsg = 'Invalid login response';
          }
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Login failed';
        }
      });
    }
  }

  // Clear email error when user changes email
  onEmailChange() {
    if (this.registerErrors.email) {
      this.registerErrors.email = '';
    }
    this.validateRegisterFields();
  }

  // Clear username error when user changes username
  onUsernameChange() {
    if (this.registerErrors.userName) {
      this.registerErrors.userName = '';
    }
    this.validateRegisterFields();
  }

  // Clear all errors when user starts typing
  clearFieldError(fieldName: string) {
    if (this.registerErrors[fieldName]) {
      this.registerErrors[fieldName] = '';
    }
  }

  // New method to validate all registration fields at once
  validateRegisterFields() {
    let isValid = true;
    // Don't clear all errors, just validate
    if (!this.registerErrors) {
      this.registerErrors = {};
    }

    if (!this.registerData.userName) {
      this.registerErrors.userName = 'Username is required';
      isValid = false;
    }
    if (!this.registerData.firstName) {
      this.registerErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (!this.registerData.lastName) {
      this.registerErrors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!this.registerData.nid || !/^\d{14}$/.test(this.registerData.nid)) {
      this.registerErrors.nid = 'National ID must be 14 digits';
      isValid = false;
    }
    if (!this.registerData.email) {
      this.registerErrors.email = 'Email is required';
      isValid = false;
    }
    if (!this.registerData.password || this.registerData.password.length < 6) {
      this.registerErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    } else if (!this.isValidPassword(this.registerData.password)) {
      this.registerErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one special character';
      isValid = false;
    }
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.registerErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    return isValid;
  }

  onRegisterSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.validateRegisterFields()) {
      // Ensure all fields are properly set
      const body = {
        UserName: this.registerData.userName?.trim() || '',
        FirstName: this.registerData.firstName?.trim() || '',
        LastName: this.registerData.lastName?.trim() || '',
        NID: this.registerData.nid?.trim() || '',
        Email: this.registerData.email?.trim() || '',
        Password: this.registerData.password || '',
        ConfirmPassword: this.registerData.confirmPassword || '',
        OtpCode: "000000" // Placeholder since backend sends OTP after registration
      };

      // Additional validation before sending
      if (!body.UserName || !body.FirstName || !body.LastName || !body.NID || !body.Email || !body.Password || !body.ConfirmPassword) {
        this.errorMsg = 'All fields are required';
        return;
      }
      
      if (body.NID.length !== 14 || !/^\d{14}$/.test(body.NID)) {
        this.errorMsg = 'National ID must be exactly 14 digits';
        return;
      }
      
      if (body.Password !== body.ConfirmPassword) {
        this.errorMsg = 'Passwords do not match';
        return;
      }
      
      if (!this.isValidPassword(body.Password)) {
        this.errorMsg = 'Password must contain at least one uppercase letter, one lowercase letter, and one special character';
        return;
      }
      
      console.log('Sending registration request:', body);
      
      this.auth.register(body as any).subscribe({
        next: (res) => {
          console.log('Registration successful:', res);
          this.successMsg = 'Registration successful! Please verify your email.';
          // Store the token from registration response
          if (res.token) {
            this.user.setToken(res.token);
          }
          // Show OTP popup instead of navigating to separate page
          this.showOtpPopup = true;
          this.otpCode = '';
          this.otpError = '';
          this.otpSuccess = '';
        },
        error: (err) => {
          console.error('Registration error:', err);
          console.error('Error details:', err.error);
          
          // Handle different types of errors
          if (err.error && Array.isArray(err.error)) {
            // Handle validation errors from ASP.NET Core Identity
            const errorMessages = err.error.map((error: any) => error.description).join(', ');
            this.errorMsg = errorMessages;
            
            // Check for specific field errors
            if (this.isEmailAlreadyExistsError(errorMessages)) {
              this.registerErrors.email = 'This email is already registered. Please use a different email or try logging in.';
            }
            if (this.isUsernameAlreadyExistsError(errorMessages)) {
              this.registerErrors.userName = 'This username is already taken. Please choose a different username.';
            }
          } else if (err.error && typeof err.error === 'string') {
            // Handle string error messages
            this.errorMsg = err.error;
            
            // Check for specific field errors
            if (this.isEmailAlreadyExistsError(err.error)) {
              this.registerErrors.email = 'This email is already registered. Please use a different email or try logging in.';
            }
            if (this.isUsernameAlreadyExistsError(err.error)) {
              this.registerErrors.userName = 'This username is already taken. Please choose a different username.';
            }
          } else if (err.error && err.error.message) {
            // Handle object with message property
            this.errorMsg = err.error.message;
            
            // Check for specific field errors
            if (this.isEmailAlreadyExistsError(err.error.message)) {
              this.registerErrors.email = 'This email is already registered. Please use a different email or try logging in.';
            }
            if (this.isUsernameAlreadyExistsError(err.error.message)) {
              this.registerErrors.userName = 'This username is already taken. Please choose a different username.';
            }
          } else {
            this.errorMsg = 'Registration failed. Please check your information and try again.';
          }
        }
      });
    }
  }

  // OTP popup methods
  onOtpInput(event: any, idx: number) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    let otpArr = this.otpCode.split('');
    otpArr[idx] = value;
    this.otpCode = otpArr.join('').padEnd(6, '');
    
    // Move to next box if input
    if (value && idx < 5) {
      const next = event.target.parentElement.children[idx + 1];
      if (next) next.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, idx: number) {
    if (event.key === 'Backspace' && !this.otpCode[idx] && idx > 0) {
      const prev = (event.target as HTMLElement).parentElement!.children[idx - 1] as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  verifyOtp() {
    const code = this.otpCode.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      this.otpError = 'Please enter a valid 6-digit code.';
      this.otpSuccess = '';
      return;
    }

    this.isVerifyingOtp = true;
    this.otpError = '';
    this.otpSuccess = '';

    this.emailVerifyService.validateCode(this.registerData.email, code).subscribe({
      next: (res: any) => {
        this.isVerifyingOtp = false;
        if (typeof res === 'string' && res.includes('OTP validated successfully')) {
          this.otpSuccess = 'Email verified successfully!';
          this.otpError = '';
          // Navigate to home (token already stored during registration)
          setTimeout(() => {
            this.closeOtpPopup();
            this.router.navigate(['/home']);
          }, 1500);
        } else {
          this.otpError = 'Unexpected response from server.';
        }
      },
      error: (err) => {
        this.isVerifyingOtp = false;
        this.otpError = err.error?.message || 'Invalid verification code.';
        this.otpSuccess = '';
      }
    });
  }

  resendOtp() {
    this.otpError = '';
    this.otpSuccess = '';
    
    this.emailVerifyService.sendCode(this.registerData.email).subscribe({
      next: () => {
        this.otpSuccess = 'Verification code resent!';
        this.otpError = '';
      },
      error: (err) => {
        this.otpError = err.error?.message || 'Failed to resend code.';
        this.otpSuccess = '';
      }
    });
  }

  closeOtpPopup() {
    this.showOtpPopup = false;
    this.otpCode = '';
    this.otpError = '';
    this.otpSuccess = '';
    this.isVerifyingOtp = false;
  }
}
