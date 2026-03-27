import React, { useState, useRef, useEffect } from 'react';
import {
  View, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.rusilstream.app';

// Injected JS — block popups only, allow data: and blob: for player internals
const INJECT_JS = `
(function() {
  var _open = window.open;
  window.open = function(url) {
    if (!url) return null;
    var u = url.toString().toLowerCase();
    var ads = ['popads','popcash','exoclick','adsterra','propellerads','tsyndicate','doubleclick'];
    if (ads.some(function(d){ return u.indexOf(d) !== -1; })) return null;
    return null; // block all new windows
  };
  window.addEventListener('blur', function() {
    setTimeout(function() { try { window.focus(); } catch(e) {} }, 100);
  });
  true;
})();
`;

export default function PlayerScreen({ route, navigation }) {
  const { id, isTV = false, title = '', season = 1, episode = 1, sourceIndex = 0 } = route.params;
  const [webviewKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webviewRef = useRef(null);

  const proxyUrl = `${BASE_URL}/api/stream/proxy?id=${id}&type=${isTV ? 'tv' : 'movie'}&season=${season}&episode=${episode}&source=${sourceIndex}`;

  // Lock to landscape on mount, restore on unmount
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  function handleBack() {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Minimal back button — top left, semi-transparent */}
      <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
        <View style={styles.backCircle}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.errorOverlay}>
          <Ionicons name="alert-circle-outline" size={44} color="#ef4444" />
          <Text style={styles.errorText}>Stream unavailable</Text>
          <Text style={styles.errorSub}>Try a different source from the movie page</Text>
          <TouchableOpacity style={styles.backBtnLarge} onPress={handleBack}>
            <Text style={styles.backBtnLargeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <WebView
        key={webviewKey}
        ref={webviewRef}
        source={{ uri: proxyUrl }}
        style={styles.webview}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        mixedContentMode="always"
        injectedJavaScript={INJECT_JS}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
        onHttpError={() => { setError(true); setLoading(false); }}
        onShouldStartLoadWithRequest={(req) => {
          const url = req.url.toLowerCase();
          // Always allow data: and blob: — used by players internally
          if (url.startsWith('data:') || url.startsWith('blob:')) return true;
          // Always allow our proxy
          if (req.url.startsWith(BASE_URL)) return true;
          // Block known ad networks
          const blocked = [
            'popads.net', 'popcash.net', 'exoclick.com', 'adsterra.com',
            'propellerads.com', 'tsyndicate.com', 'doubleclick.net',
            'googlesyndication.com',
          ];
          if (blocked.some(d => url.includes(d))) return false;
          return true;
        }}
        userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },

  backBtn: {
    position: 'absolute', top: 12, left: 12, zIndex: 100,
  },
  backCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10, gap: 12,
  },
  loadingText: { color: '#666', fontSize: 13 },

  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10, gap: 10, paddingHorizontal: 32,
  },
  errorText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorSub: { color: '#555', fontSize: 13, textAlign: 'center' },
  backBtnLarge: {
    marginTop: 8, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  backBtnLargeText: { color: '#fff', fontWeight: '600' },
});
