import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Logo from '../components/Logo';

const { width: W, height: H } = Dimensions.get('window');
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://rusilstream.app';

function Field({ label, icon, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize }) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <Ionicons name={icon} size={16} color={focused ? '#60a5fa' : '#444'} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#444"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPass(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={16} color="#444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function switchMode(toSignup) {
    Animated.timing(slideAnim, {
      toValue: toSignup ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsSignup(toSignup);
    setError('');
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        if (!name.trim()) { setError('Please enter a profile name'); setLoading(false); return; }
        const res = await fetch(`${BASE_URL}/api/auth/send-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (res.ok) {
          Alert.alert('Check your email', `We sent a verification link to ${email}. Click it to activate your account.`);
          switchMode(false);
          setEmail('');
          setPassword('');
          setName('');
        } else {
          setError(data.error || data.details || 'Signup failed');
        }
      } else {
        const data = await api.login(email, password);
        if (data?.token) {
          const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const meData = meRes.ok ? await meRes.json() : null;
          const firstProfileId = meData?.user?.profiles?.[0]?._id?.toString() || null;
          await login(data.token, firstProfileId);
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], width: '100%', alignItems: 'center' }}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Logo size={1.2} />
            <Text style={styles.tagline}>Stream anything, anywhere</Text>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, !isSignup && styles.tabActive]} onPress={() => switchMode(false)} activeOpacity={0.8}>
              <Text style={[styles.tabText, !isSignup && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, isSignup && styles.tabActive]} onPress={() => switchMode(true)} activeOpacity={0.8}>
              <Text style={[styles.tabText, isSignup && styles.tabTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Card */}
          <View style={styles.card}>
          {isSignup && (
            <Field label="Your Name" icon="person-outline" value={name} onChangeText={setName} placeholder="Enter your name" autoCapitalize="words" />
          )}
          <Field label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" />
          <Field label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry />

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color="#f87171" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>{isSignup ? 'Create Account' : 'Sign In'}</Text>
                <Ionicons name="arrow-forward" size={16} color="#000" />
              </>
            )}
          </TouchableOpacity>

          {isSignup && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={14} color="#60a5fa" />
              <Text style={styles.infoText}>A verification email will be sent. Click the link to activate.</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>© 2025 Rusil Stream · Educational Project</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#050508' },

  blob1: {
    position: 'absolute', width: W * 0.7, height: W * 0.7,
    borderRadius: W * 0.35, backgroundColor: '#1d4ed8',
    opacity: 0.07, top: -W * 0.2, left: -W * 0.2,
  },
  blob2: {
    position: 'absolute', width: W * 0.6, height: W * 0.6,
    borderRadius: W * 0.3, backgroundColor: '#7c3aed',
    opacity: 0.06, bottom: H * 0.1, right: -W * 0.2,
  },

  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  logoWrap: { alignItems: 'center', marginBottom: 32 },
  tagline: { color: '#444', fontSize: 13, marginTop: 8, letterSpacing: 0.3 },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#555', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '800' },

  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },

  field: { marginBottom: 12 },
  label: { color: '#666', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10,
  },
  inputWrapFocused: { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)' },
  inputIcon: {},
  input: { flex: 1, color: '#fff', fontSize: 15 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 10, padding: 12, marginBottom: 4,
  },
  errorText: { color: '#f87171', fontSize: 13, flex: 1 },

  submitBtn: {
    backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    marginTop: 8, flexDirection: 'row', gap: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
    borderRadius: 10, padding: 12, marginTop: 8,
  },
  infoText: { color: '#93c5fd', fontSize: 12, lineHeight: 18, flex: 1 },

  footer: { color: '#2a2a2a', fontSize: 11, marginTop: 32, textAlign: 'center' },
});
