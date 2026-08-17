import React from 'react';
import {
  Text,
  TextProps,
  View,
  ViewProps,
  Pressable,
  TextInput,
  TextInputProps,
  StyleSheet,
  ScrollView,
  ScrollViewProps,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, shadow } from '../theme';
import * as haptics from '../lib/haptics';

/* ----------------------------- Text ----------------------------- */

type TVariant =
  | 'display' // huge Bricolage hero
  | 'title' // Bricolage screen title
  | 'heading' // Bricolage section heading
  | 'cardTitle' // Bricolage card title
  | 'body'
  | 'bodyStrong'
  | 'label' // uppercase eyebrow
  | 'meta'; // small muted

const textStyles = StyleSheet.create({
  display: {
    fontFamily: font.displayBold,
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: -1.4,
    color: colors.ink,
  },
  title: {
    fontFamily: font.displayBold,
    fontSize: 33,
    lineHeight: 35,
    letterSpacing: -1.1,
    color: colors.ink,
  },
  heading: {
    fontFamily: font.displayBold,
    fontSize: 23,
    lineHeight: 26,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  cardTitle: {
    fontFamily: font.displaySemi,
    fontSize: 19,
    lineHeight: 22,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  body: {
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 23,
    color: colors.inkSoft,
  },
  bodyStrong: {
    fontFamily: font.semi,
    fontSize: 16,
    lineHeight: 23,
    color: colors.ink,
  },
  label: {
    fontFamily: font.bold,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  meta: {
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});

export const T: React.FC<TextProps & { variant?: TVariant }> = ({ variant = 'body', style, ...rest }) => (
  <Text {...rest} style={[textStyles[variant], style]} />
);

/* ----------------------------- Screen ----------------------------- */

export const Screen: React.FC<{
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewProps['style'];
  edges?: ('top' | 'bottom')[];
}> = ({ children, scroll = true, contentStyle, edges = ['top'] }) => {
  // Tapping any empty area dismisses the keyboard. A child that handles the
  // touch (button, input, link) becomes the responder first, so this only fires
  // for taps on blank space — no interference with real controls.
  const inner = (
    <Pressable style={[styles.screenInner, contentStyle]} onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </Pressable>
  );
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
};

/* ----------------------------- Button ----------------------------- */

type BtnVariant = 'primary' | 'dark' | 'secondary' | 'ghost';

export const Button: React.FC<{
  title: string;
  onPress?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  left?: React.ReactNode;
  style?: ViewProps['style'];
  compact?: boolean;
}> = ({ title, onPress, variant = 'primary', disabled, left, style, compact }) => {
  const v = disabled ? 'disabled' : variant;
  const bg = {
    primary: colors.accent,
    dark: colors.dark,
    secondary: colors.surface,
    ghost: 'transparent',
    disabled: colors.disabled,
  }[v];
  const fg = {
    primary: colors.accentInk,
    dark: colors.onDark,
    secondary: colors.ink,
    ghost: colors.link,
    disabled: colors.disabledInk,
  }[v];
  const sh =
    v === 'primary' ? shadow.accent : v === 'dark' ? shadow.dark : v === 'secondary' ? shadow.soft : undefined;

  return (
    <Pressable
      onPress={
        disabled
          ? undefined
          : () => {
              haptics.tap();
              onPress?.();
            }
      }
      style={({ pressed }) => [
        styles.btn,
        compact && styles.btnCompact,
        { backgroundColor: bg },
        variant === 'secondary' && !disabled && styles.btnBordered,
        sh,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {left}
      <Text style={[styles.btnText, compact && styles.btnTextCompact, { color: fg }]} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
};

/* ----------------------------- Card ----------------------------- */

export const Card: React.FC<ViewProps & { tint?: string; flat?: boolean; padded?: boolean }> = ({
  tint,
  flat,
  padded = true,
  style,
  children,
  ...rest
}) => (
  <View
    {...rest}
    style={[
      styles.card,
      padded && styles.cardPad,
      { backgroundColor: tint ?? colors.surface },
      !flat && shadow.card,
      style,
    ]}
  >
    {children}
  </View>
);

/* ----------------------------- Field ----------------------------- */

export const Field: React.FC<
  TextInputProps & { label?: string }
> = ({ label, style, ...rest }) => {
  const [focus, setFocus] = React.useState(false);
  return (
    <View style={{ gap: 8 }}>
      {label ? <T variant="label">{label}</T> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        {...rest}
        onFocus={(e) => {
          setFocus(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          rest.onBlur?.(e);
        }}
        style={[styles.input, focus && styles.inputFocus, style]}
      />
    </View>
  );
};

/* ----------------------------- Bits ----------------------------- */

export const BackLink: React.FC<{ label?: string; onPress: () => void }> = ({ label = 'Back', onPress }) => (
  <Pressable onPress={onPress} hitSlop={10} style={styles.back}>
    <Text style={styles.backText}>{'←  ' + label}</Text>
  </Pressable>
);

export const Avatar: React.FC<{ initials: string; tint: string; size?: number }> = ({
  initials,
  tint,
  size = 40,
}) => (
  <View
    style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: tint },
    ]}
  >
    <Text style={[styles.avatarText, { fontSize: Math.round(size * 0.4) }]}>{initials}</Text>
  </View>
);

export const Wordmark: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <Text style={[styles.wordmark, { fontSize: size }]}>Exceptionally</Text>
);

/* ----------------------------- ErrorBanner ----------------------------- */

// Inline, dismissible error in the app's design language — replaces the
// jarring native Alert dialog. Renders nothing when there's no message and
// fades in when one appears.
export const ErrorBanner: React.FC<{
  message?: string | null;
  onDismiss?: () => void;
  style?: ViewProps['style'];
}> = ({ message, onDismiss, style }) => {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!message) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [message, anim]);

  if (!message) return null;
  return (
    <Animated.View
      style={[
        styles.errBanner,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
        },
        style,
      ]}
    >
      <Ionicons name="alert-circle" size={19} color={colors.danger} />
      <Text style={styles.errText}>{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={10} style={styles.errClose}>
          <Ionicons name="close" size={16} color={colors.dangerInk} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenInner: { paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  btn: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 22,
  },
  btnCompact: { minHeight: 44, paddingHorizontal: 14 },
  btnBordered: { borderWidth: 1.5, borderColor: colors.lineStrong },
  btnText: { fontFamily: font.bold, fontSize: 16.5 },
  btnTextCompact: { fontSize: 15 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },

  card: { borderRadius: radius.xl },
  cardPad: { padding: 18 },

  input: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: 16,
    fontFamily: font.semi,
    fontSize: 16,
    color: colors.ink,
    ...(Platform.OS === 'android' ? { paddingVertical: 12 } : {}),
  },
  inputFocus: { borderColor: colors.ink, backgroundColor: colors.surface },

  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  backText: { fontFamily: font.bold, fontSize: 14, color: colors.muted },

  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.displaySemi, fontSize: 14, color: colors.ink },

  wordmark: { fontFamily: font.display, color: colors.ink, letterSpacing: -0.6 },

  errBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: radius.md,
    backgroundColor: colors.dangerBg,
    borderWidth: 1.5,
    borderColor: colors.dangerLine,
  },
  errText: { flex: 1, fontFamily: font.semi, fontSize: 14, lineHeight: 19, color: colors.dangerInk },
  errClose: { padding: 2 },
});
