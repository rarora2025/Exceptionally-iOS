import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { colors } from '../theme';
import { transcribeAudio } from '../lib/voice';
import * as haptics from '../lib/haptics';

// Tap to record a spoken answer, tap again to stop and transcribe. The
// transcript is handed back via onText so the user can still edit before sending.
export default function MicButton({
  onText,
  onError,
  disabled,
  size = 48,
}: {
  onText: (text: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  size?: number;
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = React.useState<'idle' | 'recording' | 'busy'>('idle');
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (status !== 'recording') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.14, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const start = async () => {
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        onError?.('Microphone access is off. Enable it in Settings to answer by voice.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      haptics.impact();
      setStatus('recording');
    } catch {
      setStatus('idle');
      onError?.('Could not start recording.');
    }
  };

  const stop = async () => {
    setStatus('busy');
    haptics.tap();
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        const text = await transcribeAudio(uri);
        if (text) onText(text);
        else onError?.("Didn't catch that. Try again.");
      }
    } catch {
      onError?.('Could not transcribe that. Check your connection.');
    }
    setStatus('idle');
  };

  const bg = status === 'recording' ? colors.danger : status === 'busy' ? colors.disabled : colors.accent;

  return (
    <Animated.View style={{ transform: [{ scale: status === 'recording' ? pulse : 1 }] }}>
      <Pressable
        onPress={() => (disabled || status === 'busy' ? undefined : status === 'recording' ? stop() : start())}
        disabled={disabled || status === 'busy'}
        style={[styles.btn, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}
      >
        {status === 'busy' ? (
          <ActivityIndicator color={colors.onDark} size="small" />
        ) : (
          <Ionicons
            name={status === 'recording' ? 'stop' : 'mic'}
            size={Math.round(size * 0.42)}
            color={status === 'idle' ? colors.accentInk : colors.onDark}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
});
