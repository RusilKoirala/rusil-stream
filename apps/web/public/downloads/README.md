# APK Downloads

This folder contains the APK files for Rusil Stream mobile and TV apps.

## Quick Build

From the project root:

```bash
# Build both apps
npm run build:apks

# Or build individually
npm run build:mobile
npm run build:tv
```

## Manual Build

### Mobile App
```bash
cd apps/mobile
eas build --platform android --profile production --local
cp build-*.apk ../web/public/downloads/rusil-stream-mobile.apk
```

### TV App
```bash
cd apps/tv
eas build --platform android --profile production --local
cp build-*.apk ../web/public/downloads/rusil-stream-tv.apk
```

## File Structure
- `rusil-stream-mobile.apk` - Android mobile app (gitignored)
- `rusil-stream-tv.apk` - Android TV app (gitignored)
- `.gitkeep` - Keeps this folder in git

## Download URLs
Once deployed, APKs are available at:
- Mobile: `https://yourdomain.com/downloads/rusil-stream-mobile.apk`
- TV: `https://yourdomain.com/downloads/rusil-stream-tv.apk`

## Notes
- APK files are gitignored to avoid large files in repo
- Build locally with EAS CLI or use EAS Build cloud service
- Update version numbers in `app.json` before building
- See `/docs/BUILD_APKS.md` for detailed instructions
