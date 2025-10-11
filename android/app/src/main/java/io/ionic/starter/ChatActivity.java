package io.ionic.starter;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ChatActivity extends AppCompatActivity {
    
    private String chatId;
    private String currentUserId;
    private ChatUser otherUser;
    private List<ChatMessage> messages;
    private ChatMessagesAdapter messagesAdapter;
    
    private TextView titleText;
    private ImageView backButton;
    private RecyclerView messagesRecyclerView;
    private EditText messageInput;
    private ImageButton sendButton;
    
    private BroadcastReceiver updateReceiver;
    private BroadcastReceiver closeReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);
        
        // Obtener datos del intent
        chatId = getIntent().getStringExtra("chatId");
        currentUserId = getIntent().getStringExtra("currentUserId");
        otherUser = getIntent().getParcelableExtra("otherUser");
        messages = getIntent().getParcelableArrayListExtra("messages");
        
        if (messages == null) {
            messages = new ArrayList<>();
        }
        
        initializeViews();
        setupRecyclerView();
        setupListeners();
        setupBroadcastReceivers();
        updateUI();
    }

    private void initializeViews() {
        titleText = findViewById(R.id.titleText);
        backButton = findViewById(R.id.backButton);
        messagesRecyclerView = findViewById(R.id.messagesRecyclerView);
        messageInput = findViewById(R.id.messageInput);
        sendButton = findViewById(R.id.sendButton);
    }

    private void setupRecyclerView() {
        messagesAdapter = new ChatMessagesAdapter(messages, currentUserId);
        messagesRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        messagesRecyclerView.setAdapter(messagesAdapter);
        
        // Scroll al último mensaje
        if (!messages.isEmpty()) {
            messagesRecyclerView.scrollToPosition(messages.size() - 1);
        }
    }

    private void setupListeners() {
        backButton.setOnClickListener(v -> {
            Intent resultIntent = new Intent();
            resultIntent.putExtra("action", "close");
            setResult(Activity.RESULT_OK, resultIntent);
            finish();
        });

        sendButton.setOnClickListener(v -> sendMessage());
        
        messageInput.setOnEditorActionListener((v, actionId, event) -> {
            sendMessage();
            return true;
        });
    }

    private void setupBroadcastReceivers() {
        // Receiver para actualizar mensajes
        updateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String receivedChatId = intent.getStringExtra("chatId");
                if (chatId.equals(receivedChatId)) {
                    List<ChatMessage> newMessages = intent.getParcelableArrayListExtra("messages");
                    if (newMessages != null) {
                        messages.clear();
                        messages.addAll(newMessages);
                        messagesAdapter.notifyDataSetChanged();
                        messagesRecyclerView.scrollToPosition(messages.size() - 1);
                    }
                }
            }
        };
        
        // Receiver para cerrar la vista
        closeReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Intent resultIntent = new Intent();
                resultIntent.putExtra("action", "close");
                setResult(Activity.RESULT_OK, resultIntent);
                finish();
            }
        };
        
        registerReceiver(updateReceiver, new IntentFilter("UPDATE_CHAT_MESSAGES"));
        registerReceiver(closeReceiver, new IntentFilter("CLOSE_CHAT_VIEW"));
    }

    private void updateUI() {
        if (otherUser != null) {
            titleText.setText(otherUser.getFullName());
        }
    }

    private void sendMessage() {
        String messageText = messageInput.getText().toString().trim();
        if (!TextUtils.isEmpty(messageText)) {
            // Crear nuevo mensaje
            ChatMessage newMessage = new ChatMessage();
            newMessage.id = UUID.randomUUID().toString();
            newMessage.senderId = currentUserId;
            newMessage.text = messageText;
            newMessage.timestamp = String.valueOf(System.currentTimeMillis());
            newMessage.type = "text";
            
            // Agregar a la lista local
            messages.add(newMessage);
            messagesAdapter.notifyItemInserted(messages.size() - 1);
            messagesRecyclerView.scrollToPosition(messages.size() - 1);
            
            // Limpiar input
            messageInput.setText("");
            
            // Enviar resultado con el mensaje
            Intent resultIntent = new Intent();
            resultIntent.putExtra("action", "message_sent");
            resultIntent.putExtra("message", messageText);
            setResult(Activity.RESULT_OK, resultIntent);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (updateReceiver != null) {
            unregisterReceiver(updateReceiver);
        }
        if (closeReceiver != null) {
            unregisterReceiver(closeReceiver);
        }
    }

    @Override
    public void onBackPressed() {
        Intent resultIntent = new Intent();
        resultIntent.putExtra("action", "close");
        setResult(Activity.RESULT_OK, resultIntent);
        super.onBackPressed();
    }
}