import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit } from '@angular/core';
import { GestureController, Platform } from '@ionic/angular';
import { AppUser } from 'src/app/core/model/user.model';

@Component({
  selector: 'app-swipe-card',
  templateUrl: './swipe-card.component.html',
  styleUrls: ['./swipe-card.component.scss'],
  standalone: false
})
export class SwipeCardComponent implements OnInit {

  @ViewChild('card', { static: true }) card!: ElementRef;
  @Input() user!: AppUser;
  @Input() isActive: boolean = false;
  @Output() onSwipe = new EventEmitter<{ direction: 'left' | 'right', user: AppUser }>();

  private gesture: any;
  private startX: number = 0;
  private currentX: number = 0;
  private cardWidth: number = 0;
  private threshold: number = 100; // Minimum distance to trigger swipe

  constructor(
    private gestureCtrl: GestureController,
    private platform: Platform
  ) { }

  ngOnInit() {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.createGesture();
    }
  }

  ngOnDestroy() {
    if (this.gesture) {
      this.gesture.destroy();
    }
  }

  private createGesture() {
    const card = this.card.nativeElement;
    this.cardWidth = card.offsetWidth;

    this.gesture = this.gestureCtrl.create({
      el: card,
      threshold: 15,
      gestureName: 'swipe',
      onStart: (ev) => this.onStart(ev),
      onMove: (ev) => this.onMove(ev),
      onEnd: (ev) => this.onEnd(ev),
    });

    this.gesture.enable();
  }

  private onStart(ev: any) {
    this.startX = ev.currentX;
    this.currentX = ev.currentX;
  }

  private onMove(ev: any) {
    if (!this.isActive) return;

    this.currentX = ev.currentX;
    const deltaX = this.currentX - this.startX;
    const rotation = deltaX * 0.1;
    const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / (this.cardWidth * 0.7));

    // Apply transform
    this.card.nativeElement.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    this.card.nativeElement.style.opacity = opacity;

    // Show like/dislike indicators
    this.updateSwipeIndicators(deltaX);
  }

  private onEnd(ev: any) {
    if (!this.isActive) return;

    const deltaX = this.currentX - this.startX;
    const shouldSwipe = Math.abs(deltaX) > this.threshold;

    if (shouldSwipe) {
      // Complete the swipe
      const direction = deltaX > 0 ? 'right' : 'left';
      this.completeSwipe(direction);
    } else {
      // Return to center
      this.resetCard();
    }
  }

  private completeSwipe(direction: 'left' | 'right') {
    const card = this.card.nativeElement;
    const translateX = direction === 'right' ? this.cardWidth * 1.5 : -this.cardWidth * 1.5;
    
    card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    card.style.transform = `translateX(${translateX}px) rotate(${direction === 'right' ? 30 : -30}deg)`;
    card.style.opacity = '0';

    setTimeout(() => {
      this.onSwipe.emit({ direction, user: this.user });
      this.resetCard();
    }, 300);
  }

  private resetCard() {
    const card = this.card.nativeElement;
    card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    card.style.transform = 'translateX(0px) rotate(0deg)';
    card.style.opacity = '1';
    
    setTimeout(() => {
      card.style.transition = '';
    }, 300);

    this.hideSwipeIndicators();
  }

  private updateSwipeIndicators(deltaX: number) {
    const likeIndicator = this.card.nativeElement.querySelector('.like-indicator');
    const dislikeIndicator = this.card.nativeElement.querySelector('.dislike-indicator');

    if (deltaX > 50) {
      // Show like indicator
      if (likeIndicator) {
        likeIndicator.style.opacity = Math.min(1, (deltaX - 50) / 100);
        likeIndicator.style.transform = 'scale(1)';
      }
      if (dislikeIndicator) {
        dislikeIndicator.style.opacity = '0';
        dislikeIndicator.style.transform = 'scale(0.8)';
      }
    } else if (deltaX < -50) {
      // Show dislike indicator
      if (dislikeIndicator) {
        dislikeIndicator.style.opacity = Math.min(1, (Math.abs(deltaX) - 50) / 100);
        dislikeIndicator.style.transform = 'scale(1)';
      }
      if (likeIndicator) {
        likeIndicator.style.opacity = '0';
        likeIndicator.style.transform = 'scale(0.8)';
      }
    } else {
      this.hideSwipeIndicators();
    }
  }

  private hideSwipeIndicators() {
    const likeIndicator = this.card.nativeElement.querySelector('.like-indicator');
    const dislikeIndicator = this.card.nativeElement.querySelector('.dislike-indicator');

    if (likeIndicator) {
      likeIndicator.style.opacity = '0';
      likeIndicator.style.transform = 'scale(0.8)';
    }
    if (dislikeIndicator) {
      dislikeIndicator.style.opacity = '0';
      dislikeIndicator.style.transform = 'scale(0.8)';
    }
  }

  // Manual swipe methods for buttons
  swipeLeft() {
    this.completeSwipe('left');
  }

  swipeRight() {
    this.completeSwipe('right');
  }

  getAge(birthDate: Date | string | undefined): number {
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

}
