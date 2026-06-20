import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";
import { HomeScreen } from "@/screens/home-screen";
import { SearchScreen } from "@/screens/search-screen";
import { MyListScreen } from "@/screens/my-list-screen";
import { ProfileScreen } from "@/screens/profile-screen";
import type { MainTabParamList } from "@/navigation/types";
import { colors, type as t } from "@/lib/tokens";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG: Record<
  keyof MainTabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }
> = {
  Home:    { active: "home",     inactive: "home-outline",     label: "Home" },
  Search:  { active: "search",   inactive: "search-outline",   label: "Search" },
  MyList:  { active: "bookmark", inactive: "bookmark-outline", label: "My List" },
  Profile: { active: "person",   inactive: "person-outline",   label: "Profile" },
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
  return (
    <View style={tab.iconContainer}>
      <View style={[tab.indicator, focused && tab.indicatorActive]} />
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export function MainTabs() {
  const TAB_HEIGHT = Platform.OS === "ios" ? 84 : 62;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name as keyof MainTabParamList];
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: TAB_HEIGHT,
            backgroundColor: "rgba(8,10,15,0.97)",
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            elevation: 0,
            shadowOpacity: 0,
            paddingTop: 6,
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
          },
          sceneStyle: { backgroundColor: colors.bg },
          tabBarItemStyle: { paddingHorizontal: 0 },
          tabBarActiveTintColor: colors.text100,
          tabBarInactiveTintColor: "rgba(255,255,255,0.30)",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: t.weight.semibold,
            letterSpacing: 0.3,
            marginTop: 1,
          },
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? cfg.active : cfg.inactive}
              focused={focused}
              color={color}
            />
          ),
          tabBarLabel: cfg.label,
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="MyList" component={MyListScreen} options={{ title: "My List" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const tab = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    gap: 5,
  },
  indicator: {
    position: "absolute",
    top: -10,
    width: 20,
    height: 2,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  indicatorActive: {
    backgroundColor: colors.red,
  },
});
