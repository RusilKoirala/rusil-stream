import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedScreen from '../screens/SavedScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import PlayerScreen from '../screens/PlayerScreen';
import SplashScreen from '../screens/SplashScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_CONFIG = {
  Home:     { icon: 'home',     iconOutline: 'home-outline'     },
  Search:   { icon: 'search',   iconOutline: 'search-outline'   },
  Saved:    { icon: 'bookmark', iconOutline: 'bookmark-outline' },
  Settings: { icon: 'settings', iconOutline: 'settings-outline' },
};

function TabIcon({ name, focused, color }) {
  const cfg = TAB_CONFIG[name];
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Ionicons
        name={focused ? cfg.icon : cfg.iconOutline}
        size={22}
        color={focused ? '#fff' : '#444'}
      />
    </View>
  );
}

function TabLabel({ name, focused }) {
  return (
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
      {name}
    </Text>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tabStyles.bar,
        tabBarBackground: () => <View style={tabStyles.barBg} />,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarLabel: ({ focused }) => (
          <TabLabel name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#444',
        tabBarItemStyle: tabStyles.item,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) return <SplashScreen />;

  if (!token) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050508' }, animation: 'fade' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0a0a' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 64 : 80,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  barBg: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  item: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 8 : 4,
    height: Platform.OS === 'android' ? 64 : 80,
  },
  iconWrap: {
    width: 44,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#444',
    marginTop: 2,
  },
  labelActive: {
    color: '#fff',
  },
});
