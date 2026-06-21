/**
 * Device Token Storage
 * 
 * In-memory storage for the device authentication token.
 * The token persists for the lifetime of the app session.
 * On app restart, the user will need to re-link their device.
 */

let _token: string | null = null;

export function getDeviceToken(): string | null {
  return _token;
}

export function setDeviceToken(token: string): void {
  _token = token;
}

export function clearDeviceToken(): void {
  _token = null;
}

export function hasDeviceToken(): boolean {
  return _token !== null;
}
