package io.ionic.starter;

import android.os.Parcel;
import android.os.Parcelable;

public class ChatUser implements Parcelable {
    public String uid;
    public String name;
    public String lastName;
    public String photo;

    public ChatUser() {}

    protected ChatUser(Parcel in) {
        uid = in.readString();
        name = in.readString();
        lastName = in.readString();
        photo = in.readString();
    }

    public static final Creator<ChatUser> CREATOR = new Creator<ChatUser>() {
        @Override
        public ChatUser createFromParcel(Parcel in) {
            return new ChatUser(in);
        }

        @Override
        public ChatUser[] newArray(int size) {
            return new ChatUser[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(uid);
        dest.writeString(name);
        dest.writeString(lastName);
        dest.writeString(photo);
    }

    public String getFullName() {
        return name + " " + lastName;
    }
}