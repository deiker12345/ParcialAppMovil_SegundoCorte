import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/service/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false
})
export class WelcomePage implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    // Verificar si el usuario ya está autenticado
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Si ya está autenticado, redirigir al home
      this.router.navigate(['/home']);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

}
