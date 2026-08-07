import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius } from '../theme';
import { useStore } from '../state/store';
import { ARTIFACTS, TRANSCRIPTS } from '../data/content';

export default function TranscriptScreen() {
  const { state, go } = useStore();
  const a = ARTIFACTS[state.artifactKey] || ARTIFACTS.david;
  const turns = TRANSCRIPTS[state.artifactKey] || TRANSCRIPTS.david;

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Artifact" onPress={() => go('artifact')} />
      <T variant="title" style={styles.h1}>
        {a.author}
      </T>

      <View style={{ gap: 14, marginTop: 22 }}>
        {turns.map((t, i) => (
          <View key={i} style={{ gap: 10 }}>
            <View style={styles.q}>
              <Text style={styles.qText}>{t.q}</Text>
            </View>
            <View style={styles.a}>
              <Text style={styles.aText}>{t.a}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button title="Back to the artifact" variant="secondary" style={{ marginTop: 22 }} onPress={() => go('artifact')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 14, fontSize: 30 },
  q: { alignSelf: 'flex-start', maxWidth: '86%', padding: 14, borderRadius: 20, borderBottomLeftRadius: 6, backgroundColor: colors.surfaceSunken },
  qText: { fontFamily: font.semi, fontSize: 14.5, lineHeight: 21, color: colors.ink },
  a: { alignSelf: 'flex-end', maxWidth: '92%', padding: 14, borderRadius: 20, borderBottomRightRadius: 6, backgroundColor: colors.tintBlue },
  aText: { fontFamily: font.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
});
