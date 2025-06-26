package com.aetheria.spaceweather;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create WebView programmatically
        webView = new WebView(this);
        setContentView(webView);
        
        // Enable JavaScript
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        // Note: AppCache has been deprecated and removed in newer Android versions
        
        // Use WebViewClient to keep navigation within the WebView
        webView.setWebViewClient(new WebViewClient());
        
        // Load the PWA URL
        webView.loadUrl("https://aetheria-space-weather.windsurf.build/");
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
