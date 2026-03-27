# How to Add APK Files

## Quick Steps

1. **Download your built APK** from EAS Build:
   - Mobile: https://expo.dev/accounts/rusil/projects/rusil-stream/builds
   - Find your completed build and download the APK

2. **Rename and place the files:**
   ```bash
   # Place the downloaded APK files here with these exact names:
   apps/web/public/downloads/rusil-stream-mobile.apk
   apps/web/public/downloads/rusil-stream-tv.apk
   ```

3. **That's it!** The Next.js API routes will automatically serve them:
   - Mobile: `https://yourdomain.com/api/download/mobile`
   - TV: `https://yourdomain.com/api/download/tv`

## How It Works

- The download page links to `/api/download/mobile` and `/api/download/tv`
- These API routes read the APK files from this folder
- Files are served with proper headers for Android downloads
- If files don't exist, users see a friendly error message

## File Structure

```
apps/web/public/downloads/
├── .gitkeep                    # Keeps folder in git
├── README.md                   # Build instructions
├── HOW_TO_ADD_APKS.md         # This file
├── rusil-stream-mobile.apk    # Mobile APK (gitignored)
└── rusil-stream-tv.apk        # TV APK (gitignored)
```

## Testing Locally

1. Place APK files in this folder
2. Start your Next.js dev server: `npm run dev`
3. Visit: `http://localhost:3000/download`
4. Click the download buttons - they should download the APKs!

## Production Deployment

When you deploy to Vercel/production:
1. Upload APK files to this folder on your server
2. Or use a deployment script to copy them
3. The API routes will serve them automatically

## Notes

- APK files are gitignored (they're too large for git)
- Maximum file size depends on your hosting (Vercel: 50MB per file)
- For larger files, consider using cloud storage (S3, R2, etc.)
