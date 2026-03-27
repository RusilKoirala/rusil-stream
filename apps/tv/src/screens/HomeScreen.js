import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Logo from '../components/Logo';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size={1.2} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.text}>Welcome to Rusil Stream TV</Text>
        <Text style={styles.subtitle}>Your favorite content on the big screen</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  header: {
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 32,
  },
  text: { 
    color: '#fff', 
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 20,
  },
});
