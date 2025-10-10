import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SwipeCardComponent } from './swipe-card.component';

describe('SwipeCardComponent', () => {
  let component: SwipeCardComponent;
  let fixture: ComponentFixture<SwipeCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SwipeCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SwipeCardComponent);
    component = fixture.componentInstance;
    
    // Mock required user input
    component.user = {
      name: 'Test User',
      lastName: 'Test',
      birthDate: new Date('1990-01-01'),
      email: 'test@test.com',
      country: 'Test Country',
      city: 'Test City',
      gender: 'male',
      showGenderProfile: true,
      passions: [],
      photos: ['test-photo.jpg'],
      uid: 'test-uid'
    };
    
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
