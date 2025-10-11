package io.ionic.starter;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;

public class ChatListActivity extends AppCompatActivity implements ChatListAdapter.OnChatClickListener {
    
    private String currentUserId;
    private List<ChatPreview> chats;
    private ChatListAdapter chatListAdapter;
    
    private TextView titleText;
    private ImageView backButton;
    private RecyclerView chatsRecyclerView;
    private TextView emptyStateText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_list);
        
        // Obtener datos del intent
        currentUserId = getIntent().getStringExtra("currentUserId");
        chats = getIntent().getParcelableArrayListExtra("chats");
        
        if (chats == null) {
            chats = new ArrayList<>();
        }
        
        initializeViews();
        setupRecyclerView();
        setupListeners();
        updateUI();
    }

    private void initializeViews() {
        titleText = findViewById(R.id.titleText);
        backButton = findViewById(R.id.backButton);
        chatsRecyclerView = findViewById(R.id.chatsRecyclerView);
        emptyStateText = findViewById(R.id.emptyStateText);
    }

    private void setupRecyclerView() {
        chatListAdapter = new ChatListAdapter(chats, this);
        chatsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        chatsRecyclerView.setAdapter(chatListAdapter);
    }

    private void setupListeners() {
        backButton.setOnClickListener(v -> {
            Intent resultIntent = new Intent();
            resultIntent.putExtra("action", "close");
            setResult(Activity.RESULT_OK, resultIntent);
            finish();
        });
    }

    private void updateUI() {
        titleText.setText("Mensajes");
        
        if (chats.isEmpty()) {
            chatsRecyclerView.setVisibility(android.view.View.GONE);
            emptyStateText.setVisibility(android.view.View.VISIBLE);
            emptyStateText.setText("No tienes conversaciones aún");
        } else {
            chatsRecyclerView.setVisibility(android.view.View.VISIBLE);
            emptyStateText.setVisibility(android.view.View.GONE);
        }
    }

    @Override
    public void onChatClick(ChatPreview chat) {
        Intent resultIntent = new Intent();
        resultIntent.putExtra("action", "chat_selected");
        resultIntent.putExtra("chatId", chat.chatId);
        setResult(Activity.RESULT_OK, resultIntent);
        finish();
    }

    @Override
    public void onBackPressed() {
        Intent resultIntent = new Intent();
        resultIntent.putExtra("action", "close");
        setResult(Activity.RESULT_OK, resultIntent);
        super.onBackPressed();
    }
}