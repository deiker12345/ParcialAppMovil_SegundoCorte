import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SafeImagePipe } from './pipes/safe-image.pipe';
import { ImageDisplayComponent } from './components/image-display.component';

@NgModule({
  declarations: [
    SafeImagePipe,
    ImageDisplayComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    SafeImagePipe,
    ImageDisplayComponent,
    CommonModule,
    IonicModule
  ]
})
export class SharedModule { }