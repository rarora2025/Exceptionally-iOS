import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { SYNTH_OUTPUTS, SHELF, NARRATIVE, BUILD_STEPS } from '../data/content';

export default function SynthesisScreen() {
  const { state, patch, go } = useStore();
  const [buildStep, setBuildStep] = React.useState(0);
  const pickedCount = Object.values(state.synthPicked).filter(Boolean).length;

  React.useEffect(() => {
    if (!state.building) return;
    if (buildStep >= BUILD_STEPS.length - 1) {
      const t = setTimeout(() => patch({ building: false, narrativeShown: true }), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBuildStep((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [state.building, buildStep]);

  const build = () => {
    setBuildStep(0);
    patch({ building: true, narrativeShown: false });
  };

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Profile" onPress={() => go('profile')} />
      <T variant="title" style={styles.h1}>
        What do you need to walk away with?
      </T>

      <View style={{ gap: 8, marginTop: 20 }}>
        {SYNTH_OUTPUTS.map((o) => {
          const on = state.synthOutput === o.key;
          return (
            <Pressable key={o.key} onPress={() => patch({ synthOutput: o.key })} style={[styles.output, on && styles.outputOn]}>
              <Text style={[styles.outputLabel, on && { color: colors.accentInk }]}>{o.label}</Text>
              <Text style={[styles.outputFormat, on && { color: colors.accentInk }]}>{o.format}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.eyebrow}>Pull from the shelf · {pickedCount}</Text>
      <View style={{ gap: 4, marginTop: 11 }}>
        {SHELF.map((b) => {
          const on = !!state.synthPicked[b.key];
          return (
            <Pressable
              key={b.key}
              onPress={() => patch({ synthPicked: { ...state.synthPicked, [b.key]: !on } })}
              style={[styles.shelfRow, on && styles.shelfRowOn]}
            >
              <View style={[styles.box, on ? styles.boxOn : styles.boxOff]}>
                {on ? <Text style={styles.boxCheck}>✓</Text> : null}
              </View>
              <Text style={styles.shelfTitle}>{b.title}</Text>
              <Text style={styles.shelfAuthor}>{b.author}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button title={state.narrativeShown ? 'Rebuild' : 'Build it'} variant="dark" style={{ marginTop: 18 }} onPress={build} />

      {state.building ? (
        <View style={styles.buildingCard}>
          <View style={styles.buildRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.buildText}>{BUILD_STEPS[Math.min(buildStep, BUILD_STEPS.length - 1)]}</Text>
          </View>
          <View style={{ gap: 8, marginTop: 16 }}>
            <View style={[styles.skeleton, { width: '92%' }]} />
            <View style={[styles.skeleton, { width: '74%' }]} />
            <View style={[styles.skeleton, { width: '58%' }]} />
          </View>
        </View>
      ) : null}

      {state.narrativeShown && !state.building ? (
        <View style={styles.narrative}>
          <View style={{ padding: 22 }}>
            <Text style={styles.kicker}>{NARRATIVE.kicker}</Text>
            <Text style={styles.narrativeTitle}>{NARRATIVE.title}</Text>
            <Text style={styles.narrativeBody}>{NARRATIVE.body}</Text>
            <Text style={styles.narrativeSources}>{NARRATIVE.sources}</Text>
          </View>
          <View style={styles.narrativeFoot}>
            <Button title="Export" variant="dark" compact style={{ flex: 1 }} onPress={() => {}} />
            <Button title="Shorter" variant="secondary" compact onPress={() => {}} />
            <Button title="Copy" variant="secondary" compact onPress={() => {}} />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 14, fontSize: 30 },

  output: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: radius.md, backgroundColor: colors.surface, ...shadow.soft },
  outputOn: { backgroundColor: colors.accent },
  outputLabel: { flex: 1, fontFamily: font.displaySemi, fontSize: 17, letterSpacing: -0.3, color: colors.ink },
  outputFormat: { fontFamily: font.bold, fontSize: 12, color: colors.muted },

  eyebrow: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted, marginTop: 26 },
  shelfRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 10, backgroundColor: colors.surface },
  shelfRowOn: {},
  box: { width: 18, height: 18, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  boxOff: { borderWidth: 2, borderColor: colors.lineStrong },
  boxOn: { backgroundColor: colors.accent },
  boxCheck: { fontFamily: font.bold, fontSize: 11, color: colors.accentInk },
  shelfTitle: { flex: 1, fontFamily: font.displaySemi, fontSize: 15.5, letterSpacing: -0.3, color: colors.ink },
  shelfAuthor: { fontFamily: font.bold, fontSize: 12, color: colors.muted },

  buildingCard: { marginTop: 12, padding: 20, borderRadius: radius.xl, backgroundColor: colors.surface, ...shadow.card },
  buildRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  pulseDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accent },
  buildText: { fontFamily: font.bold, fontSize: 15.5, color: colors.ink },
  skeleton: { height: 12, borderRadius: 8, backgroundColor: colors.surfaceSunken },

  narrative: { marginTop: 12, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, ...shadow.card },
  kicker: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  narrativeTitle: { fontFamily: font.displayBold, fontSize: 25, lineHeight: 28, letterSpacing: -0.7, color: colors.ink, marginTop: 12 },
  narrativeBody: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 25, color: '#23231F', marginTop: 16 },
  narrativeSources: { fontFamily: font.medium, fontSize: 12.5, lineHeight: 19, color: colors.inkSoft, marginTop: 20, paddingTop: 12, borderTopWidth: 1.5, borderTopColor: colors.line },
  narrativeFoot: { flexDirection: 'row', gap: 8, padding: 14, backgroundColor: colors.surfaceSunken },
});
