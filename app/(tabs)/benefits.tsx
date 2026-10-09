import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, FileCheck2, Inbox } from 'lucide-react-native';
import { useUserSchemes } from '@/lib/data';
import { ApplicationStatus, STATUS_META, STATUS_ORDER } from '@/lib/types';
import { colors, typography, radius, formatCurrency, formatDate } from '@/lib/theme';
import { CategoryIcon, categoryLabel } from '@/components/CategoryIcon';
import { StatusBadge } from '@/components/StatusBadge';

const FILTERS: (ApplicationStatus | 'all')[] = ['all', ...STATUS_ORDER, 'rejected'];

export default function BenefitsScreen() {
  const router = useRouter();
  const { items, loading, refetch } = useUserSchemes();
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of items) map[i.status] = (map[i.status] ?? 0) + 1;
    return map;
  }, [items]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Benefits</Text>
        <Text style={styles.headerSub}>
          {items.length} scheme{items.length === 1 ? '' : 's'} tracked
        </Text>
      </View>

      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => {
          const active = filter === item;
          const label = item === 'all' ? 'All' : STATUS_META[item].label;
          const count = item === 'all' ? items.length : counts[item] ?? 0;
          const activeColor = item === 'all' ? colors.primary[600] : STATUS_META[item as ApplicationStatus].color;
          return (
            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: active ? activeColor : colors.neutral[100] },
              ]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : colors.neutral[600] }]}>{label}</Text>
              <View style={[styles.chipCount, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : colors.neutral[0] }]}>
                <Text style={[styles.chipCountText, { color: active ? '#fff' : colors.neutral[500] }]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary[600]]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              {filter === 'all' ? (
                <Inbox size={32} color={colors.primary[400]} strokeWidth={2.2} />
              ) : (
                <FileCheck2 size={32} color={colors.neutral[300]} strokeWidth={2.2} />
              )}
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No schemes tracked yet' : 'Nothing in this status'}
            </Text>
            <Text style={styles.emptySub}>
              {filter === 'all'
                ? 'Browse the Schemes tab and add programs you want to follow.'
                : 'Update a scheme status to see it here.'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/(tabs)/schemes')}
              >
                <Text style={styles.emptyBtnText}>Browse schemes</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const catColor = colors.category[item.scheme.category];
          return (
            <TouchableOpacity
              style={[styles.card, { borderLeftColor: catColor }]}
              activeOpacity={0.7}
              onPress={() => router.push(`/scheme/${item.scheme_id}`)}
            >
              <View style={styles.cardTop}>
                <CategoryIcon category={item.scheme.category} withBackground size={22} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.scheme.title}</Text>
                  <Text style={[styles.cardCat, { color: catColor }]}>{categoryLabel(item.scheme.category)}</Text>
                </View>
                <ChevronRight size={18} color={colors.neutral[300]} strokeWidth={2.2} />
              </View>

              <View style={styles.cardMeta}>
                <StatusBadge status={item.status} size="sm" />
                {item.next_action_date && (
                  <View style={styles.dueTag}>
                    <Text style={styles.dueTagText}>Next: {formatDate(item.next_action_date)}</Text>
                  </View>
                )}
              </View>

              {item.amount_received != null && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Received</Text>
                  <Text style={styles.amountValue}>{formatCurrency(item.amount_received)}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 26,
    color: colors.neutral[900],
  },
  headerSub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.full,
  },
  chipText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
  },
  chipCount: {
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipCountText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 10,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderLeftWidth: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    color: colors.neutral[900],
    lineHeight: 20,
  },
  cardCat: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: 12,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dueTag: {
    backgroundColor: colors.warningLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  dueTagText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    color: colors.warning,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  amountLabel: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 12,
    color: colors.neutral[500],
  },
  amountValue: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    color: colors.success,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 16,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[400],
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.md,
  },
  emptyBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    color: '#fff',
  },
});
