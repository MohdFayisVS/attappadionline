package in.attappadionline.admin;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.ValueCallback;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.ProgressBar;

public class MainActivity extends Activity {
 private static final String ADMIN_URL = "https://www.attappadionline.in/#admin-portal-attappadi";
 private WebView web; private ValueCallback<Uri[]> fileCallback;
 private static final int FILE_REQUEST = 310;
 @Override public void onCreate(Bundle savedInstanceState) { super.onCreate(savedInstanceState);
  ProgressBar progress = new ProgressBar(this); progress.setIndeterminate(true);
  web = new WebView(this); setContentView(web);
  WebSettings settings = web.getSettings(); settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true); settings.setAllowFileAccess(false); settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.setWebViewClient(new WebViewClient() {
   @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
    Uri uri = request.getUrl(); String host = uri.getHost();
    if ("https".equals(uri.getScheme()) && ("attappadionline.in".equals(host) || "www.attappadionline.in".equals(host))) return false;
    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {} return true;
   }
  });
  web.setWebChromeClient(new WebChromeClient() {
   @Override public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> callback, FileChooserParams params) {
    if (fileCallback != null) fileCallback.onReceiveValue(null); fileCallback=callback;
    try { startActivityForResult(params.createIntent(), FILE_REQUEST); return true; } catch (Exception e) { fileCallback=null; return false; }
   }
  });
  if (savedInstanceState != null) web.restoreState(savedInstanceState); else web.loadUrl(ADMIN_URL);
 }
 @Override protected void onActivityResult(int requestCode,int resultCode,Intent data) { super.onActivityResult(requestCode,resultCode,data); if(requestCode==FILE_REQUEST && fileCallback!=null){fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode,data));fileCallback=null;} }
 @Override public void onBackPressed(){if(web!=null && web.canGoBack()) web.goBack();else super.onBackPressed();}
 @Override protected void onSaveInstanceState(Bundle state){web.saveState(state);super.onSaveInstanceState(state);}
}
