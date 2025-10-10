import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeImage',
  standalone: false
})
export class SafeImagePipe implements PipeTransform {
  
  constructor(
    private sanitizer: DomSanitizer
  ) {}

  transform(value: string): SafeUrl | string {
    if (!value) return 'assets/placeholder-image.svg';
    
    // Para URLs directas (http, https, data, assets, firestore)
    if (value.startsWith('http') || 
        value.startsWith('data:') || 
        value.startsWith('assets/') ||
        value.startsWith('firestore:')) {
      return value;
    }
    
    // Si no es una URL válida, devolver placeholder
    return 'assets/placeholder-image.svg';
  }
}