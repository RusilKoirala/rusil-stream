import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { useNavigation } from '@/navigation/NavigationContext';
import type { PlayerParams } from '@/navigation/types';
import { TVPlayerControls } from '@/components/player/TVPlayerControls';
import {
  VIDKING_BRIDGE_SCRIPT,
  buildVidkingEmbedUrl,
  playerCommandScript,
} from '@/lib/vidking-bridge';

const ALLOWED_HOSTS = ['vidking.net', 'www.vidking.net', 'videasy.to', 'users.videasy.to'];
const LOAD_TIMEOUT_MS = 25_000;
const CONTROLS_HIDE_MS = 6000;

const BLOCK_REDIRECT_SCRIPT = `
  (function() {
    const originalOpen = window.open;
    window.open = function(url) {
      if (!url) return null;
      try {
        const parsed = new URL(url, window.location.href);
        if (parsed.hostname.includes('vidking.net') || parsed.hostname.includes('videasy.to')) {
          return originalOpen ? originalOpen.apply(window, arguments) : null;
        }
      } catch (e) {}
      return null;
    };
  })();
  true;
`;

function canNavigate(url: string) {
  try {
    if (url.startsWith('about:blank') || url.startsWith('data:')) return true;
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

interface BridgeMessage {
  type?: string;
  event?: string;
  data?: { event?: string; currentTime?: number; duration?: number; paused?: boolean };
  currentTime?: number;
  duration?: number;
  paused?: boolean;
}

interface PlayerScreenProps {
  params: PlayerParams;
}

export function PlayerScreen({ params }: PlayerScreenProps) {
  const { id, type, season = 1, episode = 1, title } = params;
  const { goBack } = useNavigation();
  const webRef = useRef<WebView>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const src = useMemo(() => buildVidkingEmbedUrl({ id, type, season, episode, title }), [episode, id, season, title, type]);

  const inject = useCallback((command: Parameters<typeof playerCommandScript>[0]) => {
    webRef.current?.injectJavaScript(playerCommandScript(command));
  }, []);

  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
  }, []);

  useEffect(() => {
    bumpControls();
    const timer = setTimeout(() => setIsLoading(false), LOAD_TIMEOUT_MS);
    return () => {
      clearTimeout(timer);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [bumpControls, src]);

  const onBridgeMessage = useCallback((raw: string) => {
    try {
      const msg = JSON.parse(raw) as BridgeMessage;
      if (msg.type === 'PLAYER_READY') {
        setIsLoading(false);
        bumpControls();
      }

      const eventName = msg.type === 'PLAYER_EVENT' ? msg.data?.event : msg.event;
      const time = msg.type === 'PLAYER_EVENT' ? msg.data?.currentTime : msg.currentTime;
      const dur = msg.type === 'PLAYER_EVENT' ? msg.data?.duration : msg.duration;

      if (typeof time === 'number') setCurrentTime(time);
      if (typeof dur === 'number' && dur > 0) setDuration(dur);

      if (eventName === 'play' || eventName === 'timeupdate') setIsPlaying(true);
      if (eventName === 'pause' || eventName === 'ended') setIsPlaying(false);
      if (typeof msg.paused === 'boolean') setIsPlaying(!msg.paused);
    } catch {
      // ignore malformed bridge payloads
    }
  }, [bumpControls]);

  return (
    <View style={styles.root}>
      {isLoading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Loading stream…</Text>
        </View>
      ) : null}

      {hasError ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Could not load video stream</Text>
          <Text style={styles.errorSub}>Try opening this title again from Details.</Text>
        </View>
      ) : null}

      <WebView
        ref={webRef}
        source={{ uri: src }}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={BLOCK_REDIRECT_SCRIPT}
        injectedJavaScript={VIDKING_BRIDGE_SCRIPT}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mixedContentMode="always"
        focusable
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
          webRef.current?.injectJavaScript(VIDKING_BRIDGE_SCRIPT);
          bumpControls();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onHttpError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onMessage={(event) => onBridgeMessage(event.nativeEvent.data)}
        onShouldStartLoadWithRequest={(request: WebViewNavigation) => {
          if (request.isTopFrame === false) return true;
          if (canNavigate(request.url)) return true;
          webRef.current?.stopLoading();
          return false;
        }}
        originWhitelist={['https://*', 'http://*', 'about:blank']}
        setSupportMultipleWindows={false}
        javaScriptCanOpenWindowsAutomatically={false}
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      />

      <TVPlayerControls
        visible={controlsVisible && !hasError}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        title={title}
        onTogglePlay={() => {
          inject('toggle');
          bumpControls();
        }}
        onSeekBack={() => {
          inject({ seekBy: -10 });
          bumpControls();
        }}
        onSeekForward={() => {
          inject({ seekBy: 10 });
          bumpControls();
        }}
        onBack={goBack}
      />

      {!controlsVisible && !hasError && !isLoading ? (
        <TouchableOpacity
          style={styles.showControlsTap}
          activeOpacity={1}
          onFocus={bumpControls}
          onPress={bumpControls}
          accessibilityLabel="Show player controls"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: { color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: 15 },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  errorTitle: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  errorSub: { color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 8, textAlign: 'center' },
  peekHint: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  peekText: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  showControlsTap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
    backgroundColor: 'transparent',
  },
});
