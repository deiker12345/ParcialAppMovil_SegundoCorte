import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(
    private firestore: Firestore
  ) {}

  async uploadProfileImage(file: File, uid: string): Promise<string> {
    try {
      // Comprimir y convertir imagen a base64
      const compressedBase64 = await this.compressImageToBase64(file);
      
      // Guardar en Firebase Database
      const imageId = this.generateImageId();
      const imageData = {
        id: imageId,
        base64: compressedBase64,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        userId: uid
      };

      // Guardar en colección de imágenes
      const imageRef = doc(this.firestore, 'images', imageId);
      await updateDoc(imageRef, imageData).catch(async () => {
        // Si el documento no existe, crearlo
        const { setDoc } = await import('@angular/fire/firestore');
        await setDoc(imageRef, imageData);
      });

      // Retornar referencia a la imagen para guardar en el perfil del usuario
      return `firestore:${imageId}`;
    } catch (error) {
      console.error('Error uploading image to Firebase Database:', error);
      throw new Error('Error al subir la imagen. Por favor, intenta de nuevo.');
    }
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      // Para archivos generales, usar el mismo método
      const compressedBase64 = await this.compressImageToBase64(file);
      
      const imageId = this.generateImageId();
      const imageData = {
        id: imageId,
        base64: compressedBase64,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        path: path
      };

      const imageRef = doc(this.firestore, 'images', imageId);
      await updateDoc(imageRef, imageData).catch(async () => {
        const { setDoc } = await import('@angular/fire/firestore');
        await setDoc(imageRef, imageData);
      });

      return `firestore:${imageId}`;
    } catch (error) {
      console.error('Error uploading file to Firebase Database:', error);
      throw new Error('Error al subir el archivo. Por favor, intenta de nuevo.');
    }
  }

  async getImageBase64(imageId: string): Promise<string> {
    try {
      const imageRef = doc(this.firestore, 'images', imageId);
      const imageDoc = await getDoc(imageRef);
      
      if (imageDoc.exists()) {
        const data = imageDoc.data();
        return data['base64'] || '';
      }
      
      return '';
    } catch (error) {
      console.error('Error getting image from Firebase Database:', error);
      return '';
    }
  }

  private async compressImageToBase64(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con compresión
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };

      img.onerror = () => reject(new Error('Error al procesar la imagen'));

      // Crear URL de la imagen
      img.src = URL.createObjectURL(file);
    });
  }

  private generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Método para eliminar imágenes
  async deleteImage(imageId: string): Promise<void> {
    try {
      const imageRef = doc(this.firestore, 'images', imageId);
      const { deleteDoc } = await import('@angular/fire/firestore');
      await deleteDoc(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Error al eliminar la imagen');
    }
  }
}