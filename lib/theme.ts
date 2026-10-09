export const colors = {
  // Primary — Indian flag green (#138808)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  // Accent — Indian flag saffron (#FF9933)
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  // Secondary — Ashoka Chakra navy blue
  secondary: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  // Indian tricolour specific colors
  tricolour: {
    saffron: '#FF9933',
    saffronDeep: '#FF6B1A',
    white: '#ffffff',
    green: '#138808',
    greenDeep: '#0c6006',
    navy: '#000080',
  },
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#ea580c',
  warningLight: '#fef3c7',
  error: '#dc2626',
  errorLight: '#fee2e2',
  info: '#0ea5e9',
  infoLight: '#e0f2fe',
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  category: {
    healthcare: '#e11d48',
    education: '#7c3aed',
    housing: '#0891b2',
    food: '#ea580c',
    employment: '#0d9488',
    financial: '#000080',
    disability: '#be185d',
    senior: '#9333ea',
    women: '#db2777',
    agriculture: '#138808',
  },
  categoryLight: {
    healthcare: '#fff1f2',
    education: '#f5f3ff',
    housing: '#ecfeff',
    food: '#fff7ed',
    employment: '#f0fdfa',
    financial: '#e0e7ff',
    disability: '#fdf2f8',
    senior: '#faf5ff',
    women: '#fdf2f8',
    agriculture: '#f0fdf4',
  },
  // Gradient endpoints — Indian tricolour inspired
  gradient: {
    // Tricolour: saffron → green (hero headers)
    tricolour: ['#FF9933', '#138808'] as [string, string],
    // Saffron gradient
    saffron: ['#FF9933', '#FF6B1A'] as [string, string],
    // Green gradient (India flag green)
    green: ['#22c55e', '#138808'] as [string, string],
    // Navy (Ashoka Chakra)
    navy: ['#000080', '#000060'] as [string, string],
    primary: ['#22c55e', '#138808'] as [string, string],
    accent: ['#FF9933', '#FF6B1A'] as [string, string],
    blue: ['#3b82f6', '#2563eb'] as [string, string],
    purple: ['#8b5cf6', '#7c3aed'] as [string, string],
    rose: ['#f43f5e', '#e11d48'] as [string, string],
    teal: ['#14b8a6', '#0d9488'] as [string, string],
    sky: ['#0ea5e9', '#0284c7'] as [string, string],
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const typography = {
  fontFamilyRegular: 'Inter-Regular',
  fontFamilyMedium: 'Inter-Medium',
  fontFamilySemiBold: 'Inter-SemiBold',
  fontFamilyBold: 'Inter-Bold',
};

// Indian Rupee formatting
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  if (amount === 0) return 'Non-monetary';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `₹${String(amount)}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}
