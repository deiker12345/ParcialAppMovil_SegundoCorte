package io.ionic.starter;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "ChatPlugin")
public class ChatPlugin extends Plugin {

    private static final int CHAT_VIEW_REQUEST_CODE = 2001;
    private static final int CHAT_LIST_REQUEST_CODE = 2002;
    private PluginCall currentCall;

    @PluginMethod
    public void openChatView(PluginCall call) {
        try {
            String chatId = call.getString("chatId");
            String currentUserId = call.getString("currentUserId");
            JSONObject otherUserJson = call.getObject("otherUser");
            JSONArray messagesArray = call.getArray("messages");
            
            if (chatId == null || currentUserId == null || otherUserJson == null || messagesArray == null) {
                call.reject("Missing required parameters");
                return;
            }

            ChatUser otherUser = parseChatUser(otherUserJson);
            List<ChatMessage> messages = parseChatMessages(messagesArray);
            
            this.currentCall = call;
            
            Intent intent = new Intent(getContext(), ChatActivity.class);
            intent.putExtra("chatId", chatId);
            intent.putExtra("currentUserId", currentUserId);
            intent.putExtra("otherUser", otherUser);
            intent.putParcelableArrayListExtra("messages", new ArrayList<>(messages));
            
            startActivityForResult(call, intent, CHAT_VIEW_REQUEST_CODE);
            
        } catch (Exception e) {
            call.reject("Error opening chat view: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openChatList(PluginCall call) {
        try {
            String currentUserId = call.getString("currentUserId");
            JSONArray chatsArray = call.getArray("chats");
            
            if (currentUserId == null || chatsArray == null) {
                call.reject("Missing required parameters");
                return;
            }

            List<ChatPreview> chats = parseChatPreviews(chatsArray);
            
            this.currentCall = call;
            
            Intent intent = new Intent(getContext(), ChatListActivity.class);
            intent.putExtra("currentUserId", currentUserId);
            intent.putParcelableArrayListExtra("chats", new ArrayList<>(chats));
            
            startActivityForResult(call, intent, CHAT_LIST_REQUEST_CODE);
            
        } catch (Exception e) {
            call.reject("Error opening chat list: " + e.getMessage());
        }
    }

    @PluginMethod
    public void updateMessages(PluginCall call) {
        try {
            String chatId = call.getString("chatId");
            JSONArray messagesArray = call.getArray("messages");
            
            if (chatId == null || messagesArray == null) {
                call.reject("Missing required parameters");
                return;
            }

            List<ChatMessage> messages = parseChatMessages(messagesArray);
            
            // Enviar broadcast para actualizar mensajes en tiempo real
            Intent updateIntent = new Intent("UPDATE_CHAT_MESSAGES");
            updateIntent.putExtra("chatId", chatId);
            updateIntent.putParcelableArrayListExtra("messages", new ArrayList<>(messages));
            getContext().sendBroadcast(updateIntent);
            
            call.resolve();
        } catch (Exception e) {
            call.reject("Error updating messages: " + e.getMessage());
        }
    }

    @PluginMethod
    public void closeChatView(PluginCall call) {
        Intent closeIntent = new Intent("CLOSE_CHAT_VIEW");
        getContext().sendBroadcast(closeIntent);
        call.resolve();
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        
        if (currentCall != null) {
            JSObject result = new JSObject();
            
            if (resultCode == android.app.Activity.RESULT_OK && data != null) {
                if (requestCode == CHAT_VIEW_REQUEST_CODE) {
                    String action = data.getStringExtra("action");
                    String message = data.getStringExtra("message");
                    
                    result.put("action", action);
                    if (message != null) {
                        result.put("message", message);
                    }
                } else if (requestCode == CHAT_LIST_REQUEST_CODE) {
                    String action = data.getStringExtra("action");
                    String chatId = data.getStringExtra("chatId");
                    
                    result.put("action", action);
                    if (chatId != null) {
                        result.put("chatId", chatId);
                    }
                }
            } else {
                result.put("action", "close");
            }
            
            currentCall.resolve(result);
            currentCall = null;
        }
    }

    private ChatUser parseChatUser(JSONObject userJson) throws JSONException {
        ChatUser user = new ChatUser();
        user.uid = userJson.getString("uid");
        user.name = userJson.getString("name");
        user.lastName = userJson.getString("lastName");
        user.photo = userJson.optString("photo", null);
        return user;
    }

    private List<ChatMessage> parseChatMessages(JSONArray messagesArray) throws JSONException {
        List<ChatMessage> messages = new ArrayList<>();
        
        for (int i = 0; i < messagesArray.length(); i++) {
            JSONObject messageJson = messagesArray.getJSONObject(i);
            ChatMessage message = new ChatMessage();
            
            message.id = messageJson.getString("id");
            message.senderId = messageJson.getString("senderId");
            message.text = messageJson.getString("text");
            message.timestamp = messageJson.getString("timestamp");
            message.type = messageJson.optString("type", "text");
            
            messages.add(message);
        }
        
        return messages;
    }

    private List<ChatPreview> parseChatPreviews(JSONArray chatsArray) throws JSONException {
        List<ChatPreview> chats = new ArrayList<>();
        
        for (int i = 0; i < chatsArray.length(); i++) {
            JSONObject chatJson = chatsArray.getJSONObject(i);
            ChatPreview chat = new ChatPreview();
            
            chat.chatId = chatJson.getString("chatId");
            chat.otherUser = parseChatUser(chatJson.getJSONObject("otherUser"));
            chat.lastMessage = parseChatMessages(new JSONArray().put(chatJson.getJSONObject("lastMessage"))).get(0);
            chat.unreadCount = chatJson.optInt("unreadCount", 0);
            
            chats.add(chat);
        }
        
        return chats;
    }
}