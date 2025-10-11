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

@CapacitorPlugin(name = "MatchingPlugin")
public class MatchingPlugin extends Plugin {

    private static final int MATCHING_REQUEST_CODE = 1001;
    private PluginCall currentCall;

    @PluginMethod
    public void openMatchingView(PluginCall call) {
        try {
            String currentUserId = call.getString("currentUserId");
            JSONArray profilesArray = call.getArray("profiles");
            
            if (currentUserId == null || profilesArray == null) {
                call.reject("Missing required parameters");
                return;
            }

            // Convertir JSONArray a List<UserProfile>
            List<UserProfile> profiles = parseProfiles(profilesArray);
            
            // Guardar la llamada para responder después
            this.currentCall = call;
            
            // Crear intent para abrir la actividad nativa
            Intent intent = new Intent(getContext(), MatchingActivity.class);
            intent.putExtra("currentUserId", currentUserId);
            intent.putParcelableArrayListExtra("profiles", new ArrayList<>(profiles));
            
            startActivityForResult(call, intent, MATCHING_REQUEST_CODE);
            
        } catch (Exception e) {
            call.reject("Error opening matching view: " + e.getMessage());
        }
    }

    @PluginMethod
    public void updateProfiles(PluginCall call) {
        try {
            JSONArray profilesArray = call.getArray("profiles");
            if (profilesArray == null) {
                call.reject("Missing profiles parameter");
                return;
            }

            List<UserProfile> profiles = parseProfiles(profilesArray);
            
            // Enviar broadcast para actualizar la actividad si está activa
            Intent updateIntent = new Intent("UPDATE_PROFILES");
            updateIntent.putParcelableArrayListExtra("profiles", new ArrayList<>(profiles));
            getContext().sendBroadcast(updateIntent);
            
            call.resolve();
        } catch (Exception e) {
            call.reject("Error updating profiles: " + e.getMessage());
        }
    }

    @PluginMethod
    public void closeMatchingView(PluginCall call) {
        // Enviar broadcast para cerrar la actividad
        Intent closeIntent = new Intent("CLOSE_MATCHING_VIEW");
        getContext().sendBroadcast(closeIntent);
        call.resolve();
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        
        if (requestCode == MATCHING_REQUEST_CODE && currentCall != null) {
            JSObject result = new JSObject();
            
            if (resultCode == android.app.Activity.RESULT_OK && data != null) {
                String action = data.getStringExtra("action");
                String profileId = data.getStringExtra("profileId");
                
                result.put("action", action);
                if (profileId != null) {
                    result.put("profileId", profileId);
                }
            } else {
                result.put("action", "close");
            }
            
            currentCall.resolve(result);
            currentCall = null;
        }
    }

    private List<UserProfile> parseProfiles(JSONArray profilesArray) throws JSONException {
        List<UserProfile> profiles = new ArrayList<>();
        
        for (int i = 0; i < profilesArray.length(); i++) {
            JSONObject profileJson = profilesArray.getJSONObject(i);
            UserProfile profile = new UserProfile();
            
            profile.uid = profileJson.getString("uid");
            profile.name = profileJson.getString("name");
            profile.lastName = profileJson.getString("lastName");
            profile.birthDate = profileJson.getString("birthDate");
            profile.city = profileJson.getString("city");
            profile.country = profileJson.getString("country");
            profile.gender = profileJson.getString("gender");
            
            // Parse passions
            JSONArray passionsArray = profileJson.getJSONArray("passions");
            List<String> passions = new ArrayList<>();
            for (int j = 0; j < passionsArray.length(); j++) {
                JSONObject passion = passionsArray.getJSONObject(j);
                passions.add(passion.getString("category"));
            }
            profile.passions = passions;
            
            // Parse photos
            JSONArray photosArray = profileJson.getJSONArray("photos");
            List<String> photos = new ArrayList<>();
            for (int j = 0; j < photosArray.length(); j++) {
                photos.add(photosArray.getString(j));
            }
            profile.photos = photos;
            
            profiles.add(profile);
        }
        
        return profiles;
    }
}