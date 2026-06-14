import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useSSO, useSignIn } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BrandLogo } from "@/components/ui/brand-logo";

const LAST_AUTH_STRATEGY_KEY = "@rusilstream/last-auth-strategy";

function getClerkErrorMessage(error: unknown) {
  const first = (error as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0];
  return first?.longMessage || first?.message || "Something went wrong. Please try again.";
}

function LastUsedBadge() {
  return (
    <View className="absolute -top-2.5 right-3 z-20 rounded-full border border-white/20 bg-[#111827] px-2.5 py-1">
      <Text className="text-[10px] font-semibold text-white/90">Last used</Text>
    </View>
  );
}

function GoogleColorIcon({ size = 19 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Google logo">
      <Path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.63v3.02h3.87c2.26-2.08 3.56-5.15 3.56-8.68z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3.02c-1.08.73-2.46 1.16-4.08 1.16-3.14 0-5.8-2.12-6.76-4.98H1.24v3.11A12 12 0 0 0 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.24 14.26a7.2 7.2 0 0 1 0-4.52V6.63H1.24a12 12 0 0 0 0 10.74l4-3.11z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.24 6.63l4 3.11c.95-2.86 3.62-4.97 6.76-4.97z"
      />
    </Svg>
  );
}

export function AuthScreen() {
  const { startSSOFlow } = useSSO();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [authStep, setAuthStep] = useState<"email" | "password">("email");
  const [lastUsedStrategy, setLastUsedStrategy] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(LAST_AUTH_STRATEGY_KEY)
      .then((value) => {
        if (value) setLastUsedStrategy(value);
      })
      .catch(() => {
        // ignore read errors
      });
  }, []);

  const runSSO = async (strategy: "oauth_google" | "oauth_apple" | "oauth_github") => {
    setActiveStrategy(strategy);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await startSSOFlow({ strategy });

      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        await AsyncStorage.setItem(LAST_AUTH_STRATEGY_KEY, strategy);
      }
    } catch (error) {
      setErrorMessage(getClerkErrorMessage(error));
    } finally {
      setActiveStrategy(null);
      setIsSubmitting(false);
    }
  };

  const runPasswordSignIn = async () => {
    if (!isLoaded) {
      return;
    }

    if (!emailAddress.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setActiveStrategy("password");
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const attempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        return;
      }

      setErrorMessage("Your account needs additional verification. Please try social sign in.");
    } catch (error) {
      setErrorMessage(getClerkErrorMessage(error));
    } finally {
      setActiveStrategy(null);
      setIsSubmitting(false);
    }
  };

  const moveToPasswordStep = () => {
    if (!emailAddress.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    setErrorMessage(null);
    setAuthStep("password");
  };

  return (
    <View className="flex-1 bg-[#000000]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20, paddingTop: 30, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4 items-center">
          <BrandLogo size="lg" styleVariant="web-navbar" className="h-20 w-20" />
          <Text className="mt-3 text-center text-xs font-semibold uppercase tracking-[3.2px] text-white/85">
            Rusil Stream
          </Text>
        </View>

        <View className="w-full items-center">
          <View
            className="rounded-3xl border border-white/12 bg-brand-card/95 p-5"
            style={{ width: "100%", maxWidth: 460, alignSelf: "center" }}
          >
            <Text className="text-center text-3xl font-black leading-tight text-brand-text">Sign in</Text>
            <Text className="mt-2 text-center text-base leading-6 text-brand-muted">
              Welcome back! Please sign in to continue
            </Text>

            <View className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-3">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-[1.5px] text-zinc-400">Email Login</Text>
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="Email"
                placeholderTextColor="#7a808c"
                autoCapitalize="none"
                keyboardType="email-address"
                className="rounded-xl border border-white/15 bg-brand-bg/80 px-3 py-3 text-sm text-white"
              />

              {authStep === "password" ? (
                <>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#7a808c"
                    secureTextEntry
                    className="mt-2 rounded-xl border border-white/15 bg-brand-bg/80 px-3 py-3 text-sm text-white"
                  />
                  <Pressable
                    onPress={() => setAuthStep("email")}
                    disabled={isSubmitting}
                    className="mt-2 self-start rounded-lg px-1 py-1 disabled:opacity-60"
                    accessibilityRole="button"
                    accessibilityLabel="Change email"
                  >
                    <Text className="text-xs text-zinc-400">Change email</Text>
                  </Pressable>
                </>
              ) : null}

              <Pressable
                onPress={() => {
                  if (authStep === "email") {
                    moveToPasswordStep();
                    return;
                  }

                  void runPasswordSignIn();
                }}
                disabled={isSubmitting}
                className="mt-3 flex-row items-center justify-center rounded-xl bg-brand-red py-3.5 disabled:opacity-60"
                accessibilityRole="button"
                accessibilityLabel={authStep === "email" ? "Continue with email" : "Sign in with email"}
              >
                {isSubmitting && activeStrategy === "password" ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text className="ml-2 text-base font-bold text-white">Signing in...</Text>
                  </>
                ) : (
                  <Text className="text-base font-bold text-white">{authStep === "email" ? "Continue" : "Sign in"}</Text>
                )}
              </Pressable>
            </View>

            <View className="mt-4 flex-row items-center">
              <View className="h-px flex-1 bg-white/10" />
              <Text className="mx-3 text-xs uppercase tracking-[1.5px] text-zinc-500">or continue with</Text>
              <View className="h-px flex-1 bg-white/10" />
            </View>

            <View className="relative mt-6">
              <Pressable
                onPress={() => void runSSO("oauth_google")}
                disabled={isSubmitting}
                className="flex-row items-center justify-center rounded-xl border border-white/25 bg-white py-3.5 disabled:opacity-60"
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
              >
                {isSubmitting && activeStrategy === "oauth_google" ? (
                  <>
                    <ActivityIndicator color="#111111" />
                    <Text className="ml-2 text-base font-bold text-black">Connecting Google...</Text>
                  </>
                ) : (
                  <>
                    <GoogleColorIcon size={19} />
                    <Text className="ml-2 text-base font-bold text-black">Continue with Google</Text>
                  </>
                )}
              </Pressable>
              {lastUsedStrategy === "oauth_google" ? <LastUsedBadge /> : null}
            </View>

            {Platform.OS === "ios" ? (
              <View className="relative mt-3">
                <Pressable
                  onPress={() => void runSSO("oauth_apple")}
                  disabled={isSubmitting}
                  className="flex-row items-center justify-center rounded-xl border border-white/20 bg-black py-3.5 disabled:opacity-60"
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Apple"
                >
                  {isSubmitting && activeStrategy === "oauth_apple" ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" />
                      <Text className="ml-2 text-base font-bold text-white">Connecting Apple...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
                      <Text className="ml-2 text-base font-bold text-white">Continue with Apple</Text>
                    </>
                  )}
                </Pressable>
                {lastUsedStrategy === "oauth_apple" ? <LastUsedBadge /> : null}
              </View>
            ) : null}

            <View className="relative mt-3">
              <Pressable
                onPress={() => void runSSO("oauth_github")}
                disabled={isSubmitting}
                className="flex-row items-center justify-center rounded-xl border border-white/20 bg-zinc-900 py-3.5 disabled:opacity-60"
                accessibilityRole="button"
                accessibilityLabel="Continue with GitHub"
              >
                {isSubmitting && activeStrategy === "oauth_github" ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text className="ml-2 text-base font-bold text-white">Connecting GitHub...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="logo-github" size={18} color="#FFFFFF" />
                    <Text className="ml-2 text-base font-bold text-white">Continue with GitHub</Text>
                  </>
                )}
              </Pressable>
              {lastUsedStrategy === "oauth_github" ? <LastUsedBadge /> : null}
            </View>

            {errorMessage ? (
              <View className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3">
                <Text className="text-sm text-red-300">{errorMessage}</Text>
              </View>
            ) : null}

            <Text className="mt-4 text-center text-xs leading-5 text-zinc-500">
              Secure sign-in powered by Clerk. We never share your account details with providers.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
