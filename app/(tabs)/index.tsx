import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Hourglass,
  CircleDashed,
  FileText,
} from 'lucide-react-native';
import { useUserSchemes } from '@/lib/data';
import { STATUS_META, STATUS_ORDER } from '@/lib/types';
import { colors, typography, radius, formatCurrency, daysUntil } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { CategoryIcon, categoryLabel } from '@/components/CategoryIcon';
import { StatusBadge } from '@/components/StatusBadge';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, loading, refetch } = useUserSchemes();
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const total = items.length;
    const approved = items.filter((i) => i.status === 'approved' || i.status === 'disbursed').length;
    const inProgress = items.filter((i) =>
      ['applied', 'under_review', 'interested'].includes(i.status)
    ).length;
    const totalReceived = items.reduce((sum, i) => sum + (i.amount_received ?? 0), 0);
    const potentialValue = items.reduce((sum, i) => {
      if (i.status === 'rejected') return sum;
      return sum + (i.scheme.benefit_amount ?? 0);
    }, 0);

    const statusBreakdown = STATUS_ORDER.map((s) => ({
      status: s,
      count: items.filter((i) => i.status === s).length,
    })).filter((x) => x.count > 0);

    return { total, approved, inProgress, totalReceived, potentialValue, statusBreakdown };
  }, [items]);

  const upcomingDeadlines = useMemo(() => {
    return items
      .filter((i) => i.next_action_date)
      .map((i) => ({ ...i, days: daysUntil(i.next_action_date!) }))
      .filter((i) => i.days >= -7)
      .sort((a, b) => a.days - b.days)
      .slice(0, 4);
  }, [items]);

  const recent = useMemo(() => items.slice(0, 4), [items]);

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

  const firstName = (user?.user_metadata?.full_name as string)?.split(' ')[0] ?? 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary[600]]} />
      }
    >
      {/* Gradient hero header */}
      <LinearGradient
        colors={colors.gradient.tricolour}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <Text style={styles.greeting}>Namaste, {firstName}</Text>
        <Text style={styles.headerSub}>Here is your benefits overview</Text>
        <View style={styles.tricolourStrip}>
          <View style={styles.tricolourSaffron} />
          <View style={styles.tricolourWhite} />
          <View style={styles.tricolourGreen} />
        </View>
      </LinearGradient>

      {/* Gradient stat cards */}
      <View style={styles.statRow}>
        <LinearGradient
          colors={colors.gradient.navy}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <View style={styles.statIconWrap}>
            <Wallet size={20} color={colors.tricolour.navy} strokeWidth={2.2} />
          </View>
          <Text style={styles.statLabel}>Benefits received</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalReceived)}</Text>
          <Text style={styles.statSub}>across {stats.approved} approved</Text>
        </LinearGradient>

        <LinearGradient
          colors={colors.gradient.saffron}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <View style={styles.statIconWrap}>
            <TrendingUp size={20} color={colors.tricolour.saffronDeep} strokeWidth={2.2} />
          </View>
          <Text style={styles.statLabel}>Potential value</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.potentialValue)}</Text>
          <Text style={styles.statSub}>from {stats.total} schemes</Text>
        </LinearGradient>
      </View>

      {/* Progress summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>Application progress</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/benefits')}>
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressSteps}>
          {stats.statusBreakdown.map(({ status, count }) => {
            const meta = STATUS_META[status];
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <View key={status} style={styles.progressItem}>
                <View style={styles.progressItemTop}>
                  <View style={[styles.progressDot, { backgroundColor: meta.color }]} />
                  <Text style={styles.progressLabel}>{meta.label}</Text>
                  <Text style={styles.progressCount}>{count}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${pct}%`, backgroundColor: meta.color }]}
                  />
                </View>
              </View>
            );
          })}
          {stats.statusBreakdown.length === 0 && (
            <Text style={styles.emptyMini}>No schemes tracked yet.</Text>
          )}
        </View>
      </View>

      {/* Quick stats — colorful tiles */}
      <View style={styles.quickRow}>
        <View style={[styles.quickCard, { backgroundColor: colors.warningLight }]}>
          <View style={[styles.quickIconWrap, { backgroundColor: colors.warning }]}>
            <Hourglass size={16} color="#fff" strokeWidth={2.2} />
          </View>
          <Text style={styles.quickValue}>{stats.inProgress}</Text>
          <Text style={styles.quickLabel}>In progress</Text>
        </View>
        <View style={[styles.quickCard, { backgroundColor: colors.successLight }]}>
          <View style={[styles.quickIconWrap, { backgroundColor: colors.success }]}>
            <CheckCircle2 size={16} color="#fff" strokeWidth={2.2} />
          </View>
          <Text style={styles.quickValue}>{stats.approved}</Text>
          <Text style={styles.quickLabel}>Approved</Text>
        </View>
        <View style={[styles.quickCard, { backgroundColor: colors.errorLight }]}>
          <View style={[styles.quickIconWrap, { backgroundColor: colors.error }]}>
            <Clock size={16} color="#fff" strokeWidth={2.2} />
          </View>
          <Text style={styles.quickValue}>{upcomingDeadlines.length}</Text>
          <Text style={styles.quickLabel}>Deadlines</Text>
        </View>
      </View>

      {/* Upcoming deadlines */}
      {upcomingDeadlines.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.sectionTitle}>Upcoming deadlines</Text>
          </View>
          <View style={styles.deadlineList}>
            {upcomingDeadlines.map((item) => {
              const overdue = item.days < 0;
              const soon = item.days >= 0 && item.days <= 3;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.deadlineItem}
                  onPress={() => router.push(`/scheme/${item.scheme_id}`)}
                >
                  <View
                    style={[
                      styles.deadlineBadge,
                      overdue && styles.deadlineBadgeOverdue,
                      soon && styles.deadlineBadgeSoon,
                    ]}
                  >
                    <Text
                      style={[
                        styles.deadlineBadgeText,
                        overdue && styles.deadlineBadgeTextOverdue,
                        soon && styles.deadlineBadgeTextSoon,
                      ]}
                    >
                      {overdue ? `${Math.abs(item.days)}d overdue` : `${item.days}d left`}
                    </Text>
                  </View>
                  <View style={styles.deadlineBody}>
                    <Text style={styles.deadlineTitle} numberOfLines={1}>
                      {item.scheme.title}
                    </Text>
                    {item.next_action && (
                      <Text style={styles.deadlineSub} numberOfLines={1}>
                        {item.next_action}
                      </Text>
                    )}
                  </View>
                  <ArrowRight size={16} color={colors.neutral[300]} strokeWidth={2.2} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Recent activity */}
      <View style={styles.sectionCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>Recently updated</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/benefits')}>
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>
        {recent.length > 0 ? (
          <View style={styles.recentList}>
            {recent.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentItem}
                onPress={() => router.push(`/scheme/${item.scheme_id}`)}
              >
                <CategoryIcon category={item.scheme.category} withBackground size={18} />
                <View style={styles.recentBody}>
                  <Text style={styles.recentTitle} numberOfLines={1}>
                    {item.scheme.title}
                  </Text>
                  <Text style={styles.recentCat}>{categoryLabel(item.scheme.category)}</Text>
                </View>
                <StatusBadge status={item.status} size="sm" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.recentEmpty}>
            <View style={styles.recentEmptyIcon}>
              <CircleDashed size={28} color={colors.primary[500]} strokeWidth={2.2} />
            </View>
            <Text style={styles.recentEmptyTitle}>Start tracking schemes</Text>
            <Text style={styles.recentEmptySub}>
              Add welfare programs from the Schemes tab to see them here.
            </Text>
            <TouchableOpacity
              style={styles.recentEmptyBtn}
              onPress={() => router.push('/(tabs)/schemes')}
            >
              <Text style={styles.recentEmptyBtnText}>Browse schemes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
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
  content: {
    padding: 20,
    paddingTop: 0,
  },
  heroHeader: {
    marginHorizontal: -20,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    marginBottom: 20,
  },
  greeting: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 28,
    color: '#fff',
  },
  headerSub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 4,
  },
  tricolourStrip: {
    flexDirection: 'row',
    width: '100%',
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 16,
  },
  tricolourSaffron: {
    flex: 1,
    backgroundColor: colors.tricolour.saffron,
  },
  tricolourWhite: {
    flex: 1,
    backgroundColor: colors.tricolour.white,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  tricolourGreen: {
    flex: 1,
    backgroundColor: colors.tricolour.green,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 16,
  shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 24,
    color: '#fff',
    marginTop: 2,
  },
  statSub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    color: colors.neutral[900],
  },
  seeAll: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: 12,
    color: colors.primary[600],
  },
  progressSteps: {
    gap: 14,
  },
  progressItem: {},
  progressItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  progressLabel: {
    flex: 1,
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[700],
  },
  progressCount: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    color: colors.neutral[900],
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.neutral[100],
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  emptyMini: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[400],
    textAlign: 'center',
    paddingVertical: 8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  quickValue: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 20,
    color: colors.neutral[900],
  },
  quickLabel: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 11,
    color: colors.neutral[600],
  },
  sectionCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  deadlineList: {
    gap: 10,
  },
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  deadlineBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
    minWidth: 68,
    alignItems: 'center',
  },
  deadlineBadgeOverdue: {
    backgroundColor: colors.errorLight,
  },
  deadlineBadgeSoon: {
    backgroundColor: colors.warningLight,
  },
  deadlineBadgeText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 10,
    color: colors.neutral[600],
  },
  deadlineBadgeTextOverdue: {
    color: colors.error,
  },
  deadlineBadgeTextSoon: {
    color: colors.warning,
  },
  deadlineBody: {
    flex: 1,
  },
  deadlineTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    color: colors.neutral[900],
  },
  deadlineSub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentBody: {
    flex: 1,
  },
  recentTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    color: colors.neutral[900],
  },
  recentCat: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 1,
  },
  recentEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  recentEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentEmptyTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    color: colors.neutral[700],
  },
  recentEmptySub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  recentEmptyBtn: {
    marginTop: 14,
    backgroundColor: colors.primary[600],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  recentEmptyBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    color: '#fff',
  },
});
