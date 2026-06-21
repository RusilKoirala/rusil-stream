import { Image, StyleSheet, View } from 'react-native';

const LOGO = require('../../../assets/logo.png');

interface BrandLogoProps {
  size?: number;
}

export function BrandLogo({ size = 44 }: BrandLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Image source={LOGO} style={styles.image} resizeMode="cover" fadeDuration={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 2.25 }],
  },
});
