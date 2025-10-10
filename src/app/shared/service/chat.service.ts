import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, query, orderBy, onSnapshot, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ChatMessage } from 'src/app/core/model/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly CHATS_COLLECTION = 'chats';

  constructor(private firestore: Firestore) {}

  /** Crear un chat entre dos usuarios si no existe */
  async createChat(userId1: string, userId2: string): Promise<string> {
    const chatId = this.getChatId(userId1, userId2);
    const chatDoc = doc(this.firestore, `${this.CHATS_COLLECTION}/${chatId}`);
    const snapshot = await getDocs(collection(this.firestore, this.CHATS_COLLECTION));
    const exists = snapshot.docs.find(d => d.id === chatId);

    if (!exists) {
      await addDoc(collection(this.firestore, this.CHATS_COLLECTION), {
        id: chatId,
        users: [userId1, userId2],
        messages: []
      });
    }

    return chatId;
  }

  /** Enviar mensaje a un chat */
  async sendMessage(chatId: string, message: ChatMessage): Promise<void> {
    const chatDoc = doc(this.firestore, `${this.CHATS_COLLECTION}/${chatId}`);
    await addDoc(collection(chatDoc, 'messages'), message);
  }

  /** Obtener mensajes de un chat como Observable */
  getMessages(chatId: string): Observable<ChatMessage[]> {
    return new Observable(subscriber => {
      const messagesCol = collection(this.firestore, `${this.CHATS_COLLECTION}/${chatId}/messages`);
      const q = query(messagesCol, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, snapshot => {
        const messages: ChatMessage[] = snapshot.docs.map(doc => doc.data() as ChatMessage);
        subscriber.next(messages);
      });

      return { unsubscribe };
    });
  }

  /** Genera un ID consistente para un chat entre dos usuarios */
  private getChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_'); // siempre el mismo ID para ambos usuarios
  }
}
