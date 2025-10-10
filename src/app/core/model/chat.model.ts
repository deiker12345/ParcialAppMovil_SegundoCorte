export interface ChatMessage {
  id?: string;         
  senderId: string;     
  text: string;        
  timestamp: Date;     
  type?: 'text' | 'image'; 
}

export interface Chat {
  id: string;           
  users: string[];      
  lastMessage?: ChatMessage; 
}
