import { Pressable } from "react-native";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  scaleTo?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export function AnimatedPressable({
  children,
  scaleTo = 0.96,
  containerStyle,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <AnimatedPressableBase
        {...props}
        onPressIn={(event) => {
          scale.value = withSpring(scaleTo, { damping: 16, stiffness: 300 });
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.value = withSpring(1, { damping: 16, stiffness: 300 });
          onPressOut?.(event);
        }}
      >
        {children}
      </AnimatedPressableBase>
    </Animated.View>
  );
}
