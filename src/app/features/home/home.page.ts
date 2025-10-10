import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../shared/service/user.service';
import { AuthService } from '../../shared/service/auth.service';
import { MatchingService } from '../../shared/service/matching.service';
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
  currentUser: AppUser | null = null;
  showMatchModal = false;
  matchedUser: AppUser | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private matchingService: MatchingService,
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
      
      if (this.currentUserId) {
        this.currentUser = await this.userService.getUserById(this.currentUserId);
      }
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

  get visibleProfiles(): AppUser[] {
    // Show up to 3 cards in the stack for better performance
    return this.profiles.slice(this.currentIndex, this.currentIndex + 3);
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

  handleSwipe(event: { direction: 'left' | 'right'; user: AppUser }): void {
    if (event.direction === 'right') {
      this.like();
    } else {
      this.dislike();
    }
  }

  async like(): Promise<void> {
    if (!this.currentProfile || !this.currentUserId || !this.currentProfile.uid) return;
    
    try {
      console.log('Liked', this.currentProfile.name);
      
      // Check if it's a match
      const isMatch = await this.matchingService.checkForMatch(
        this.currentUserId, 
        this.currentProfile.uid
      );
      
      if (isMatch) {
        this.matchedUser = this.currentProfile;
        this.showMatchModal = true;
      }
      
      this.nextProfile();
    } catch (error) {
      console.error('Error processing like:', error);
      this.nextProfile();
    }
  }

  dislike(): void {
    if (!this.currentProfile || !this.currentUserId) return;
    
    try {
      console.log('Disliked', this.currentProfile.name);
      // TODO: Store dislike in database
      this.nextProfile();
    } catch (error) {
      console.error('Error processing dislike:', error);
      this.nextProfile();
    }
  }

  superLike(): void {
    if (!this.currentProfile || !this.currentUserId) return;
    
    try {
      console.log('Super liked', this.currentProfile.name);
      // TODO: Store super like in database
      this.nextProfile();
    } catch (error) {
      console.error('Error processing super like:', error);
      this.nextProfile();
    }
  }

  private nextProfile(): void {
    if (this.profiles.length === 0) return;
    this.currentIndex++;
    
    // If we've gone through all profiles, reset or load more
    if (this.currentIndex >= this.profiles.length) {
      this.currentIndex = 0;
      // TODO: Load more profiles from server
    }
  }

  refreshProfiles(): void {
    this.currentIndex = 0;
    this.loadProfiles();
  }

  closeMatchModal(): void {
    this.showMatchModal = false;
    this.matchedUser = null;
  }

  goToChatWithMatch(): void {
    if (this.matchedUser) {
      // TODO: Create chat and navigate to it
      this.router.navigate(['/chat-conversation', this.matchedUser.uid]);
    }
    this.closeMatchModal();
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}