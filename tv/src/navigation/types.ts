import type { ContentType } from '@/types/content';

export type DetailsParams = {
  id: number;
  type: ContentType;
};

export type PlayerParams = {
  id: number;
  type: ContentType;
  season?: number;
  episode?: number;
  title?: string;
};

export type AppRoute =
  | { name: 'details'; params: DetailsParams }
  | { name: 'player'; params: PlayerParams };

export interface NavigationActions {
  openDetails: (params: DetailsParams) => void;
  openPlayer: (params: PlayerParams) => void;
  goBack: () => void;
  canGoBack: boolean;
}
