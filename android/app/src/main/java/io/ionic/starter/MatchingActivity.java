package io.ionic.starter;

import android.animation.AnimatorInflater;
import android.animation.AnimatorSet;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import com.bumptech.glide.Glide;
import java.util.ArrayList;
import java.util.List;

public class MatchingActivity extends AppCompatActivity {

    private List<UserProfile> profiles;
    private int currentProfileIndex = 0;
    private String currentUserId;
    
    private CardView profileCard;
    private ImageView profileImage;
    private TextView profileName;
    private TextView profileAge;
    private TextView profileLocation;
    private TextView profilePassions;
    private ImageButton likeButton;
    private ImageButton dislikeButton;
    
    private GestureDetector gestureDetector;
    private BroadcastReceiver updateReceiver;
    private BroadcastReceiver closeReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_matching);
        
        initializeViews();
        setupData();
        setupGestureDetector();
        setupBroadcastReceivers();
        setupClickListeners();
        
        showCurrentProfile();
    }

    private void initializeViews() {
        profileCard = findViewById(R.id.profile_card);
        profileImage = findViewById(R.id.profile_image);
        profileName = findViewById(R.id.profile_name);
        profileAge = findViewById(R.id.profile_age);
        profileLocation = findViewById(R.id.profile_location);
        profilePassions = findViewById(R.id.profile_passions);
        likeButton = findViewById(R.id.like_button);
        dislikeButton = findViewById(R.id.dislike_button);
    }

    private void setupData() {
        Intent intent = getIntent();
        currentUserId = intent.getStringExtra("currentUserId");
        profiles = intent.getParcelableArrayListExtra("profiles");
        
        if (profiles == null) {
            profiles = new ArrayList<>();
        }
    }

    private void setupGestureDetector() {
        gestureDetector = new GestureDetector(this, new GestureDetector.SimpleOnGestureListener() {
            private static final int SWIPE_THRESHOLD = 100;
            private static final int SWIPE_VELOCITY_THRESHOLD = 100;

            @Override
            public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
                boolean result = false;
                try {
                    float diffY = e2.getY() - e1.getY();
                    float diffX = e2.getX() - e1.getX();
                    
                    if (Math.abs(diffX) > Math.abs(diffY)) {
                        if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD) {
                            if (diffX > 0) {
                                onSwipeRight();
                            } else {
                                onSwipeLeft();
                            }
                            result = true;
                        }
                    }
                } catch (Exception exception) {
                    exception.printStackTrace();
                }
                return result;
            }
        });

        profileCard.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                return gestureDetector.onTouchEvent(event);
            }
        });
    }

    private void setupBroadcastReceivers() {
        updateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                ArrayList<UserProfile> newProfiles = intent.getParcelableArrayListExtra("profiles");
                if (newProfiles != null) {
                    profiles = newProfiles;
                    currentProfileIndex = 0;
                    showCurrentProfile();
                }
            }
        };

        closeReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                finish();
            }
        };

        registerReceiver(updateReceiver, new IntentFilter("UPDATE_PROFILES"));
        registerReceiver(closeReceiver, new IntentFilter("CLOSE_MATCHING_VIEW"));
    }

    private void setupClickListeners() {
        likeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                onLike();
            }
        });

        dislikeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                onDislike();
            }
        });
    }

    private void showCurrentProfile() {
        if (currentProfileIndex >= profiles.size()) {
            // No hay más perfiles
            finishWithResult("close", null);
            return;
        }

        UserProfile profile = profiles.get(currentProfileIndex);
        
        profileName.setText(profile.getFullName());
        profileLocation.setText(profile.city + ", " + profile.country);
        profilePassions.setText(profile.getPassionsString());
        
        // Calcular edad aproximada (simplificado)
        // En una implementación real, calcularías la edad basada en birthDate
        profileAge.setText("25"); // Placeholder
        
        // Cargar imagen principal
        if (profile.photos != null && !profile.photos.isEmpty()) {
            Glide.with(this)
                .load(profile.photos.get(0))
                .placeholder(R.drawable.placeholder_profile)
                .error(R.drawable.placeholder_profile)
                .into(profileImage);
        } else {
            profileImage.setImageResource(R.drawable.placeholder_profile);
        }

        // Animación de entrada
        AnimatorSet animatorSet = (AnimatorSet) AnimatorInflater.loadAnimator(this, R.animator.card_flip_in);
        animatorSet.setTarget(profileCard);
        animatorSet.start();
    }

    private void onSwipeRight() {
        onLike();
    }

    private void onSwipeLeft() {
        onDislike();
    }

    private void onLike() {
        if (currentProfileIndex < profiles.size()) {
            UserProfile profile = profiles.get(currentProfileIndex);
            animateCardExit(true);
            finishWithResult("like", profile.uid);
        }
    }

    private void onDislike() {
        if (currentProfileIndex < profiles.size()) {
            UserProfile profile = profiles.get(currentProfileIndex);
            animateCardExit(false);
            finishWithResult("dislike", profile.uid);
        }
    }

    private void animateCardExit(boolean isLike) {
        int animatorRes = isLike ? R.animator.card_swipe_right : R.animator.card_swipe_left;
        AnimatorSet animatorSet = (AnimatorSet) AnimatorInflater.loadAnimator(this, animatorRes);
        animatorSet.setTarget(profileCard);
        animatorSet.start();
    }

    private void finishWithResult(String action, String profileId) {
        Intent resultIntent = new Intent();
        resultIntent.putExtra("action", action);
        if (profileId != null) {
            resultIntent.putExtra("profileId", profileId);
        }
        setResult(Activity.RESULT_OK, resultIntent);
        finish();
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
        finishWithResult("close", null);
    }
}