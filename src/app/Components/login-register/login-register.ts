import { Component } from '@angular/core';
import { Auth } from '../../Services/auth';
import { User } from '../../Services/user';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { Iuser } from '../../Models/iuser';
import { Router } from '@angular/router';

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

  constructor(private auth: Auth, private user: User , private router: Router) {}

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
        password: this.loginData.password
      }).subscribe({
        next: (res) => {
          if (res.token) {
            this.user.setToken(res.token);
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

  // New method to validate all registration fields at once
  validateRegisterFields() {
    let isValid = true;
    this.registerErrors = {};

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
      const body = {
        username: this.registerData.userName,
        firstname: this.registerData.firstName,
        lastname: this.registerData.lastName,
        nid: this.registerData.nid,
        email: this.registerData.email,
        password: this.registerData.password,
        confirmpassword: this.registerData.confirmPassword,
        otpcode: this.registerData.otpcode
      };

      this.auth.register(body as any).subscribe({
        next: (res) => {
          this.successMsg = 'Registration successful!';
          sessionStorage.setItem('verify_email', this.registerData.email);
          // call the setToken method to store the token
          this.user.setToken(res.token);


          console.log('Registration successful, token received:', res.token);

          this.router.navigate(['/verify-email']);
          this.toggleForm(true);
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Registration failed';
        }
      });
    }
  }
}
