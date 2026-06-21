/**
 * Active Profile Storage
 * 
 * In-memory storage for the currently selected profile.
 * Resets on app restart (user must re-select).
 */

import type { TVProfile } from './api';

let _profile: TVProfile | null = null;

export function getActiveProfile(): TVProfile | null {
  return _profile;
}

export function setActiveProfile(profile: TVProfile): void {
  _profile = profile;
}

export function clearActiveProfile(): void {
  _profile = null;
}
