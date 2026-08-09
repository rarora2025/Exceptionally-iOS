import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, T, Button } from '../ui/kit';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { updateProfile } from '../lib/db';
import * as haptics from '../lib/haptics';
import { DOORS_STEPS, ONBOARDING_GOALS } from '../data/onboarding';

export default function DoorsScreen() {
  const { state, patch, go } = useStore();

  return (
    <Screen contentStyle={styles.wrap}>
      <T variant="title" style={styles.h1}>
        How it works
      </T>

      <View style={styles.steps}>
        {DOORS_STEPS.map((s) => (
          <View key={s.n} style={styles.step}>
            <View style={[styles.num, { backgroundColor: s.dot }]}>
              <Text style={styles.numText}>{s.n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <T variant="cardTitle">{s.title}</T>
              <T variant="body" style={styles.stepBody}>
                {s.body}
              </T>
            </View>
          </View>
        ))}
      </View>

      <T variant="heading" style={styles.h2}>
        What are you looking for?
      </T>

      <View style={styles.goals}>
        {ONBOARDING_GOALS.map((label) => {
          const on = state.goal === label;
          return (
            <Pressable
              key={label}
              onPress={() => {
                haptics.select();
                patch({ goal: label });
                updateProfile({ onboarding_goal: label });
              }}
              style={[styles.goal, on ? styles.goalOn : styles.goalOff]}
            >
              <Text style={styles.goalText}>{label}</Text>
              <View style={[styles.check, on ? styles.checkOn : styles.checkOff]}>
                {on ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button
        title="Continue"
        variant="dark"
        style={styles.cta}
        onPress={() => patch({ screen: 'invite', inviteFrom: 'onboarding' })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 28, paddingBottom: 20 },
  h1: {},
  steps: { marginTop: 22, gap: 18 },
  step: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  num: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.ink,
    marginTop: 2,
  },
  numText: { fontFamily: font.display, fontSize: 14, color: colors.ink },
  stepBody: { marginTop: 4, fontSize: 15 },

  h2: { marginTop: 34 },
  goals: { marginTop: 16, gap: 10 },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  goalOff: { backgroundColor: colors.surface, borderColor: colors.line, ...shadow.soft },
  goalOn: { backgroundColor: colors.accent, borderColor: colors.accentDeep, ...shadow.accent },
  goalText: { fontFamily: font.semi, fontSize: 15.5, color: colors.ink, flex: 1, paddingRight: 12 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkOff: { borderWidth: 2, borderColor: colors.lineStrong },
  checkOn: { backgroundColor: colors.ink },
  checkMark: { color: colors.accent, fontFamily: font.bold, fontSize: 13 },

  cta: { marginTop: 24 },
});
