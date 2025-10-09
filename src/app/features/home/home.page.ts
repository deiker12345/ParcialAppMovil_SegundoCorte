import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../shared/service/user.service';
import { AuthService } from '../../shared/service/auth.service';
import { AppUser } from '../../core/model/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  profiles: AppUser[] = [];
  currentIndex = 0;
  currentUserId: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCurrentUser();
    await this.loadProfiles();
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      this.currentUserId = currentUser?.uid || null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
    }
  }

  private async loadProfiles(): Promise<void> {
    try {
      const users = await this.userService.getAllUsers(this.currentUserId || undefined);
      this.profiles = users.map(user => ({
        ...user,
        photos: user.photos || [],
        passions: user.passions || []
      }));
    } catch (error) {
      console.error('Error cargando perfiles:', error);
    }
  }

  get currentProfile(): AppUser | null {
    return this.profiles.length > 0 ? this.profiles[this.currentIndex] : null;
  }

  getAge(birthDate: Date | string): number {
    if (!birthDate) return 0;
    
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  like(): void {
    if (!this.currentProfile) return;
    console.log('Liked', this.currentProfile.name);
    this.nextProfile();
  }

  dislike(): void {
    if (!this.currentProfile) return;
    console.log('Disliked', this.currentProfile.name);
    this.nextProfile();
  }

  private nextProfile(): void {
    if (this.profiles.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.profiles.length;
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}