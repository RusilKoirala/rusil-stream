import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { RefreshCw, CheckCircle, Globe } from 'lucide-react-native';
import { env } from '@/config/env';
import { setDeviceToken } from '@/lib/device-token';
import { BrandLogo } from '@/components/ui/BrandLogo';

const POLL_INTERVAL_MS = 3000;
const API_BASE = env.apiBaseUrl;

type Phase = 'loading' | 'ready' | 'polling' | 'success' | 'error';

interface LoginScreenProps {
  onAuthenticated: () => void;
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [focusedBtn, setFocusedBtn] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aliveRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const generateCode = useCallback(async () => {
    stopPolling();
    setPhase('loading');
    setError('');
    setCode('');

    try {
      const res = await fetch(`${API_BASE}/device-auth/generate`, { method: 'POST' });
      const data = await res.json();

      if (!aliveRef.current) return;

      if (res.ok && data.code) {
        setCode(data.code);
        setPhase('polling');
        startPolling(data.code);
      } else {
        setError(data.message || 'Failed to generate code');
        setPhase('error');
      }
    } catch {
      if (!aliveRef.current) return;
      setError('Network error. Check your connection and try again.');
      setPhase('error');
    }
  }, [stopPolling]);

  const startPolling = useCallback((activeCode: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/device-auth/status?code=${activeCode}`);
        const data = await res.json();

        if (!aliveRef.current) return;

        if (data.status === 'activated' && data.token) {
          stopPolling();
          setDeviceToken(data.token);
          setPhase('success');
          setTimeout(() => {
            if (aliveRef.current) onAuthenticated();
          }, 1800);
        } else if (data.status === 'expired') {
          stopPolling();
          setError('Code expired. Generate a new one.');
          setPhase('error');
        }
      } catch {
        // keep trying
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling, onAuthenticated]);

  useEffect(() => {
    aliveRef.current = true;
    generateCode();
    return () => {
      aliveRef.current = false;
      stopPolling();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const digits = code.padEnd(6, ' ').split('').slice(0, 6);

  return (
    <View style={s.root}>
      <View style={s.container}>
        {/* Brand */}
        <View style={s.brand}>
          <BrandLogo size={52} />
          <Text style={s.brandName}>Rusil Stream</Text>
        </View>

        <Text style={s.heading}>Activate Your TV</Text>

        {/* URL box */}
        <View style={s.urlBox}>
          <Globe size={18} color="#E50914" />
          <Text style={s.urlText}>rusilstream.app/link-device</Text>
        </View>

        {/* Code display */}
        {phase === 'loading' ? (
          <View style={s.codeCard}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={s.loadingText}>Generating code…</Text>
          </View>
        ) : phase === 'error' ? (
          <View style={s.codeCard}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity
              style={[s.retryBtn, focusedBtn === 'retry' && s.retryBtnFocused]}
              onFocus={() => setFocusedBtn('retry')}
              onBlur={() => setFocusedBtn(null)}
              onPress={generateCode}
              activeOpacity={0.85}
              hasTVPreferredFocus
            >
              <RefreshCw size={18} color="#fff" />
              <Text style={[s.retryText, focusedBtn === 'retry' && s.retryTextFocused]}>
                Generate New Code
              </Text>
            </TouchableOpacity>
          </View>
        ) : phase === 'success' ? (
          <View style={s.codeCard}>
            <CheckCircle size={60} color="#4ade80" />
            <Text style={s.successTitle}>Device Linked!</Text>
            <Text style={s.successSub}>Loading your profile…</Text>
          </View>
        ) : (
          <View style={s.codeCard}>
            {/* Digit boxes */}
            <View style={s.digitRow}>
              {digits.map((digit, i) => {
                const isEmpty = digit === ' ';
                const addGap = i === 2;
                return (
                  <View
                    key={i}
                    style={[
                      s.digitBox,
                      isEmpty && s.digitBoxEmpty,
                      addGap && s.digitGap,
                    ]}
                  >
                    <Text style={[s.digitText, isEmpty && s.digitTextEmpty]}>
                      {isEmpty ? '–' : digit}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Status */}
            <View style={s.statusRow}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.35)" />
              <Text style={s.statusText}>Waiting for you to enter the code…</Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={s.instructions}>
          <Text style={s.instructionStep}>
            <Text style={s.stepNum}>1.</Text> Open the link above on your phone or computer
          </Text>
          <Text style={s.instructionStep}>
            <Text style={s.stepNum}>2.</Text> Sign in and enter the 6-digit code
          </Text>
          <Text style={s.instructionStep}>
            <Text style={s.stepNum}>3.</Text> Your TV will activate automatically
          </Text>
        </View>

        <Text style={s.expiryHint}>Code expires in 10 minutes</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    maxWidth: 700,
    width: '100%',
    paddingHorizontal: 48,
  },

  /* Brand */
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  brandName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  heading: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 24,
  },

  /* URL */
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(229,9,20,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 36,
  },
  urlText: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: '700',
  },

  /* Code card */
  codeCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 28,
  },

  /* Digit boxes */
  digitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  digitBox: {
    width: 68,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxEmpty: {
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  digitGap: {
    marginRight: 16,
  },
  digitText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '800',
  },
  digitTextEmpty: {
    color: 'rgba(255,255,255,0.12)',
    fontSize: 36,
  },

  /* Status */
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 14,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 16,
    marginTop: 16,
  },

  /* Success */
  successTitle: {
    color: '#4ade80',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 16,
  },
  successSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    marginTop: 8,
  },

  /* Error */
  errorText: {
    color: '#f87171',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  retryBtnFocused: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
    transform: [{ scale: 1.05 }],
  },
  retryText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
  },
  retryTextFocused: {
    color: '#fff',
  },

  /* Instructions */
  instructions: {
    gap: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionStep: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  stepNum: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },

  expiryHint: {
    color: 'rgba(255,255,255,0.18)',
    fontSize: 12,
  },
});
