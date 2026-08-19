import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { colors, font, radius, shadow } from '../theme';
import { transcribeAudio } from '../lib/voice';
import * as haptics from '../lib/haptics';

type Rec = 'idle' | 'recording' | 'busy';

// Bottom composer with a big hold-to-speak button. Press and hold to record,
// release to transcribe; the text lands in the editable box so you can see and
// fix what you said before sending.
export default function VoiceComposer({
  value,
  onChangeText,
  onSubmit,
  submitLabel = 'Send',
  disabled,
  placeholder = 'Hold the mic to speak, or type…',
}: {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [rec, setRec] = React.useState<Rec>('idle');
  const [secs, setSecs] = React.useState(0);
  const [err, setErr] = React.useState('');
  const starting = React.useRef(false);
  const cancel = React.useRef(false);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = React.useRef(new Animated.Value(1)).current;

  const canSend = !disabled && !!value.trim() && rec === 'idle';

  React.useEffect(() => {
    if (rec !== 'recording') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [rec, pulse]);

  const append = (t: string) => onChangeText(value.trim() ? value.trim() + ' ' + t : t);

  const startHold = async () => {
    if (disabled || rec !== 'idle') return;
    setErr('');
    starting.current = true;
    cancel.current = false;
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setErr('Turn on microphone access in Settings to answer by voice.');
        starting.current = false;
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      haptics.impact();
      setRec('recording');
      setSecs(0);
      timer.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } catch {
      setRec('idle');
    }
    starting.current = false;
    if (cancel.current) endHold();
  };

  const endHold = async () => {
    if (starting.current) {
      cancel.current = true;
      return;
    }
    if (rec !== 'recording') return;
    if (timer.current) clearInterval(timer.current);
    setRec('busy');
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        const text = await transcribeAudio(uri);
        if (text) {
          haptics.success(); // transcript landed
          append(text);
        } else {
          setErr("Didn't catch that. Try again.");
        }
      }
    } catch {
      setErr('Could not transcribe. Check your connection.');
    }
    setRec('idle');
    setSecs(0);
  };

  const mmss = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <View style={styles.wrap}>
      {err ? <Text style={styles.err}>{err}</Text> : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline
        editable={!disabled && rec !== 'recording'}
        style={styles.input}
      />

      <View style={styles.row}>
        <Animated.View style={{ flex: 1, transform: [{ scale: rec === 'recording' ? pulse : 1 }] }}>
          <Pressable
            onPressIn={startHold}
            onPressOut={endHold}
            disabled={disabled || rec === 'busy'}
            style={[
              styles.hold,
              rec === 'recording' && styles.holdRec,
              rec === 'busy' && styles.holdBusy,
            ]}
          >
            <Ionicons
              name={rec === 'recording' ? 'radio-button-on' : 'mic'}
              size={20}
              color={rec === 'recording' ? colors.onDark : colors.accentInk}
            />
            <Text style={[styles.holdText, rec === 'recording' && { color: colors.onDark }]}>
              {rec === 'recording' ? `Listening…  ${mmss}` : rec === 'busy' ? 'Transcribing…' : 'Hold to speak'}
            </Text>
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={() => canSend && onSubmit()}
          disabled={!canSend}
          style={[styles.send, { backgroundColor: canSend ? colors.ink : colors.disabled }]}
        >
          <Ionicons name="arrow-up" size={22} color={canSend ? colors.onDark : colors.disabledInk} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 6, gap: 10 },
  err: { fontFamily: font.semi, fontSize: 13, color: colors.danger, paddingHorizontal: 4 },
  input: {
    minHeight: 48,
    maxHeight: 130,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    fontFamily: font.medium,
    fontSize: 15.5,
    lineHeight: 21,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hold: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    ...shadow.accent,
  },
  holdRec: { backgroundColor: colors.danger, shadowColor: colors.danger },
  holdBusy: { backgroundColor: colors.disabled },
  holdText: { fontFamily: font.bold, fontSize: 16, color: colors.accentInk },
  send: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
});
