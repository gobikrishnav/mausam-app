package in.gov.imd.mausam;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        try {
            WebView webView = this.getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                String defaultUserAgent = settings.getUserAgentString();
                // Strip out "; wv" and "Version/4.0" so Google OAuth is permitted inside the app WebView
                String cleanUserAgent = defaultUserAgent
                    .replace("; wv", "")
                    .replaceAll("Version/[0-9.]+\\s*", "");
                settings.setUserAgentString(cleanUserAgent);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);
                settings.setSupportMultipleWindows(false);
            }
        } catch (Exception e) {
            // Fallback gracefully if bridge is not ready
        }
    }
}
