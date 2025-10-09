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
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      birthDate: [null, Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      gender: ['', Validators.required],
      showGenderProfile: [true]
    });
  }

  async onRegister(): Promise<void> {
    if (this.form.invalid) {
      await this.showMessage('Complete todos los campos', 'warning');
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      await this.showMessage('Las contraseñas no coinciden', 'warning');
      return;
    }

    this.loading = true;
    const { password, confirmPassword, ...userData } = this.form.value;

    try {
      const user = await this.authService.register(userData.email, password).toPromise();
      
      if (user) {
        const profile: UserProfile = {
          ...userData,
          uid: user.uid,
          passions: [],
          photos: []
        };
        
        await this.userService.createUserProfile(user.uid, profile).toPromise();
        await this.showMessage('Cuenta creada exitosamente', 'success');
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
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/weak-password': 'Contraseña muy débil',
      'auth/network-request-failed': 'Error de conexión'
    };
    return errors[error?.code] || 'Error al registrar usuario';
  }

  private async showMessage(message: string, color: string): Promise<void> {
    const toast = await this.toast.create({ message, duration: 3000, color, position: 'top' });
    await toast.present();
  }
}