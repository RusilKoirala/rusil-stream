import { createContext, useContext, type ReactNode } from 'react';
import type { NavigationActions } from './types';

const NavigationContext = createContext<NavigationActions | null>(null);

export function NavigationProvider({
  value,
  children,
}: {
  value: NavigationActions;
  children: ReactNode;
}) {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return ctx;
}
