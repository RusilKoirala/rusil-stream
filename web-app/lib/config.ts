/**
 * Platform Configuration
 * 
 * This file contains configuration values that can be customized
 * via environment variables to match your brand identity.
 */

export const config = {
  /**
   * Application name
   * Can be customized via NEXT_PUBLIC_APP_NAME environment variable
   */
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Rusil Stream',

  /**
   * Primary brand color
   * Default: #E50914 (Netflix red)
   * Can be customized via NEXT_PUBLIC_BRAND_COLOR environment variable
   */
  brandColor: process.env.NEXT_PUBLIC_BRAND_COLOR || '#E50914',

  /**
   * Logo URL
   * Can be customized via NEXT_PUBLIC_LOGO_URL environment variable
   */
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL,

  /**
   * VidKing base URL for video streaming
   */
  vidkingBaseUrl: process.env.NEXT_PUBLIC_VIDKING_BASE_URL || 'https://www.vidking.net',

  /**
   * Authentication configuration
   */
  auth: {
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/profiles',
    afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/onboarding',
  },

  /**
   * Netflix color palette
   * These colors define the dark theme used throughout the application
   */
  colors: {
    background: '#141414',      // Main background
    card: '#181818',            // Cards and panels
    elevated: '#232323',        // Elevated elements
    surface: '#2F2F2F',         // Highest surfaces
    primary: '#FFFFFF',         // Primary text
    secondary: '#B3B3B3',       // Secondary labels
    muted: '#737373',           // Captions and placeholders
    border: 'rgba(255, 255, 255, 0.1)', // Borders
  },
} as const;

export type Config = typeof config;
