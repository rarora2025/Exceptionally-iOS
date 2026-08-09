import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { updateProfile } from '../lib/db';
import * as haptics from '../lib/haptics';
import { TOOL_GOALS, TOOLS } from '../data/content';

const TOOL_ACCENTS = [colors.accent, colors.tintBlue, colors.tintPeach, colors.tintLilac, colors.tintAmber];

export default function ToolsScreen() {
  const { state, patch } = useStore();

  if (!state.careerGoal) {
    return (
      <Screen contentStyle={styles.wrap}>
        <T variant="title" style={styles.h1}>
          Set your career goal
        </T>
        <T variant="body" style={styles.intro}>
          This decides which tools we put in front of you. You can change it whenever it stops being true.
        </T>
        <View style={{ gap: 10, marginTop: 26 }}>
          {TOOL_GOALS.map((g) => (
            <Pressable
              key={g.key}
              onPress={() => {
                haptics.select();
                patch({ careerGoal: g.key });
                updateProfile({ career_goal: g.key });
              }}
              style={styles.goalCard}
            >
              <Text style={styles.goalLabel}>{g.label}</Text>
              <Text style={styles.goalSub}>{g.sub}</Text>
            </Pressable>
          ))}
        </View>
      </Screen>
    );
  }

  const goal = state.careerGoal;
  const goalLabel = (TOOL_GOALS.find((g) => g.key === goal) || TOOL_GOALS[0]).label;
  const tools = TOOLS.filter((t) => t.goals.includes(goal));

  return (
    <Screen contentStyle={styles.wrap}>
      <T variant="title" style={styles.h1}>
        Tools
      </T>

      <Pressable
        onPress={() => {
          patch({ careerGoal: null });
          updateProfile({ career_goal: null });
        }}
        style={styles.goalChip}
      >
        <Text style={styles.goalChipLabel}>Career goal:</Text>
        <Text style={styles.goalChipValue}>{goalLabel}</Text>
        <Text style={styles.goalChipChange}>Change</Text>
      </Pressable>

      <View style={{ gap: 8, marginTop: 22 }}>
        {tools.map((t, i) => (
          <Pressable
            key={t.key}
            onPress={() => patch({ screen: 'toolRun', toolKey: t.key, toolPhase: 'idle', toolStep: 0 })}
            style={styles.toolCard}
          >
            <View style={[styles.toolBar, { backgroundColor: TOOL_ACCENTS[i % TOOL_ACCENTS.length] }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.toolName}>{t.name}</Text>
              <Text style={styles.toolBlurb}>{t.blurb}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.ink} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 20, paddingBottom: TAB_BAR_SPACE },
  h1: { fontSize: 33 },
  intro: { marginTop: 14, fontSize: 15.5, lineHeight: 22 },

  goalCard: { padding: 20, borderRadius: radius.lg, backgroundColor: colors.surface, ...shadow.card },
  goalLabel: { fontFamily: font.displaySemi, fontSize: 20, letterSpacing: -0.5, color: colors.ink, lineHeight: 24 },
  goalSub: { fontFamily: font.medium, fontSize: 13.5, lineHeight: 20, color: colors.inkSoft, marginTop: 8 },

  goalChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  goalChipLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.muted },
  goalChipValue: { fontFamily: font.bold, fontSize: 13, color: colors.ink },
  goalChipChange: { fontFamily: font.bold, fontSize: 12, color: colors.link },

  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  toolBar: { width: 12, height: 42, borderRadius: 8 },
  toolName: { fontFamily: font.displaySemi, fontSize: 19, letterSpacing: -0.4, color: colors.ink },
  toolBlurb: { fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginTop: 7 },
});
