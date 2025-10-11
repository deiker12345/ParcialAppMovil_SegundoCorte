import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/shared/service/auth.service';
import { UserService } from 'src/app/shared/service/user.service';
import { UserProfile } from '../../core/model/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  form!: FormGroup;
  loading = false;
  showPass = false;
  showConfirm = false;
  maxDate: string;
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toast: ToastController
  ) {
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString();
    this.minDate = new Date(today.getFullYear() - 100, 0, 1).toISOString();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      country: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  togglePassword(): void {
    this.showPass = !this.showPass;
  }

  async onRegister(): Promise<void> {
    if (this.form.invalid) {
      await this.showMessage('Please complete all fields correctly', 'warning');
      return;
    }

    this.loading = true;
    const { name, lastName, email, password, country } = this.form.value;

    try {
      const user = await this.authService.register(email, password).toPromise();
      
      if (user) {
        const profile: UserProfile = {
          name,
          lastName,
          email,
          country,
          uid: user.uid,
          passions: [],
          photos: [],
          birthDate: new Date(),
          city: '',
          gender: 'other',
          showGenderProfile: true
        };
        
        await this.userService.createUserProfile(user.uid, profile).toPromise();
        await this.showMessage('Account created successfully!', 'success');
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      await this.showMessage(this.getError(error), 'danger');
    } finally {
      this.loading = false;
    }
  }

  private getError(error: any): string {
    const errors: Record<string, string> = {
      'auth/email-already-in-use': 'Email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/weak-password': 'Password is too weak',
      'auth/network-request-failed': 'Network connection error'
    };
    return errors[error?.code] || 'Registration failed. Please try again.';
  }

  private async showMessage(message: string, color: string): Promise<void> {
    const toast = await this.toast.create({ message, duration: 3000, color, position: 'top' });
    await toast.present();
  }

  async registerWithGoogle(): Promise<void> {
    try {
      this.loading = true;
      await this.showMessage('Función de Google en desarrollo', 'warning');
      // TODO: Implementar registro con Google
      // const result = await this.authService.signInWithGoogle();
      // if (result) {
      //   this.router.navigate(['/tabs']);
      // }
    } catch (error) {
      await this.showMessage(this.getError(error), 'danger');
    } finally {
      this.loading = false;
    }
  }

  async registerWithFacebook(): Promise<void> {
    try {
      this.loading = true;
      await this.showMessage('Función de Facebook en desarrollo', 'warning');
      // TODO: Implementar registro con Facebook
      // const result = await this.authService.signInWithFacebook();
      // if (result) {
      //   this.router.navigate(['/tabs']);
      // }
    } catch (error) {
      await this.showMessage(this.getError(error), 'danger');
    } finally {
      this.loading = false;
    }
  }
}