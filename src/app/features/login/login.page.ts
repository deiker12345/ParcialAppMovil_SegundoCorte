import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../shared/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  form!: FormGroup;
  loading = false;
  showPass = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPass = !this.showPass;
  }

  async onLogin(): Promise<void> {
    if (this.form.invalid) {
      await this.showMessage('Please complete all fields', 'warning');
      return;
    }

    this.loading = true;
    const { email, password } = this.form.value;

    try {
      await this.authService.login(email, password).toPromise();
      await this.showMessage('Welcome back!', 'success');
      this.router.navigate(['/home']);
    } catch (error: any) {
      await this.showMessage(this.getError(error), 'danger');
    } finally {
      this.loading = false;
    }
  }

  private getError(error: any): string {
    const errors: Record<string, string> = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/network-request-failed': 'Error de conexión'
    };
    return errors[error?.code] || 'Error al iniciar sesión';
  }

  private async showMessage(message: string, color: string): Promise<void> {
    const toast = await this.toast.create({ 
      message, 
      duration: 3000, 
      color, 
      position: 'top' 
    });
    await toast.present();
  }
}