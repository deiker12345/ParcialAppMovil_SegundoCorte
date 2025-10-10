import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UploadService } from '../service/upload.service';

@Component({
  selector: 'app-image-display',
  standalone: false,
  template: `
    <img 
      [src]="imageSrc" 
      [alt]="alt"
      [style.width]="width"
      [style.height]="height"
      [style.object-fit]="'cover'"
      (error)="onImageError()"
      class="image-display"
    />
  `,
  styles: [`
    .image-display {
      border-radius: 8px;
      transition: opacity 0.3s ease;
    }
    .image-display:hover {
      opacity: 0.9;
    }
  `]
})
export class ImageDisplayComponent implements OnInit {
  @Input() src: string = '';
  @Input() alt: string = 'Imagen';
  @Input() width: string = '100px';
  @Input() height: string = '100px';

  imageSrc: string | SafeUrl = '';

  constructor(
    private sanitizer: DomSanitizer,
    private uploadService: UploadService
  ) {}

  ngOnInit() {
    this.loadImage();
  }

  private async loadImage() {
    if (!this.src) {
      this.imageSrc = 'assets/placeholder-image.svg';
      return;
    }

    // Si es una referencia de Firebase Database
    if (this.src.startsWith('firestore:')) {
      const imageId = this.src.replace('firestore:', '');
      try {
        const base64 = await this.uploadService.getImageBase64(imageId);
        if (base64) {
          this.imageSrc = base64;
          return;
        }
      } catch (error) {
        console.error('Error loading image from Firebase Database:', error);
      }
    }

    // Para URLs directas (http, https, data, assets)
    if (this.src.startsWith('http') || this.src.startsWith('data:') || this.src.startsWith('assets/')) {
      this.imageSrc = this.src;
      return;
    }

    // Si no es una URL válida, usar placeholder
    this.imageSrc = 'assets/placeholder-image.svg';
  }

  onImageError() {
    this.imageSrc = 'assets/placeholder-image.svg';
  }
}