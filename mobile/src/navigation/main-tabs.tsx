import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { HomeScreen } from "@/screens/home-screen";
import { SearchScreen } from "@/screens/search-screen";
import { MyListScreen } from "@/screens/my-list-screen";
import { ProfileScreen } from "@/screens/profile-screen";
import type { MainTabParamList } from "@/navigation/types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabConfig: Record<
  keyof MainTabParamList,
  {
    active: keyof typeof Ionicons.glyphMap;
    inactive: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> = {
  Home: { active: "home", inactive: "home-outline", label: "Home" },
  Search: { active: "search", inactive: "search-outline", label: "Search" },
  MyList: { active: "bookmark", inactive: "bookmark-outline", label: "My List" },
  Profile: { active: "person", inactive: "person-outline", label: "Profile" },
};

function TabIcon({
  name,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) {
  const pulse = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  useEffect(() => {
    if (!focused) return;
    pulse.value = withSequence(
      withTiming(1.18, { duration: 120 }),
      withSpring(1.0)
    );
  }, [focused, pulse]);

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={22} color={color} />
    </Animated.View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 86 : 66,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.09)",
          backgroundColor: "#07090F",
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 10 : 8,
        },
        sceneStyle: { backgroundColor: "#07090F" },
        tabBarItemStyle: { paddingTop: 2, paddingBottom: 2 },
        tabBarActiveTintColor: "#e50914",
        tabBarInactiveTintColor: "#A4AFC2",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.3,
          marginBottom: Platform.OS === "ios" ? -1 : 1,
        },
        tabBarIcon: ({ focused, color }) => {
          const tab = tabConfig[route.name as keyof MainTabParamList];
          return (
            <TabIcon
              name={focused ? tab.active : tab.inactive}
              focused={focused}
              color={color}
            />
          );
        },
        tabBarLabel: tabConfig[route.name as keyof MainTabParamList].label,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="MyList" component={MyListScreen} options={{ title: "My List" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
