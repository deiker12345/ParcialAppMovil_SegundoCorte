package io.ionic.starter;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Registrar los plugins nativos
        registerPlugin(MatchingPlugin.class);
        registerPlugin(ChatPlugin.class);
    }
}