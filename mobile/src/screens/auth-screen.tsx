import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useSSO, useSignIn } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandLogo } from "@/components/ui/brand-logo";
import { colors, space, radius, type as t } from "@/lib/tokens";

WebBrowser.maybeCompleteAuthSession();

const LAST_AUTH_STRATEGY_KEY = "@rusilstream/last-auth-strategy";

function getClerkErrorMessage(error: unknown) {
  const first = (error as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0];
  return first?.longMessage || first?.message || "Something went wrong. Please try again.";
}

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Google">
      <Path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.63v3.02h3.87c2.26-2.08 3.56-5.15 3.56-8.68z" />
      <Path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3.02c-1.08.73-2.46 1.16-4.08 1.16-3.14 0-5.8-2.12-6.76-4.98H1.24v3.11A12 12 0 0 0 12 24z" />
      <Path fill="#FBBC05" d="M5.24 14.26a7.2 7.2 0 0 1 0-4.52V6.63H1.24a12 12 0 0 0 0 10.74l4-3.11z" />
      <Path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.24 6.63l4 3.11c.95-2.86 3.62-4.97 6.76-4.97z" />
    </Svg>
  );
}

interface SocialButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  loadingLabel: string;
  isLastUsed?: boolean;
  style?: object;
  textStyle?: object;
}

function SocialButton({
  onPress,
  loading,
  disabled,
  icon,
  label,
  loadingLabel,
  isLastUsed,
  style,
  textStyle,
}: SocialButtonProps) {
  return (
    <View style={{ position: "relative" }}>
      {isLastUsed ? (
        <View style={s.lastUsedBadge}>
          <Text style={s.lastUsedText}>Last used</Text>
        </View>
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          s.socialBtn,
          style,
          disabled && { opacity: 0.5 },
          pressed && !disabled && { opacity: 0.82 },
        ]}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color={colors.text80} />
            <Text style={[s.socialBtnText, textStyle, { marginLeft: space[2] }]}>{loadingLabel}</Text>
          </>
        ) : (
          <>
            <View style={s.socialBtnIcon}>{icon}</View>
            <Text style={[s.socialBtnText, textStyle]}>{label}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

export function AuthScreen() {
  const { startSSOFlow } = useSSO();
  const { isLoaded, signIn, setActive } = useSignIn();
  const insets = useSafeAreaInsets();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [lastUsed, setLastUsed] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(LAST_AUTH_STRATEGY_KEY)
      .then((v) => { if (v) setLastUsed(v); })
      .catch(() => {});
  }, []);

  const runSSO = async (strategy: "oauth_google" | "oauth_apple" | "oauth_github") => {
    setActiveStrategy(strategy);
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const redirectUrl = Linking.createURL("/");
      const result = await startSSOFlow({ strategy, redirectUrl });
      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        await AsyncStorage.setItem(LAST_AUTH_STRATEGY_KEY, strategy);
      }
    } catch (err) {
      setErrorMessage(getClerkErrorMessage(err));
    } finally {
      setActiveStrategy(null);
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!email.trim()) { setErrorMessage("Enter your email to continue."); return; }
    setErrorMessage(null);
    setStep("password");
    setTimeout(() => passwordRef.current?.focus(), 80);
  };

  const handleSignIn = async () => {
    if (!isLoaded || !email.trim() || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }
    setActiveStrategy("password");
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const attempt = await signIn.create({ identifier: email.trim(), password });
      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        return;
      }
      setErrorMessage("Additional verification required. Try a social login.");
    } catch (err) {
      setErrorMessage(getClerkErrorMessage(err));
    } finally {
      setActiveStrategy(null);
      setIsSubmitting(false);
    }
  };

  const isWorking = isSubmitting;

  return (
    <View style={s.root}>
      <View style={[s.topAccent, { height: insets.top + 3 }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              s.scroll,
              { paddingTop: insets.top + space[6], paddingBottom: insets.bottom + space[8] },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.brandPill}>
              <BrandLogo size="sm" styleVariant="web-navbar" style={{ width: 28, height: 28 }} />
              <Text style={s.brandPillText}>Rusil Stream</Text>
            </View>

            <Text style={s.headline}>Sign in</Text>
            <Text style={s.subheadline}>
              Movies, shows, and moments worth replaying.
            </Text>

            <View style={s.formSection}>
              <Text style={s.fieldLabel}>Email address</Text>
              <TextInput
                style={[s.input, step === "email" && s.inputFocus]}
                value={email}
                onChangeText={(v) => { setEmail(v); setErrorMessage(null); }}
                placeholder="you@example.com"
                placeholderTextColor={colors.text20}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType={step === "email" ? "next" : "done"}
                onSubmitEditing={step === "email" ? handleContinue : undefined}
                editable={!isWorking}
              />

              {step === "password" ? (
                <View>
                  <View style={s.fieldLabelRow}>
                    <Text style={s.fieldLabel}>Password</Text>
                    <Pressable
                      onPress={() => { setStep("email"); setPassword(""); setErrorMessage(null); }}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel="Change email"
                    >
                      <Text style={s.changeLink}>Change email</Text>
                    </Pressable>
                  </View>
                  <View style={s.passwordRow}>
                    <TextInput
                      ref={passwordRef}
                      style={[s.input, s.passwordInput]}
                      value={password}
                      onChangeText={(v) => { setPassword(v); setErrorMessage(null); }}
                      placeholder="••••••••"
                      placeholderTextColor={colors.text20}
                      secureTextEntry={!showPassword}
                      textContentType="password"
                      returnKeyType="go"
                      onSubmitEditing={() => void handleSignIn()}
                      editable={!isWorking}
                    />
                    <Pressable
                      style={s.eyeBtn}
                      onPress={() => setShowPassword((p) => !p)}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={colors.text40}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : null}

              <Pressable
                onPress={step === "email" ? handleContinue : () => void handleSignIn()}
                disabled={isWorking}
                accessibilityRole="button"
                accessibilityLabel={step === "email" ? "Continue" : "Sign in"}
                style={({ pressed }) => [s.primaryBtn, pressed && { opacity: 0.88 }, isWorking && { opacity: 0.6 }]}
              >
                {isWorking && activeStrategy === "password" ? (
                  <ActivityIndicator size="small" color={colors.bg} />
                ) : (
                  <Text style={s.primaryBtnText}>
                    {step === "email" ? "Continue" : "Sign in"}
                  </Text>
                )}
              </Pressable>
            </View>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <View style={s.socialSection}>
              <SocialButton
                onPress={() => void runSSO("oauth_google")}
                loading={isWorking && activeStrategy === "oauth_google"}
                disabled={isWorking}
                icon={<GoogleIcon size={18} />}
                label="Continue with Google"
                loadingLabel="Connecting Google…"
                isLastUsed={lastUsed === "oauth_google"}
              />

              {Platform.OS === "ios" ? (
                <SocialButton
                  onPress={() => void runSSO("oauth_apple")}
                  loading={isWorking && activeStrategy === "oauth_apple"}
                  disabled={isWorking}
                  icon={<Ionicons name="logo-apple" size={18} color={colors.text100} />}
                  label="Continue with Apple"
                  loadingLabel="Connecting Apple…"
                  isLastUsed={lastUsed === "oauth_apple"}
                />
              ) : null}

              <SocialButton
                onPress={() => void runSSO("oauth_github")}
                loading={isWorking && activeStrategy === "oauth_github"}
                disabled={isWorking}
                icon={<Ionicons name="logo-github" size={18} color={colors.text100} />}
                label="Continue with GitHub"
                loadingLabel="Connecting GitHub…"
                isLastUsed={lastUsed === "oauth_github"}
              />
            </View>

            {errorMessage ? (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle-outline" size={15} color={colors.error} />
                <Text style={s.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.red,
  },
  scroll: {
    paddingHorizontal: space[6],
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: space[2],
    marginBottom: space[8],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderMid,
    backgroundColor: colors.bgSurface,
  },
  brandPillText: {
    fontSize: t.size.xs,
    fontWeight: t.weight.semibold,
    color: colors.text60,
    letterSpacing: t.tracking.wider,
    textTransform: "uppercase",
  },
  headline: {
    fontSize: t.size.xxl,
    fontWeight: t.weight.bold,
    color: colors.text100,
    letterSpacing: t.tracking.tight,
    lineHeight: t.size.xxl * t.leading.tight,
    marginBottom: space[2],
  },
  subheadline: {
    fontSize: t.size.base,
    fontWeight: t.weight.regular,
    color: colors.text40,
    lineHeight: t.size.base * t.leading.loose,
    marginBottom: space[8],
  },
  formSection: {
    gap: space[3],
  },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: t.size.xs,
    fontWeight: t.weight.semibold,
    color: colors.text40,
    letterSpacing: t.tracking.widest,
    textTransform: "uppercase",
    marginBottom: space[1],
  },
  changeLink: {
    fontSize: t.size.xs,
    color: colors.red,
    fontWeight: t.weight.medium,
  },
  input: {
    height: 52,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    fontSize: t.size.base,
    fontWeight: t.weight.regular,
    color: colors.text100,
  },
  inputFocus: {
    borderColor: colors.borderMid,
  },
  passwordRow: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  primaryBtn: {
    height: 52,
    backgroundColor: colors.red,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: space[1],
  },
  primaryBtnText: {
    fontSize: t.size.base,
    fontWeight: t.weight.bold,
    color: colors.text100,
    letterSpacing: t.tracking.wide,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: space[6],
    gap: space[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: t.size.xs,
    fontWeight: t.weight.medium,
    color: colors.text20,
    letterSpacing: t.tracking.widest,
    textTransform: "uppercase",
  },
  socialSection: {
    gap: space[3],
  },
  socialBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radius.md,
  },
  socialBtnIcon: {
    marginRight: space[3],
  },
  socialBtnText: {
    fontSize: t.size.base,
    fontWeight: t.weight.semibold,
    color: colors.text80,
  },
  lastUsedBadge: {
    position: "absolute",
    top: -10,
    right: 14,
    zIndex: 10,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  lastUsedText: {
    fontSize: 10,
    fontWeight: t.weight.semibold,
    color: colors.red,
    letterSpacing: t.tracking.wide,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space[2],
    marginTop: space[4],
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.25)",
    borderRadius: radius.md,
    padding: space[4],
  },
  errorText: {
    flex: 1,
    fontSize: t.size.sm,
    color: colors.error,
    lineHeight: t.size.sm * t.leading.normal,
  },
});
