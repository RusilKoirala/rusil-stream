import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Logo from '../components/Logo';

const { width: W, height: H } = Dimensions.get('window');

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.75)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
      ]),
      Animated.timing(glowOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
        <Logo size={1.6} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: W * 0.8,
    height: W * 0.8,
    borderRadius: W * 0.4,
    backgroundColor: '#3b82f6',
    opacity: 0.08,
    top: H / 2 - W * 0.4,
    left: W * 0.1,
  },
});
