import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * TV-optimized logo with larger size and better visibility
 * Matches the web navbar logo design
 */
export default function Logo({ size = 1.5 }) {
  const iconSize = 48 * size;
  const fontSize = 26 * size;
  const brandSize = 28 * size;

  return (
    <View style={styles.container}>
      {/* RS icon — rotated square with gradient */}
      <View style={[styles.iconRotate, { transform: [{ rotate: '3deg' }] }]}>
        <LinearGradient
          colors={['#3b82f6', '#06b6d4']} // blue-500 to cyan-500
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconWrap, { width: iconSize, height: iconSize, borderRadius: 12 * size }]}
        >
          <Text style={[styles.iconText, { fontSize: fontSize, transform: [{ rotate: '-3deg' }] }]}>RS</Text>
        </LinearGradient>
      </View>

      {/* Brand text */}
      <View style={styles.textWrap}>
        <Text style={[styles.brandText, { fontSize: brandSize }]}>
          <Text style={styles.rusil}>Rusil</Text>
          <Text style={styles.stream}>Stream</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconRotate: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  textWrap: { flexDirection: 'row' },
  brandText: { fontWeight: '900', letterSpacing: -0.5 },
  rusil: { color: '#fff' },
  stream: { color: '#60a5fa' }, // blue-400
});
