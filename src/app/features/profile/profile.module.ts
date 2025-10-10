import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    ProfilePageRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
