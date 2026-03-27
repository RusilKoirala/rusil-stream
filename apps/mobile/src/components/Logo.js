import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Matches the web navbar logo exactly:
 * - Blue gradient rounded square with "RS" slightly rotated
 * - "Rusil" in white + "Stream" in blue-400
 */
export default function Logo({ size = 1 }) {
  const iconSize = 36 * size;
  const fontSize = 20 * size;
  const brandSize = 20 * size;

  return (
    <View style={styles.container}>
      {/* RS icon — rotated square with gradient-like bg */}
      <View style={[styles.iconWrap, { width: iconSize, height: iconSize, borderRadius: 8 * size, transform: [{ rotate: '3deg' }] }]}>
        <Text style={[styles.iconText, { fontSize: fontSize, transform: [{ rotate: '-3deg' }] }]}>RS</Text>
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
    gap: 10,
  },
  iconWrap: {
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
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
