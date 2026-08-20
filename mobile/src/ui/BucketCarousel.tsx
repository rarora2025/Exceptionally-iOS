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
// card scales up and the neighbours dim as you swipe.
const SCREEN_W = Dimensions.get('window').width;
const H_PAD = 24; // Screen inner horizontal padding
const FRAME_W = SCREEN_W - H_PAD * 2;
const CARD_W = FRAME_W - 44;
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
        contentContainerStyle={{ paddingHorizontal: SIDE }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        onMomentumScrollEnd={(e) => setActive(Math.round(e.nativeEvent.contentOffset.x / SNAP))}
      >
        {FASC_BUCKETS.map((b, i) => {
          const items = itemsFor(state, b.key);
          const inputRange = [(i - 1) * SNAP, i * SNAP, (i + 1) * SNAP];
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.92, 1, 0.92], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.55, 1, 0.55], extrapolate: 'clamp' });
          return (
            <Animated.View key={b.key} style={{ width: CARD_W, marginRight: i < FASC_BUCKETS.length - 1 ? GAP : 0, transform: [{ scale }], opacity }}>
              <Pressable onPress={() => open(b.key)} style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={[styles.tile, { backgroundColor: b.tint }]}>
                    <Text style={styles.emoji}>{b.emoji}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{b.title}</Text>
                  {items.length ? (
                    <View style={styles.countPill}>
                      <Text style={styles.countText}>{items.length}</Text>
                    </View>
                  ) : null}
                </View>

                {items.length ? (
                  <View style={styles.list}>
                    {items.slice(0, 3).map((t) => (
                      <View key={t} style={styles.row}>
                        <View style={styles.bullet} />
                        <Text style={styles.rowText} numberOfLines={1}>{t}</Text>
                      </View>
                    ))}
                    {items.length > 3 ? <Text style={styles.more}>+{items.length - 3} more</Text> : null}
                  </View>
                ) : (
                  <View style={styles.list}>
                    <Text style={styles.emptyText}>{EMPTY[b.key]}</Text>
                  </View>
                )}

                <View style={[styles.cta, items.length ? styles.ctaOpen : styles.ctaStart]}>
                  <Text style={[styles.ctaText, { color: items.length ? colors.ink : colors.accentInk }]}>
                    {items.length ? 'View' : 'Start the interview'}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={items.length ? colors.ink : colors.accentInk} />
                </View>
              </Pressable>
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
    height: 196,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: 18,
    ...shadow.card,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  tile: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 19 },
  cardTitle: { flex: 1, fontFamily: font.displayBold, fontSize: 18, letterSpacing: -0.5, color: colors.ink },
  countPill: { minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: font.bold, fontSize: 13, color: colors.accentInk },

  list: { flex: 1, marginTop: 14, gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accentDeep },
  rowText: { flex: 1, fontFamily: font.semi, fontSize: 14.5, color: colors.ink },
  more: { fontFamily: font.bold, fontSize: 12.5, color: colors.muted, marginTop: 2, marginLeft: 15 },
  emptyText: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 21, color: colors.inkSoft },

  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: radius.pill },
  ctaOpen: { backgroundColor: colors.surfaceSunken },
  ctaStart: { backgroundColor: colors.accent },
  ctaText: { fontFamily: font.bold, fontSize: 13.5 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lineStrong },
  dotOn: { width: 18, backgroundColor: colors.accentDeep },
});
