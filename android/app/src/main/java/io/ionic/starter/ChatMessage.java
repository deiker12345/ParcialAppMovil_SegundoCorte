package io.ionic.starter;

import android.os.Parcel;
import android.os.Parcelable;

public class ChatMessage implements Parcelable {
    public String id;
    public String senderId;
    public String text;
    public String timestamp;
    public String type; // "text", "image", "emoji"

    public ChatMessage() {}

    protected ChatMessage(Parcel in) {
        id = in.readString();
        senderId = in.readString();
        text = in.readString();
        timestamp = in.readString();
        type = in.readString();
    }

    public static final Creator<ChatMessage> CREATOR = new Creator<ChatMessage>() {
        @Override
        public ChatMessage createFromParcel(Parcel in) {
            return new ChatMessage(in);
        }

        @Override
        public ChatMessage[] newArray(int size) {
            return new ChatMessage[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(id);
        dest.writeString(senderId);
        dest.writeString(text);
        dest.writeString(timestamp);
        dest.writeString(type);
    }
}