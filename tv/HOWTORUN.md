# TV App — How to Run

## 1. One-Time Shell Setup

Add these exports to your `~/.zshrc` so you never have to set them manually again:

```zsh
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
```

Then apply it:

```zsh
source ~/.zshrc
```

> If you open a new terminal session and these are already in `~/.zshrc`, you're good — no manual exports needed.

---

## 2. Every Session (if not in ~/.zshrc yet)

Run these three exports before any build command:

```zsh
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
```

---

## 3. Install dependencies (first time or after package changes)

From the `tv/` directory:

```zsh
pnpm install
```

> This project uses pnpm with hoisted `node_modules` (see `.npmrc`). React Native's Gradle build requires `@react-native/gradle-plugin` at a flat path — a plain pnpm install without `.npmrc` will break Android builds.

---

## 4. Start Metro (JS bundler)

In one terminal tab, from the `tv/` directory:

```zsh
pnpm start
```

Keep this running in the background.

---

## 5. Run on Android TV Emulator

In a second terminal tab, from the `tv/` directory:

```zsh
pnpm android
```

Make sure the Android TV emulator (`Television_1080p`) is already running in Android Studio before this step.

---

## Why JDK 17?

The default system Java (JDK 25 via Homebrew) is too new and breaks the CMake/NDK native build step. JDK 17 is the version React Native's native toolchain is compatible with. JDK 21 may work too but 17 is the safest choice.

---

## Why ANDROID_HOME / platform-tools?

The React Native CLI uses `adb` to install the APK and launch the app on the emulator. Without `platform-tools` in your PATH, `adb` is not found and the launch step fails even if the build succeeded.

---

## Quick Reference

| What | Command |
|------|---------|
| Install deps | `pnpm install` |
| Start Metro | `pnpm start` |
| Build + run Android | `pnpm android` |
| Lint | `pnpm lint` |
| Tests | `pnpm test` |
| Verify adb works | `adb devices` |
| Verify Java version | `java -version` (should say 17) |
