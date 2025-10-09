export interface Passion {
  category: string;
}

export interface UserProfile {
  name: string;
  lastName: string;
  birthDate: Date;
  email: string;
  country: string;
  city: string;
  gender: 'male' | 'female' | 'other';
  showGenderProfile: boolean;
  passions: Passion[];
  photos: string[];
  uid?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AppUser = UserProfile;