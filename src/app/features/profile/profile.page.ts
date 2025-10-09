import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../shared/service/user.service';
import { UploadService } from '../../shared/service/upload.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { AppUser } from '../../core/model/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  @ViewChild('newPassion', { static: false }) newPassionInput!: IonInput;

  user: AppUser = this.getEmptyUser();
  loading = true;

  constructor(
    private userService: UserService,
    private uploadService: UploadService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private getEmptyUser(): AppUser {
    return {
      name: '',
      lastName: '',
      email: '',
      birthDate: new Date(),
      country: '',
      city: '',
      gender: 'male',
      showGenderProfile: true,
      passions: [],
      photos: []
    };
  }

  private async getCurrentAuthUser(): Promise<User> {
    let current = this.auth.currentUser as User | null;
    if (current) return current;
    
    current = await new Promise<User | null>((resolve) => {
      const unsub = onAuthStateChanged(this.auth, u => {
        unsub();
        resolve(u);
      });
    });
    
    if (!current) throw new Error('Usuario no autenticado');
    return current;
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const currentUser = await this.getCurrentAuthUser();
      const fetchedUser = await firstValueFrom(this.userService.getUser(currentUser.uid));
      if (fetchedUser) this.user = fetchedUser;
    } catch (error) {
      console.error('Error cargando usuario:', error);
    } finally {
      this.loading = false;
    }
  }

  async saveProfile(): Promise<void> {
    try {
      const currentUser = await this.getCurrentAuthUser();
      await firstValueFrom(this.userService.updateUser(currentUser.uid, this.user));
      console.log('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  }

  async addPassionFromInput(): Promise<void> {
    if (!this.newPassionInput) return;
    
    const nativeInput = await this.newPassionInput.getInputElement();
    const value = nativeInput.value?.trim();
    
    if (!value) return;
    
    this.user.passions.push({ category: value });
    nativeInput.value = '';
  }

  removePassion(index: number): void {
    this.user.passions.splice(index, 1);
  }

  async uploadPhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const currentUser = await this.getCurrentAuthUser();
      const publicUrl = await this.uploadService.uploadProfileImage(file, currentUser.uid);

      this.user.photos = [...(this.user.photos || []), publicUrl];
      await firstValueFrom(this.userService.updateUser(currentUser.uid, { photos: this.user.photos }));

      console.log('Foto subida:', publicUrl);
    } catch (error) {
      console.error('Error subiendo la foto:', error);
    }
  }

  removePhoto(index: number): void {
    this.user.photos.splice(index, 1);
  }
}