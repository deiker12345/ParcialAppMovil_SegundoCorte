package io.ionic.starter;

import android.os.Parcel;
import android.os.Parcelable;

public class ChatPreview implements Parcelable {
    public String chatId;
    public ChatUser otherUser;
    public ChatMessage lastMessage;
    public int unreadCount;

    public ChatPreview() {}

    protected ChatPreview(Parcel in) {
        chatId = in.readString();
        otherUser = in.readParcelable(ChatUser.class.getClassLoader());
        lastMessage = in.readParcelable(ChatMessage.class.getClassLoader());
        unreadCount = in.readInt();
    }

    public static final Creator<ChatPreview> CREATOR = new Creator<ChatPreview>() {
        @Override
        public ChatPreview createFromParcel(Parcel in) {
            return new ChatPreview(in);
        }

        @Override
        public ChatPreview[] newArray(int size) {
            return new ChatPreview[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(chatId);
        dest.writeParcelable(otherUser, flags);
        dest.writeParcelable(lastMessage, flags);
        dest.writeInt(unreadCount);
    }
}