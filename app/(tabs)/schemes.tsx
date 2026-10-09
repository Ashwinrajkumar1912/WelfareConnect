import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronRight, ExternalLink } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { Scheme, SchemeCategory } from '@/lib/types';
import { colors, typography, radius, formatCurrency } from '@/lib/theme';
import { CategoryIcon, categoryLabel } from '@/components/CategoryIcon';
import { useUserSchemes } from '@/lib/data';

const CATEGORIES: (SchemeCategory | 'all')[] = [
  'all',
  'healthcare',
  'education',
  'housing',
  'food',
  'employment',
  'financial',
  'disability',
  'senior',
  'women',
  'agriculture',
];

export default function SchemesScreen() {
  const router = useRouter();
  const { items: tracked } = useUserSchemes();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<SchemeCategory | 'all'>('all');

  const trackedIds = useMemo(() => new Set(tracked.map((t) => t.scheme_id)), [tracked]);

  const fetchSchemes = useCallback(async () => {
    const { data, error } = await supabase
      .from('schemes')
      .select('*')
      .order('title', { ascending: true });
    if (!error && data) setSchemes(data as Scheme[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const filtered = useMemo(() => {
    return schemes.filter((s) => {
      const matchesCat = activeCat === 'all' || s.category === activeCat;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.eligibility.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [schemes, activeCat, query]);

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
        <Text style={styles.headerTitle}>Welfare Schemes</Text>
        <Text style={styles.headerSub}>
          {schemes.length} programs available · {trackedIds.size} tracked
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <Search size={18} color={colors.primary[500]} strokeWidth={2.2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search schemes, eligibility..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={colors.neutral[400]}
        />
      </View>

      <View style={styles.categoryRow}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const active = activeCat === item;
            const label = item === 'all' ? 'All' : categoryLabel(item as SchemeCategory);
            const catColor =
              item === 'all' ? colors.primary[600] : colors.category[item as SchemeCategory];
            const catLight =
              item === 'all' ? colors.primary[50] : colors.categoryLight[item as SchemeCategory];
            return (
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: active ? catColor : catLight },
                ]}
                onPress={() => setActiveCat(item)}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : catColor }]}>{label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchSchemes();
            }}
            colors={[colors.primary[600]]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No schemes found</Text>
            <Text style={styles.emptySub}>Try a different search or category.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isTracked = trackedIds.has(item.id);
          const catColor = colors.category[item.category];
          const catLight = colors.categoryLight[item.category];
          return (
            <TouchableOpacity
              style={[styles.card, { borderLeftColor: catColor }]}
              activeOpacity={0.7}
              onPress={() => router.push(`/scheme/${item.id}`)}
            >
              <View style={styles.cardTop}>
                <CategoryIcon category={item.category} withBackground size={22} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={[styles.cardCat, { color: catColor }]}>{categoryLabel(item.category)}</Text>
                </View>
                <ChevronRight size={18} color={colors.neutral[300]} strokeWidth={2.2} />
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={[styles.cardFooter, { backgroundColor: catLight }]}>
                <Text style={[styles.benefitAmount, { color: colors.success }]}>
                  {item.benefit_amount ? formatCurrency(item.benefit_amount) : 'Non-monetary'}
                  {item.benefit_unit ? ` · ${item.benefit_unit}` : ''}
                </Text>
                <View style={styles.footerRight}>
                  {item.application_url && (
                    <TouchableOpacity
                      style={styles.applyLink}
                      onPress={async (e) => {
                        e.stopPropagation();
                        await WebBrowser.openBrowserAsync(item.application_url!);
                      }}
                    >
                      <ExternalLink size={12} color={colors.accent[700]} strokeWidth={2.2} />
                      <Text style={styles.applyLinkText}>Apply</Text>
                    </TouchableOpacity>
                  )}
                  {isTracked && (
                    <View style={styles.trackedTag}>
                      <Text style={styles.trackedTagText}>Tracked</Text>
                    </View>
                  )}
                </View>
              </View>
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamilyRegular,
    fontSize: 15,
    color: colors.neutral[900],
    paddingVertical: 12,
    marginLeft: 10,
  },
  categoryRow: {
    marginBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.full,
  },
  chipText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
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
    marginBottom: 10,
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
  cardDesc: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[500],
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  benefitAmount: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  applyLinkText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    color: colors.accent[700],
  },
  trackedTag: {
    backgroundColor: colors.primary[600],
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  trackedTagText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    color: '#fff',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 16,
    color: colors.neutral[700],
  },
  emptySub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[400],
    marginTop: 4,
  },
});
