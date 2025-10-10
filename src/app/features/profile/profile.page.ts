import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, ToastController, LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../shared/service/user.service';
import { UploadService } from '../../shared/service/upload.service';
import { Auth, User } from '@angular/fire/auth';
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
  saving = false;
  uploading = false;
  currentUser: User | null = null;

  constructor(
    private userService: UserService,
    private uploadService: UploadService,
    private auth: Auth,
    private toastController: ToastController,
    private loadingController: LoadingController
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

  private async getCurrentAuthUser(): Promise<User | null> {
    this.currentUser = this.auth.currentUser;
    if (this.currentUser) {
      const userData = await this.userService.getUserById(this.currentUser.uid);
      if (userData) {
        this.user = userData;
      } else {
        this.user = this.getEmptyUser();
      }
    }
    return this.currentUser;
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      await this.getCurrentAuthUser();
    } catch (error) {
      console.error('Error cargando usuario:', error);
      await this.showToast('Error al cargar el perfil', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.validateProfile()) {
      return;
    }

    this.saving = true;
    try {
      if (!this.currentUser) {
        await this.showToast('Usuario no autenticado', 'danger');
        return;
      }

      await firstValueFrom(this.userService.updateUser(this.currentUser.uid, this.user));
      await this.showToast('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error guardando perfil:', error);
      await this.showToast('Error al guardar el perfil', 'danger');
    } finally {
      this.saving = false;
    }
  }

  private validateProfile(): boolean {
    if (!this.user.name?.trim()) {
      this.showToast('El nombre es requerido', 'warning');
      return false;
    }
    if (!this.user.lastName?.trim()) {
      this.showToast('El apellido es requerido', 'warning');
      return false;
    }
    if (!this.user.city?.trim()) {
      this.showToast('La ciudad es requerida', 'warning');
      return false;
    }
    if (!this.user.country?.trim()) {
      this.showToast('El país es requerido', 'warning');
      return false;
    }
    return true;
  }

  async addPassionFromInput(): Promise<void> {
    const input = await this.newPassionInput.getInputElement();
    const passionText = input.value?.trim();
    
    if (!passionText) {
      await this.showToast('Ingresa una pasión válida', 'warning');
      return;
    }

    if (this.user.passions.some(p => p.category.toLowerCase() === passionText.toLowerCase())) {
      await this.showToast('Esta pasión ya está agregada', 'warning');
      return;
    }

    if (this.user.passions.length >= 10) {
      await this.showToast('Máximo 10 pasiones permitidas', 'warning');
      return;
    }

    this.user.passions.push({ category: passionText });
    input.value = '';
    await this.showToast('Pasión agregada correctamente');
  }

  removePassion(index: number): void {
    this.user.passions.splice(index, 1);
  }

  async uploadPhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      await this.showToast('Solo se permiten archivos de imagen', 'danger');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      await this.showToast('La imagen no debe superar los 5MB', 'danger');
      return;
    }

    // Validar número máximo de fotos
    if (this.user.photos.length >= 6) {
      await this.showToast('Máximo 6 fotos permitidas', 'warning');
      return;
    }

    this.uploading = true;
    try {
      if (!this.currentUser) {
        await this.showToast('Usuario no autenticado', 'danger');
        return;
      }

      const publicUrl = await this.uploadService.uploadProfileImage(file, this.currentUser.uid);
      this.user.photos.push(publicUrl);
      
      // Actualizar en la base de datos
      await firstValueFrom(this.userService.updateUser(this.currentUser.uid, { photos: this.user.photos }));
      await this.showToast('Foto subida correctamente');
    } catch (error) {
      console.error('Error subiendo foto:', error);
      await this.showToast('Error al subir la foto', 'danger');
    } finally {
      this.uploading = false;
      // Limpiar el input
      input.value = '';
    }
  }

  async removePhoto(index: number): Promise<void> {
    try {
      if (!this.currentUser) {
        await this.showToast('Usuario no autenticado', 'danger');
        return;
      }

      this.user.photos.splice(index, 1);
      
      // Actualizar en la base de datos
      await firstValueFrom(this.userService.updateUser(this.currentUser.uid, { photos: this.user.photos }));
      await this.showToast('Foto eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando foto:', error);
      await this.showToast('Error al eliminar la foto', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}