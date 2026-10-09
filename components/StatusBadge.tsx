import { View, Text, StyleSheet } from 'react-native';
import { ApplicationStatus, STATUS_META } from '@/lib/types';
import { typography, radius } from '@/lib/theme';

export function StatusBadge({ status, size = 'md' }: { status: ApplicationStatus; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status];
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: meta.color }, isSmall && styles.dotSm]} />
      <Text style={[styles.label, { color: meta.color }, isSmall && styles.labelSm]}>
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    gap: 6,
  },
  badgeSm: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  dotSm: {
    width: 6,
    height: 6,
  },
  label: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  labelSm: {
    fontSize: 11,
  },
});
