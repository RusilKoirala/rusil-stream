import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Logo from '../components/Logo';

const { width: W, height: H } = Dimensions.get('window');

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(opacity, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true 
      }),
      Animated.spring(scale, { 
        toValue: 1, 
        friction: 8, 
        tension: 40, 
        useNativeDriver: true 
      }),
      Animated.timing(glowOpacity, { 
        toValue: 1, 
        duration: 1000, 
        useNativeDriver: true 
      }),
      Animated.spring(glowScale, { 
        toValue: 1, 
        friction: 6, 
        tension: 30, 
        useNativeDriver: true 
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background glow with animation */}
      <Animated.View 
        style={[
          styles.glow, 
          { 
            opacity: glowOpacity,
            transform: [{ scale: glowScale }]
          }
        ]} 
      />

      {/* Secondary glow for depth */}
      <Animated.View 
        style={[
          styles.glowSecondary, 
          { 
            opacity: Animated.multiply(glowOpacity, 0.5),
            transform: [{ scale: Animated.multiply(glowScale, 1.2) }]
          }
        ]} 
      />

      <Animated.View 
        style={{ 
          opacity, 
          transform: [{ scale }], 
          alignItems: 'center' 
        }}
      >
        <Logo size={2} />
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
    width: W * 0.4,
    height: W * 0.4,
    borderRadius: W * 0.2,
    backgroundColor: '#3b82f6',
    opacity: 0.15,
  },
  glowSecondary: {
    position: 'absolute',
    width: W * 0.3,
    height: W * 0.3,
    borderRadius: W * 0.15,
    backgroundColor: '#06b6d4',
    opacity: 0.1,
  },
});
