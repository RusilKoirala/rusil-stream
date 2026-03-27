import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={{ dark: true, colors: { background: '#0a0a0a', card: '#111', text: '#fff', border: '#1a1a1a', primary: '#fff', notification: '#fff' } }}>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

registerRootComponent(App);
