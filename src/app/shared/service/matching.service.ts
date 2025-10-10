import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, where, setDoc, updateDoc, arrayUnion, DocumentReference } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { AppUser } from 'src/app/core/model/user.model';

@Injectable({
  providedIn: 'root'
})
export class MatchingService {

  private readonly USERS_COLLECTION = 'users';
  private readonly LIKES_COLLECTION = 'likes';

  constructor(private firestore: Firestore) {}

  /** Trae todos los usuarios, opcionalmente excluyendo al actual */
  async getProfiles(currentUserId: string): Promise<AppUser[]> {
    const usersCol = collection(this.firestore, this.USERS_COLLECTION);
    const snapshot = await getDocs(usersCol);
    return snapshot.docs
      .map(doc => doc.data() as AppUser)
      .filter(user => user.uid !== currentUserId);
  }

  /** Registrar like a un usuario */
  async likeUser(currentUserId: string, likedUserId: string): Promise<void> {
    const likeDocRef = doc(this.firestore, `${this.LIKES_COLLECTION}/${currentUserId}`);
    await updateDoc(likeDocRef, {
      likes: arrayUnion(likedUserId)
    }).catch(async () => {
      // Si no existe el doc, lo crea
      await setDoc(likeDocRef, { likes: [likedUserId] });
    });
  }

  /** Registrar dislike a un usuario */
  async dislikeUser(currentUserId: string, dislikedUserId: string): Promise<void> {
    const dislikeDocRef = doc(this.firestore, `${this.LIKES_COLLECTION}/${currentUserId}`);
    await updateDoc(dislikeDocRef, {
      dislikes: arrayUnion(dislikedUserId)
    }).catch(async () => {
      await setDoc(dislikeDocRef, { dislikes: [dislikedUserId] });
    });
  }

  /** Obtener la lista de likes de un usuario */
  async getUserLikes(currentUserId: string): Promise<string[]> {
    const docRef = doc(this.firestore, `${this.LIKES_COLLECTION}/${currentUserId}`);
    const snapshot = await getDocs(collection(this.firestore, this.LIKES_COLLECTION));
    const data = snapshot.docs.find(d => d.id === currentUserId)?.data() as any;
    return data?.likes || [];
  }

  /** Verificar si hay match entre dos usuarios */
  async checkForMatch(currentUserId: string, likedUserId: string): Promise<boolean> {
    try {
      // Primero registrar el like del usuario actual
      await this.likeUser(currentUserId, likedUserId);
      
      // Verificar si el otro usuario ya le dio like al usuario actual
      const otherUserLikes = await this.getUserLikes(likedUserId);
      const isMatch = otherUserLikes.includes(currentUserId);
      
      if (isMatch) {
        // Crear el match en la base de datos
        await this.createMatch(currentUserId, likedUserId);
      }
      
      return isMatch;
    } catch (error) {
      console.error('Error checking for match:', error);
      return false;
    }
  }

  /** Crear un match entre dos usuarios */
  private async createMatch(userId1: string, userId2: string): Promise<void> {
    const matchId = `${userId1}_${userId2}`;
    const reverseMatchId = `${userId2}_${userId1}`;
    
    const matchData = {
      id: matchId,
      users: [userId1, userId2],
      createdAt: new Date(),
      isActive: true
    };

    // Crear el match en ambas direcciones para facilitar las consultas
    const matchDocRef = doc(this.firestore, `matches/${matchId}`);
    const reverseMatchDocRef = doc(this.firestore, `matches/${reverseMatchId}`);
    
    await setDoc(matchDocRef, matchData);
    await setDoc(reverseMatchDocRef, matchData);
  }

  /** Obtener todos los matches de un usuario */
  async getUserMatches(userId: string): Promise<any[]> {
    try {
      const matchesCol = collection(this.firestore, 'matches');
      const q = query(matchesCol, where('users', 'array-contains', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user matches:', error);
      return [];
    }
  }
}
