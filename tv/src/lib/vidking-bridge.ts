import type { PlayerParams } from '@/navigation/types';
import { env } from '@/config/env';

/** Injected once per WebView load — finds <video> and forwards state to RN. */
export const VIDKING_BRIDGE_SCRIPT = `
(function() {
  if (window.__tvBridgeInstalled) return;
  window.__tvBridgeInstalled = true;

  function post(obj) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(obj));
    }
  }

  function findVideo() {
    var v = document.querySelector('video');
    if (v) return v;
    var iframes = document.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      try {
        var doc = iframes[i].contentDocument;
        if (doc) {
          v = doc.querySelector('video');
          if (v) return v;
        }
      } catch (e) {}
    }
    return null;
  }

  function getVideo() {
    var v = findVideo();
    if (v) window.__tvVideo = v;
    return window.__tvVideo || null;
  }

  window.__tvPlayer = {
    play: function() {
      var v = getVideo();
      if (v) { v.play().catch(function(){}); return true; }
      var btn = document.querySelector('[aria-label*="Play" i], .plyr__control--overlaid, button[class*="play" i]');
      if (btn) { btn.click(); return true; }
      return false;
    },
    pause: function() {
      var v = getVideo();
      if (v) { v.pause(); return true; }
      return false;
    },
    toggle: function() {
      var v = getVideo();
      if (v) { v.paused ? v.play().catch(function(){}) : v.pause(); return true; }
      return window.__tvPlayer.play();
    },
    seekBy: function(delta) {
      var v = getVideo();
      if (!v || !isFinite(v.duration)) return false;
      v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
      return true;
    },
    seekTo: function(t) {
      var v = getVideo();
      if (!v) return false;
      v.currentTime = Math.max(0, Math.min(v.duration || t, t));
      return true;
    },
    openSettings: function() {
      var selectors = [
        'button[aria-label*="Settings" i]',
        'button[aria-label*="Quality" i]',
        '.plyr__menu__button',
        '[class*="settings" i]',
        '[class*="quality" i]'
      ];
      for (var i = 0; i < selectors.length; i++) {
        var el = document.querySelector(selectors[i]);
        if (el) { el.click(); post({ type: 'SETTINGS_OPENED' }); return true; }
      }
      post({ type: 'SETTINGS_MISSING' });
      return false;
    },
    getState: function() {
      var v = getVideo();
      if (!v) return { ready: false };
      return { ready: true, paused: v.paused, currentTime: v.currentTime, duration: v.duration };
    }
  };

  function bindVideo(v) {
    if (!v || v.__tvBound) return;
    v.__tvBound = true;
    post({ type: 'PLAYER_READY' });
    var events = ['play', 'pause', 'timeupdate', 'ended'];
    for (var i = 0; i < events.length; i++) {
      (function(ev) {
        v.addEventListener(ev, function() {
          post({
            type: 'PLAYER_STATE',
            event: ev,
            currentTime: v.currentTime,
            duration: v.duration,
            paused: v.paused
          });
        });
      })(events[i]);
    }
  }

  window.addEventListener('message', function(e) {
    try {
      var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data && data.type === 'PLAYER_EVENT') post(data);
    } catch (err) {}
  });

  var attempts = 0;
  var poll = setInterval(function() {
    attempts++;
    var v = findVideo();
    if (v) { bindVideo(v); clearInterval(poll); }
    if (attempts > 120) clearInterval(poll);
  }, 500);
})();
true;
`;

export function buildVidkingEmbedUrl(params: PlayerParams): string {
  const base = env.vidkingBaseUrl.replace(/\/$/, '');
  const path =
    params.type === 'tv'
      ? `/embed/tv/${params.id}/${params.season ?? 1}/${params.episode ?? 1}`
      : `/embed/movie/${params.id}`;

  const qs = new URLSearchParams({
    color: 'e50914',
    autoPlay: 'true',
  });

  if (params.type === 'tv') {
    qs.set('nextEpisode', 'true');
    qs.set('episodeSelector', 'true');
  }

  return `${base}${path}?${qs.toString()}`;
}

export type PlayerBridgeCommand =
  | 'play'
  | 'pause'
  | 'toggle'
  | 'openSettings'
  | { seekBy: number }
  | { seekTo: number };

export function playerCommandScript(command: PlayerBridgeCommand): string {
  if (typeof command === 'string') {
    return `window.__tvPlayer && window.__tvPlayer.${command}(); true;`;
  }
  if ('seekBy' in command) {
    return `window.__tvPlayer && window.__tvPlayer.seekBy(${command.seekBy}); true;`;
  }
  return `window.__tvPlayer && window.__tvPlayer.seekTo(${command.seekTo}); true;`;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}
