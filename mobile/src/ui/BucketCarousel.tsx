import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, shadow } from '../theme';
import { useStore, AppState } from '../state/store';
import { FASC_BUCKETS } from '../data/content';
import { bucketEntry } from '../lib/fascNav';
import * as haptics from '../lib/haptics';

// A snap carousel of the three fascination buckets on Home. Each card previews
// what you have made so far; an empty bucket nudges you to start. The focused
// card scales up and the neighbours dim as you swipe. Cards size to their
// content so nothing is clipped and sparse ones don't leave dead space.
const SCREEN_W = Dimensions.get('window').width;
const H_PAD = 24; // Screen inner horizontal padding
const CARD_W = SCREEN_W - H_PAD * 2 - 44;
const GAP = 14;
const SNAP = CARD_W + GAP;
// The scroller is full-bleed (wrap cancels the Screen padding), so cards centre
// against the whole screen width.
const SIDE = (SCREEN_W - CARD_W) / 2;

const EMPTY: Record<string, string> = {
  domains: 'Discover the industries you keep coming back to.',
  work: 'Find the day-to-day work that gives you real energy.',
  places: 'Name the cultures where you do your best work.',
};

function itemsFor(state: Pick<AppState, 'fascTopics' | 'fascPulls'>, key: string): string[] {
  if (key === 'domains') return (state.fascTopics[key] || []).map((t) => t.title);
  return (state.fascPulls[key]?.pulls || []).map((p) => p.title);
}

export default function BucketCarousel() {
  const { state, patch } = useStore();
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [active, setActive] = React.useState(0);

  const open = (key: string) => {
    haptics.tap();
    patch({ screen: bucketEntry(state, key), fascBucket: key, fascFrom: 'home' });
  };

  return (
    <View style={styles.wrap}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE, alignItems: 'flex-start' }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        onMomentumScrollEnd={(e) => setActive(Math.round(e.nativeEvent.contentOffset.x / SNAP))}
      >
        {FASC_BUCKETS.map((b, i) => {
          const items = itemsFor(state, b.key);
          const inputRange = [(i - 1) * SNAP, i * SNAP, (i + 1) * SNAP];
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.93, 1, 0.93], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.5, 1, 0.5], extrapolate: 'clamp' });
          return (
            <Animated.View
              key={b.key}
              style={{ width: CARD_W, marginRight: i < FASC_BUCKETS.length - 1 ? GAP : 0, transform: [{ scale }], opacity }}
            >
              <View style={styles.card}>
                <Pressable onPress={() => open(b.key)} style={styles.cardHead}>
                  <View style={[styles.tile, { backgroundColor: b.tint }]}>
                    <Text style={styles.emoji}>{b.emoji}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{b.title}</Text>
                  {items.length ? (
                    <View style={styles.countPill}>
                      <Text style={styles.countText}>{items.length}</Text>
                    </View>
                  ) : null}
                </Pressable>

                {items.length ? (
                  <View style={styles.list}>
                    {items.slice(0, 3).map((t) => (
                      <Pressable key={t} onPress={() => open(b.key)} style={styles.item}>
                        <Text style={styles.itemText} numberOfLines={1}>{t}</Text>
                        <Ionicons name="chevron-forward" size={15} color={colors.muted} />
                      </Pressable>
                    ))}
                    {items.length > 3 ? <Text style={styles.more}>+{items.length - 3} more</Text> : null}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>{EMPTY[b.key]}</Text>
                )}

                <Pressable onPress={() => open(b.key)} style={[styles.cta, items.length ? styles.ctaOpen : styles.ctaStart]}>
                  <Text style={[styles.ctaText, { color: items.length ? colors.onDark : colors.accentInk }]}>
                    {items.length ? 'View' : 'Start the interview'}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={items.length ? colors.onDark : colors.accentInk} />
                </Pressable>
              </View>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {FASC_BUCKETS.map((b, i) => (
          <View key={b.key} style={[styles.dot, i === active && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22, marginHorizontal: -H_PAD },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: 16,
    ...shadow.card,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  tile: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 19 },
  cardTitle: { flex: 1, fontFamily: font.displayBold, fontSize: 18, letterSpacing: -0.5, color: colors.ink },
  countPill: { minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: font.bold, fontSize: 13, color: colors.accentInk },

  list: { marginTop: 14, gap: 7 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
  },
  itemText: { flex: 1, fontFamily: font.semi, fontSize: 14.5, color: colors.ink },
  more: { fontFamily: font.bold, fontSize: 12.5, color: colors.muted, marginTop: 2, marginLeft: 4 },
  emptyText: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 21, color: colors.inkSoft, marginTop: 14, paddingVertical: 8 },

  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderRadius: radius.pill, marginTop: 16 },
  ctaOpen: { backgroundColor: colors.ink },
  ctaStart: { backgroundColor: colors.accent },
  ctaText: { fontFamily: font.bold, fontSize: 13.5 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lineStrong },
  dotOn: { width: 18, backgroundColor: colors.accentDeep },
});
