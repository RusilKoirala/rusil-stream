import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, TextInput, Alert, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706', '#0891b2'];

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingRow({ icon, label, value, onPress, danger, rightElement }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={17} color={danger ? '#ef4444' : '#fff'} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={15} color={danger ? '#ef4444' : '#333'} />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, profileId, logout, selectProfile } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [creating, setCreating] = useState(false);

  const deviceInfo = {
    platform: Platform.OS,
    version: String(Platform.Version),
    appVersion: Constants.expoConfig?.version || '1.0.0',
    sdkVersion: Constants.expoConfig?.sdkVersion || '54.0.0',
    deviceName: Constants.deviceName || 'Unknown',
  };

  useEffect(() => { fetchProfiles(); }, []);

  async function fetchProfiles() {
    try {
      const data = await api.getProfiles();
      setProfiles(data?.user?.profiles || []);
      setEmail(data?.user?.email || user?.email || '');
    } catch (e) {
      console.error('Profiles fetch error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function getToken() {
    try {
      const SS = await import('expo-secure-store');
      return await SS.getItemAsync('streaming_app_auth_token');
    } catch { return null; }
  }

  async function handleCreateProfile() {
    if (!newProfileName.trim()) return;
    setCreating(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.rusilstream.app';
      const t = await getToken();
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ name: newProfileName.trim() }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewProfileName('');
        fetchProfiles();
      } else {
        const d = await res.json();
        Alert.alert('Error', d.error || 'Failed to create profile');
      }
    } catch {
      Alert.alert('Error', 'Failed to create profile');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateProfile() {
    if (!editingId || !editName.trim()) return;
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.rusilstream.app';
      const t = await getToken();
      await fetch(`${baseUrl}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ profileId: editingId, name: editName.trim() }),
      });
      setEditingId(null);
      setEditName('');
      fetchProfiles();
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    }
  }

  async function handleDeleteProfile(pid, name) {
    Alert.alert(`Delete "${name}"?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.rusilstream.app';
            const t = await getToken();
            await fetch(`${baseUrl}/api/profile?profileId=${pid}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${t}` },
            });
            if (profileId === pid) await selectProfile(null);
            fetchProfiles();
          } catch {
            Alert.alert('Error', 'Failed to delete profile');
          }
        },
      },
    ]);
  }

  async function handleLogout() {
    Alert.alert('Sign Out', 'Sign out of all devices?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try { await api.logout(); } catch {}
          await logout();
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  const activeProfile = profiles.find(p => p._id?.toString() === profileId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Active Profile */}
      {activeProfile && (
        <>
          <SectionHeader title="ACTIVE PROFILE" />
          <View style={styles.card}>
            <View style={styles.activeProfileRow}>
              <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[profiles.indexOf(activeProfile) % AVATAR_COLORS.length] }]}>
                <Text style={styles.avatarText}>{activeProfile.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.activeProfileName}>{activeProfile.name}</Text>
                <Text style={styles.activeProfileSub}>Currently watching as this profile</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Account */}
      <SectionHeader title="ACCOUNT" />
      <View style={styles.card}>
        <SettingRow icon="mail-outline" label="Email" value={email} />
        <View style={styles.divider} />
        <SettingRow icon="shield-checkmark-outline" label="Account Status" value="Verified ✓" />
        <View style={styles.divider} />
        <SettingRow icon="time-outline" label="Session" value="Active" />
      </View>

      {/* Profiles */}
      <SectionHeader title="PROFILES" />
      <View style={styles.card}>
        {profiles.map((profile, index) => (
          <View key={profile._id}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.profileRow}>
              <TouchableOpacity
                style={styles.profileLeft}
                onPress={() => selectProfile(profile._id.toString())}
                activeOpacity={0.7}
              >
                <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                  <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.profileInfo}>
                  {editingId === profile._id ? (
                    <TextInput
                      style={styles.editInput}
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                      placeholder="Profile name"
                      placeholderTextColor="#555"
                    />
                  ) : (
                    <>
                      <Text style={styles.profileName}>{profile.name}</Text>
                      <Text style={[styles.profileSub, profileId === profile._id?.toString() && styles.profileSubActive]}>
                        {profileId === profile._id?.toString() ? '● Active' : 'Tap to select'}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.profileActions}>
                {editingId === profile._id ? (
                  <>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleUpdateProfile}>
                      <Ionicons name="checkmark" size={18} color="#22c55e" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => { setEditingId(null); setEditName(''); }}>
                      <Ionicons name="close" size={18} color="#888" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => { setEditingId(profile._id); setEditName(profile.name); }}>
                      <Ionicons name="pencil-outline" size={16} color="#888" />
                    </TouchableOpacity>
                    {profiles.length > 1 && (
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteProfile(profile._id.toString(), profile.name)}>
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        ))}

        {profiles.length < 5 && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.addProfileBtn} onPress={() => setShowCreateModal(true)} activeOpacity={0.7}>
              <View style={styles.addProfileIcon}>
                <Ionicons name="add" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.addProfileText}>Add New Profile</Text>
              <Text style={styles.addProfileCount}>{profiles.length}/5</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Playback */}
      <SectionHeader title="PLAYBACK" />
      <View style={styles.card}>
        <SettingRow icon="play-circle-outline" label="Default Source" value="vidsrc.xyz" />
        <View style={styles.divider} />
        <SettingRow icon="phone-landscape-outline" label="Auto Landscape" value="On" />
        <View style={styles.divider} />
        <SettingRow icon="volume-high-outline" label="Audio" value="Default" />
      </View>

      {/* Device */}
      <SectionHeader title="DEVICE" />
      <View style={styles.card}>
        <SettingRow icon="phone-portrait-outline" label="Device" value={deviceInfo.deviceName} />
        <View style={styles.divider} />
        <SettingRow icon="logo-android" label="Platform" value={`${deviceInfo.platform} ${deviceInfo.version}`} />
        <View style={styles.divider} />
        <SettingRow icon="wifi-outline" label="API Server" value={process.env.EXPO_PUBLIC_API_URL || 'api.rusilstream.app'} />
      </View>

      {/* App */}
      <SectionHeader title="APP" />
      <View style={styles.card}>
        <SettingRow icon="information-circle-outline" label="Version" value={deviceInfo.appVersion} />
        <View style={styles.divider} />
        <SettingRow icon="code-slash-outline" label="Expo SDK" value={deviceInfo.sdkVersion} />
        <View style={styles.divider} />
        <SettingRow icon="server-outline" label="Environment" value="Development" />
        <View style={styles.divider} />
        <SettingRow icon="star-outline" label="Rate the App" onPress={() => {}} />
      </View>

      {/* Sign Out */}
      <SectionHeader title="" />
      <View style={styles.card}>
        <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
      </View>

      <View style={{ height: 32 }} />

      {/* Create Profile Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Profile</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Profile name"
              placeholderTextColor="#555"
              value={newProfileName}
              onChangeText={setNewProfileName}
              autoFocus
              maxLength={20}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setShowCreateModal(false); setNewProfileName(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreateBtn, !newProfileName.trim() && styles.modalCreateBtnDisabled]}
                onPress={handleCreateProfile}
                disabled={!newProfileName.trim() || creating}
              >
                {creating
                  ? <ActivityIndicator size="small" color="#000" />
                  : <Text style={styles.modalCreateText}>Create</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { paddingTop: 52, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' },
  pageTitle: { color: '#fff', fontSize: 28, fontWeight: '900', paddingHorizontal: 16, marginBottom: 24 },

  sectionHeader: {
    color: '#444', fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    paddingHorizontal: 16, marginBottom: 8, marginTop: 20,
  },
  card: {
    marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 52 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rowIconDanger: { backgroundColor: 'rgba(239,68,68,0.12)' },
  rowContent: { flex: 1 },
  rowLabel: { color: '#fff', fontSize: 14, fontWeight: '500' },
  rowLabelDanger: { color: '#ef4444' },
  rowValue: { color: '#555', fontSize: 12, marginTop: 1 },

  activeProfileRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  activeProfileName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  activeProfileSub: { color: '#555', fontSize: 12, marginTop: 2 },

  profileRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  profileLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  profileSub: { color: '#555', fontSize: 11, marginTop: 2 },
  profileSubActive: { color: '#22c55e' },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, color: '#fff', fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  profileActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  addProfileBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13, gap: 12,
  },
  addProfileIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
  },
  addProfileText: { flex: 1, color: '#3b82f6', fontSize: 14, fontWeight: '600' },
  addProfileCount: { color: '#444', fontSize: 12 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  modalCard: {
    width: '100%', backgroundColor: '#1a1a1a',
    borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  modalCancelText: { color: '#888', fontWeight: '600' },
  modalCreateBtn: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  modalCreateBtnDisabled: { opacity: 0.4 },
  modalCreateText: { color: '#000', fontWeight: '800' },
});
