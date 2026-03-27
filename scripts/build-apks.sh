#!/bin/bash

# Build APKs for Rusil Stream mobile and TV apps
# Uses EAS Build cloud service (no local Android SDK required)

set -e

echo "🚀 Building Rusil Stream APKs with EAS Build..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOWNLOADS_DIR="$ROOT_DIR/apps/web/public/downloads"

# Ensure downloads directory exists
mkdir -p "$DOWNLOADS_DIR"

# Function to build mobile app
build_mobile() {
    echo -e "${BLUE}📱 Building Mobile App (Cloud Build)...${NC}"
    cd "$ROOT_DIR/apps/mobile"
    
    # Check if EAS CLI is installed
    if ! command -v eas &> /dev/null; then
        echo -e "${YELLOW}⚠️  EAS CLI not found. Installing...${NC}"
        npm install -g eas-cli
    fi
    
    # Build APK on EAS cloud
    echo "Building APK on EAS cloud (this may take 10-15 minutes)..."
    echo "You can monitor progress at: https://expo.dev/accounts/rusil/projects/rusil-stream/builds"
    eas build --platform android --profile production --non-interactive
    
    echo -e "${GREEN}✓ Build submitted to EAS${NC}"
    echo -e "${YELLOW}⚠️  Download the APK from https://expo.dev when ready${NC}"
    echo -e "${YELLOW}   Then place it at: $DOWNLOADS_DIR/rusil-stream-mobile.apk${NC}"
    
    cd "$ROOT_DIR"
}

# Function to build TV app
build_tv() {
    echo -e "${BLUE}📺 Building TV App (Cloud Build)...${NC}"
    cd "$ROOT_DIR/apps/tv"
    
    # Check if the TV app has proper build configuration
    if [ ! -f "eas.json" ]; then
        echo -e "${YELLOW}⚠️  TV app build configuration not ready yet${NC}"
        echo -e "${YELLOW}   Skipping TV build...${NC}"
        cd "$ROOT_DIR"
        return 0
    fi
    
    # Build APK on EAS cloud
    echo "Building TV APK on EAS cloud (this may take 10-15 minutes)..."
    eas build --platform android --profile production --non-interactive
    
    echo -e "${GREEN}✓ Build submitted to EAS${NC}"
    echo -e "${YELLOW}⚠️  Download the APK from https://expo.dev when ready${NC}"
    echo -e "${YELLOW}   Then place it at: $DOWNLOADS_DIR/rusil-stream-tv.apk${NC}"
    
    cd "$ROOT_DIR"
}

# Main execution
echo "Root directory: $ROOT_DIR"
echo "Downloads directory: $DOWNLOADS_DIR"
echo ""

# Parse arguments
BUILD_MOBILE=true
BUILD_TV=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --mobile-only)
            BUILD_TV=false
            shift
            ;;
        --tv-only)
            BUILD_MOBILE=false
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--mobile-only|--tv-only]"
            exit 1
            ;;
    esac
done

# Build apps
if [ "$BUILD_MOBILE" = true ]; then
    build_mobile
fi

if [ "$BUILD_TV" = true ]; then
    build_tv
fi

echo ""
echo -e "${GREEN}✨ Build(s) submitted!${NC}"
echo ""
echo "Next steps:"
echo "1. Monitor builds at: https://expo.dev/accounts/rusil/projects/rusil-stream/builds"
echo "2. Download the APK files when ready"
echo "3. Place them in: $DOWNLOADS_DIR"
echo ""
echo "They will then be served from your web app at:"
echo "  https://yourdomain.com/downloads/rusil-stream-mobile.apk"
echo "  https://yourdomain.com/downloads/rusil-stream-tv.apk"

