# Quick Start: Building APKs

## 🚀 One Command Build (Cloud)

```bash
npm run build:mobile
```

This submits a build to EAS Build cloud service (no local Android SDK needed!).

## 📱 Individual Builds

```bash
npm run build:mobile  # Mobile app only
npm run build:tv      # TV app only
```

## ⏱️ Build Process

1. Command submits build to EAS cloud
2. Wait 10-15 minutes for build to complete
3. Download APK from https://expo.dev
4. Place in `apps/web/public/downloads/`

## 📦 What You Need to Do

After the build completes on EAS:

1. Go to https://expo.dev/accounts/rusil/projects/rusil-stream/builds
2. Download the APK file
3. Rename and place it:
   - Mobile: `apps/web/public/downloads/rusil-stream-mobile.apk`
   - TV: `apps/web/public/downloads/rusil-stream-tv.apk`

These are automatically served at:
- `https://yourdomain.com/downloads/rusil-stream-mobile.apk`
- `https://yourdomain.com/downloads/rusil-stream-tv.apk`

## 🌐 Download Page

The download page at `/download` automatically links to these APKs with:
- ✅ Proper Android and TV icons
- ✅ Smooth animations
- ✅ Download buttons with hover effects
- ✅ Installation instructions

## 📝 Before Building

1. Install EAS CLI (one time):
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo (one time):
   ```bash
   eas login
   ```

3. Update version in `apps/mobile/app.json` and `apps/tv/app.json`

## 🔧 Why Cloud Build?

- ✅ No local Android SDK setup required
- ✅ No Java version conflicts
- ✅ Consistent build environment
- ✅ Works on any OS (Mac, Windows, Linux)
- ✅ Free tier available

## 📚 More Info

See `docs/BUILD_APKS.md` for detailed instructions.
