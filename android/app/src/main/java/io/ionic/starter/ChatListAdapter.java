package io.ionic.starter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class ChatListAdapter extends RecyclerView.Adapter<ChatListAdapter.ChatViewHolder> {
    
    private List<ChatPreview> chats;
    private OnChatClickListener listener;
    private SimpleDateFormat timeFormat;

    public interface OnChatClickListener {
        void onChatClick(ChatPreview chat);
    }

    public ChatListAdapter(List<ChatPreview> chats, OnChatClickListener listener) {
        this.chats = chats;
        this.listener = listener;
        this.timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
    }

    @NonNull
    @Override
    public ChatViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_chat_preview, parent, false);
        return new ChatViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ChatViewHolder holder, int position) {
        ChatPreview chat = chats.get(position);
        holder.bind(chat);
    }

    @Override
    public int getItemCount() {
        return chats.size();
    }

    class ChatViewHolder extends RecyclerView.ViewHolder {
        ImageView profileImage;
        TextView nameText;
        TextView lastMessageText;
        TextView timeText;
        TextView unreadBadge;

        ChatViewHolder(View itemView) {
            super(itemView);
            profileImage = itemView.findViewById(R.id.profileImage);
            nameText = itemView.findViewById(R.id.nameText);
            lastMessageText = itemView.findViewById(R.id.lastMessageText);
            timeText = itemView.findViewById(R.id.timeText);
            unreadBadge = itemView.findViewById(R.id.unreadBadge);

            itemView.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && listener != null) {
                    listener.onChatClick(chats.get(position));
                }
            });
        }

        void bind(ChatPreview chat) {
            nameText.setText(chat.otherUser.getFullName());
            lastMessageText.setText(chat.lastMessage.text);
            
            // Mostrar tiempo del último mensaje
            try {
                long timestamp = Long.parseLong(chat.lastMessage.timestamp);
                Date date = new Date(timestamp);
                timeText.setText(timeFormat.format(date));
            } catch (NumberFormatException e) {
                timeText.setText("");
            }
            
            // Mostrar badge de mensajes no leídos
            if (chat.unreadCount > 0) {
                unreadBadge.setVisibility(View.VISIBLE);
                unreadBadge.setText(String.valueOf(chat.unreadCount));
            } else {
                unreadBadge.setVisibility(View.GONE);
            }
            
            // Cargar imagen de perfil (placeholder por ahora)
            profileImage.setImageResource(R.drawable.ic_person_placeholder);
        }
    }
}