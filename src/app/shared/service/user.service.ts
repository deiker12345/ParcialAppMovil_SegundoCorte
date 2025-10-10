import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, DocumentReference } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { UserProfile } from 'src/app/core/model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_COLLECTION = 'users';

  constructor(private firestore: Firestore) {}

  createUserProfile(uid: string, profile: UserProfile): Observable<void> {
    const userRef = this.getUserDocRef(uid);
    const profileData = {
      ...profile,
      uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return from(setDoc(userRef, profileData));
  }

  getUserProfile(uid: string): Observable<UserProfile | null> {
    const userRef = this.getUserDocRef(uid);
    return from(
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        }
        return null;
      })
    );
  }

  getUser(uid: string): Observable<UserProfile | null> {
    return this.getUserProfile(uid);
  }

  getUserById(uid: string): Promise<UserProfile | null> {
    const userRef = this.getUserDocRef(uid);
    return getDoc(userRef).then(docSnap => {
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    });
  }

  updateUserProfile(uid: string, updates: Partial<UserProfile>): Observable<void> {
    const userRef = this.getUserDocRef(uid);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    return from(updateDoc(userRef, updateData));
  }

  updateUser(uid: string, updates: Partial<UserProfile>): Observable<void> {
    return this.updateUserProfile(uid, updates);
  }

  getAllUsers(excludeUid?: string): Promise<UserProfile[]> {
    const usersCollection = collection(this.firestore, this.USERS_COLLECTION);
    return getDocs(usersCollection).then(snapshot => {
      return snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(user => !excludeUid || user.uid !== excludeUid);
    });
  }

  private getUserDocRef(uid: string): DocumentReference {
    return doc(this.firestore, `${this.USERS_COLLECTION}/${uid}`);
  }
}