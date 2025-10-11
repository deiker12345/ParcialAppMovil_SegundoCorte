package io.ionic.starter;

import android.os.Parcel;
import android.os.Parcelable;
import java.util.ArrayList;
import java.util.List;

public class UserProfile implements Parcelable {
    public String uid;
    public String name;
    public String lastName;
    public String birthDate;
    public String city;
    public String country;
    public String gender;
    public List<String> passions;
    public List<String> photos;

    public UserProfile() {
        this.passions = new ArrayList<>();
        this.photos = new ArrayList<>();
    }

    protected UserProfile(Parcel in) {
        uid = in.readString();
        name = in.readString();
        lastName = in.readString();
        birthDate = in.readString();
        city = in.readString();
        country = in.readString();
        gender = in.readString();
        passions = in.createStringArrayList();
        photos = in.createStringArrayList();
    }

    public static final Creator<UserProfile> CREATOR = new Creator<UserProfile>() {
        @Override
        public UserProfile createFromParcel(Parcel in) {
            return new UserProfile(in);
        }

        @Override
        public UserProfile[] newArray(int size) {
            return new UserProfile[size];
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
        dest.writeString(birthDate);
        dest.writeString(city);
        dest.writeString(country);
        dest.writeString(gender);
        dest.writeStringList(passions);
        dest.writeStringList(photos);
    }

    public String getFullName() {
        return name + " " + lastName;
    }

    public String getPassionsString() {
        if (passions == null || passions.isEmpty()) {
            return "";
        }
        return String.join(", ", passions);
    }
}