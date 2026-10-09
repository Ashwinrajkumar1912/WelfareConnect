import {
  HeartPulse,
  GraduationCap,
  Home,
  Utensils,
  Briefcase,
  Wallet,
  Accessibility,
  UsersRound,
  Baby,
  Sprout,
  FileText,
  LucideIcon,
} from 'lucide-react-native';
import { SchemeCategory, CATEGORY_META } from '@/lib/types';
import { colors, radius } from '@/lib/theme';
import { View } from 'react-native';

const ICONS: Record<SchemeCategory, LucideIcon> = {
  healthcare: HeartPulse,
  education: GraduationCap,
  housing: Home,
  food: Utensils,
  employment: Briefcase,
  financial: Wallet,
  disability: Accessibility,
  senior: UsersRound,
  women: Baby,
  agriculture: Sprout,
};

export function CategoryIcon({
  category,
  size = 22,
  color,
  withBackground = false,
}: {
  category: SchemeCategory;
  size?: number;
  color?: string;
  withBackground?: boolean;
}) {
  const Icon = ICONS[category] ?? FileText;
  const iconColor = color ?? colors.neutral[0];
  const bgColor = colors.category[category];
  const bgLight = colors.categoryLight[category];

  if (withBackground) {
    return (
      <View
        style={{
          backgroundColor: bgLight,
          width: size + 20,
          height: size + 20,
          borderRadius: radius.md,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon size={size} color={bgColor} strokeWidth={2.2} />
      </View>
    );
  }

  return <Icon size={size} color={bgColor} strokeWidth={2.2} />;
}

export function categoryLabel(category: SchemeCategory): string {
  return CATEGORY_META[category]?.label ?? category;
}
