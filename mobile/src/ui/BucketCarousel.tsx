import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, shadow } from '../theme';
import { useStore, AppState } from '../state/store';
import { FASC_BUCKETS } from '../data/content';
import { bucketEntry } from '../lib/fascNav';
import * as haptics from '../lib/haptics';

// A paged carousel of the three fascination buckets on Home. One full-width
// card per page — uniform size, contained inside the page margins (not
// full-bleed), with the pager dots attached right beneath. Each card previews
// what you have made; an empty bucket nudges you to start.
const SCREEN_W = Dimensions.get('window').width;
const H_PAD = 24; // Screen inner horizontal padding
// A little narrower than the frame so the next card peeks — that strip is the
// grab area that makes the row obviously swipeable.
const CARD_W = SCREEN_W - H_PAD * 2 - 34;
const GAP = 12;
const SNAP = CARD_W + GAP;

function itemsFor(state: Pick<AppState, 'fascTopics' | 'fascPulls'>, key: string): string[] {
  if (key === 'domains') return (state.fascTopics[key] || []).map((t) => t.title);
  return (state.fascPulls[key]?.pulls || []).map((p) => p.title);
}

export default function BucketCarousel() {
  const { state, patch } = useStore();
  const [active, setActive] = React.useState(0);

  const open = (key: string) => {
    haptics.tap();
    patch({ screen: bucketEntry(state, key), fascBucket: key, fascFrom: 'home' });
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        directionalLockEnabled
        contentContainerStyle={{ paddingRight: 34 }}
        onMomentumScrollEnd={(e) => setActive(Math.round(e.nativeEvent.contentOffset.x / SNAP))}
      >
        {FASC_BUCKETS.map((b, i) => {
          const items = itemsFor(state, b.key);
          return (
            <View key={b.key} style={{ width: CARD_W, marginRight: i < FASC_BUCKETS.length - 1 ? GAP : 0 }}>
              <View style={styles.card}>
                <Pressable onPress={() => open(b.key)} style={styles.cardHead}>
                  <View style={[styles.tile, { backgroundColor: b.tint }]}>
                    <Text style={styles.emoji}>{b.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{b.title}</Text>
                    <Text style={styles.cardMeta}>{items.length ? `${items.length} saved` : 'Nothing yet'}</Text>
                  </View>
                </Pressable>

                <View style={[styles.mid, !items.length && styles.midEmpty]}>
                  {items.length ? (
                    items.slice(0, 3).map((t) => (
                      <Pressable key={t} onPress={() => open(b.key)} style={styles.item}>
                        <Text style={styles.itemText} numberOfLines={1}>{t}</Text>
                        <Ionicons name="chevron-forward" size={15} color={colors.muted} />
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>{b.intro}</Text>
                  )}
                  {items.length > 3 ? <Text style={styles.more}>+{items.length - 3} more</Text> : null}
                </View>

                <Pressable onPress={() => open(b.key)} style={[styles.cta, items.length ? styles.ctaOpen : styles.ctaStart]}>
                  <Text style={[styles.ctaText, { color: items.length ? colors.onDark : colors.accentInk }]}>
                    {items.length ? 'View all' : 'Start the interview'}
                  </Text>
                  <Ionicons name="arrow-forward" size={15} color={items.length ? colors.onDark : colors.accentInk} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.dots}>
        {FASC_BUCKETS.map((b, i) => (
          <View key={b.key} style={[styles.dot, i === active && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22 },
  card: {
    width: CARD_W,
    height: 292,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: 20,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 21 },
  cardTitle: { fontFamily: font.displayBold, fontSize: 19, letterSpacing: -0.5, color: colors.ink },
  cardMeta: { fontFamily: font.bold, fontSize: 12.5, color: colors.muted, marginTop: 3 },

  mid: { flex: 1, marginTop: 16, gap: 7 },
  midEmpty: { justifyContent: 'center' },
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
  more: { fontFamily: font.bold, fontSize: 12.5, color: colors.muted, marginTop: 1, marginLeft: 4 },
  emptyText: { fontFamily: font.medium, fontSize: 15, lineHeight: 22, color: colors.inkSoft },

  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 46, borderRadius: radius.pill },
  ctaOpen: { backgroundColor: colors.ink },
  ctaStart: { backgroundColor: colors.accent },
  ctaText: { fontFamily: font.bold, fontSize: 14 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lineStrong },
  dotOn: { width: 18, backgroundColor: colors.accentDeep },
});
