import type { ContentType } from "@/types/content";

export type RootStackParamList = {
  MainTabs: undefined;
  Details: { id: number; type: ContentType };
  Player: { id: number; type: ContentType; season?: number; episode?: number; title?: string };
  AppSettings: undefined;
  Account: undefined;
  Help: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  MyList: undefined;
  Profile: undefined;
};
