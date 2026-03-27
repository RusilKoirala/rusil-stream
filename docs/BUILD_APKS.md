# Building and Deploying APKs

This guide explains how to build the Android APKs for Rusil Stream and make them available for download.

## Prerequisites

1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Ensure you have Android build tools installed (for local builds)

## Building APKs

### Option 1: Build Both Apps (Recommended)
```bash
npm run build:apks
```

This will:
- Build the mobile APK
- Build the TV APK
- Copy both to `apps/web/public/downloads/`

### Option 2: Build Individual Apps

Build only mobile:
```bash
npm run build:mobile
```

Build only TV:
```bash
npm run build:tv
```

### Option 3: Manual Build

Mobile app:
```bash
cd apps/mobile
eas build --platform android --profile production --local
cp build-*.apk ../web/public/downloads/rusil-stream-mobile.apk
```

TV app:
```bash
cd apps/tv
eas build --platform android --profile production --local
cp build-*.apk ../web/public/downloads/rusil-stream-tv.apk
```

## Cloud Builds (Alternative)

If you prefer cloud builds instead of local:

```bash
cd apps/mobile
eas build --platform android --profile production
```

Then download the APK from the EAS dashboard and place it in `apps/web/public/downloads/`.

## Download URLs

Once built and deployed, the APKs will be available at:

- Mobile: `https://yourdomain.com/downloads/rusil-stream-mobile.apk`
- TV: `https://yourdomain.com/downloads/rusil-stream-tv.apk`

The download page at `/download` automatically links to these files.

## File Structure

```
apps/web/public/downloads/
├── .gitkeep                    # Ensures folder is tracked
├── README.md                   # Build instructions
├── rusil-stream-mobile.apk     # Mobile APK (gitignored)
└── rusil-stream-tv.apk         # TV APK (gitignored)
```

## Notes

- APK files are automatically gitignored to keep the repo size small
- Build times: 5-15 minutes per app (depending on your machine)
- APK sizes: ~25-30 MB each
- Update version numbers in `app.json` before building new releases

## Troubleshooting

### Build fails with "EAS CLI not found"
```bash
npm install -g eas-cli
```

### Build fails with Android SDK errors
Make sure you have Android Studio and SDK tools installed, or use cloud builds instead.

### APK not found after build
Check the build output directory:
```bash
find apps/mobile -name "*.apk"
```

### Download link shows 404
Ensure the APK file exists in `apps/web/public/downloads/` and restart your Next.js dev server.
