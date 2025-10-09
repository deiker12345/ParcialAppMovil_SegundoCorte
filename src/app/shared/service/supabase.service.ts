import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  // Subir imagen de perfil
  async uploadProfileImage(file: File, userId: string): Promise<string> {
    const filePath = `profiles/${userId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await this.supabase.storage
      .from('tinder')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;

    const { data } = this.supabase.storage.from('tinder').getPublicUrl(filePath);
    if (!data?.publicUrl) throw new Error('No se pudo obtener la URL pública');
    return data.publicUrl;
  }

  // Obtener un usuario por ID
  async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  // Actualizar usuario
  async updateUser(userId: string, payload: any): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update(payload)
      .eq('id', userId);
    if (error) throw error;
  }

  // Obtener todos los usuarios, opcionalmente excluyendo a uno
  async getAllUsers(excludeUserId?: string): Promise<any[]> {
    let query = this.supabase.from('users').select('*');
    if (excludeUserId) query = query.not('id', 'eq', excludeUserId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}
