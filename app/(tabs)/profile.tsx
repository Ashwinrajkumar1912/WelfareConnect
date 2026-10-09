import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  User,
  Mail,
  MapPin,
  Users,
  DollarSign,
  Accessibility,
  LogOut,
  Save,
  Pencil,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useUserSchemes } from '@/lib/data';
import { colors, typography, radius, formatCurrency } from '@/lib/theme';

type Profile = {
  id: string;
  full_name: string;
  age: number | null;
  annual_income: number | null;
  state: string | null;
  family_size: number | null;
  has_disability: boolean;
  is_senior: boolean;
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { items } = useUserSchemes();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [income, setIncome] = useState('');
  const [state, setState] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [hasDisability, setHasDisability] = useState(false);
  const [isSenior, setIsSenior] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    const p = data as Profile | null;
    setProfile(p);
    if (p) {
      setFullName(p.full_name ?? '');
      setAge(p.age != null ? String(p.age) : '');
      setIncome(p.annual_income != null ? String(p.annual_income) : '');
      setState(p.state ?? '');
      setFamilySize(p.family_size != null ? String(p.family_size) : '');
      setHasDisability(p.has_disability);
      setIsSenior(p.is_senior);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const patch = {
      id: user.id,
      full_name: fullName.trim(),
      age: age.trim() ? Number(age) : null,
      annual_income: income.trim() ? Number(income) : null,
      state: state.trim() || null,
      family_size: familySize.trim() ? Number(familySize) : null,
      has_disability: hasDisability,
      is_senior: isSenior,
    };
    const { error } = await supabase.from('profiles').upsert(patch, { onConflict: 'id' });
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setEditing(false);
    load();
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again to access your benefits.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth');
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const totalReceived = items.reduce((s, i) => s + (i.amount_received ?? 0), 0);
  const approvedCount = items.filter(
    (i) => i.status === 'approved' || i.status === 'disbursed'
  ).length;

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary[600]]} />
      }
    >
      {/* Gradient header */}
      <LinearGradient
        colors={colors.gradient.tricolour}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <User size={36} color="#fff" strokeWidth={2} />
        </View>
        <Text style={styles.name}>{fullName || user?.email?.split('@')[0] || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.tricolourStrip}>
          <View style={styles.tricolourSaffron} />
          <View style={styles.tricolourWhite} />
          <View style={styles.tricolourGreen} />
        </View>
      </LinearGradient>

      {/* Account stats — colorful tiles */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.successLight }]}>
          <View style={[styles.statIconWrap, { backgroundColor: colors.success }]}>
            <Wallet size={15} color="#fff" strokeWidth={2.2} />
          </View>
          <Text style={styles.statValue}>{formatCurrency(totalReceived)}</Text>
          <Text style={styles.statLabel}>Received</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.infoLight }]}>
          <View style={[styles.statIconWrap, { backgroundColor: colors.info }]}>
            <TrendingUp size={15} color="#fff" strokeWidth={2.2} />
          </View>
          <Text style={styles.statValue}>{approvedCount}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.accent[100] }]}>
          <View style={[styles.statIconWrap, { backgroundColor: colors.accent[500] }]}>
            <Shield size={15} color="#fff" strokeWidth={2.2} />
          </View>
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>Tracked</Text>
        </View>
      </View>

      {/* Eligibility profile */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Eligibility profile</Text>
          {!editing ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Pencil size={14} color={colors.primary[600]} strokeWidth={2.2} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.cardSub}>
          This information helps you match schemes. It stays private to your account.
        </Text>

        {editing ? (
          <View style={styles.form}>
            <FormField label="Full name" icon={<User size={16} color={colors.primary[500]} />}>
              <TextInput
                style={styles.fieldInput}
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={colors.neutral[400]}
              />
            </FormField>
            <View style={styles.formRow}>
              <FormField label="Age" icon={<Users size={16} color={colors.primary[500]} />}>
                <TextInput
                  style={styles.fieldInput}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholderTextColor={colors.neutral[400]}
                />
              </FormField>
              <FormField label="Family size" icon={<Users size={16} color={colors.primary[500]} />}>
                <TextInput
                  style={styles.fieldInput}
                  value={familySize}
                  onChangeText={setFamilySize}
                  keyboardType="numeric"
                  placeholderTextColor={colors.neutral[400]}
                />
              </FormField>
            </View>
            <FormField
              label="Annual income"
              icon={<DollarSign size={16} color={colors.primary[500]} />}
            >
              <TextInput
                style={styles.fieldInput}
                value={income}
                onChangeText={setIncome}
                keyboardType="numeric"
                placeholderTextColor={colors.neutral[400]}
              />
            </FormField>
            <FormField label="State / Region" icon={<MapPin size={16} color={colors.primary[500]} />}>
              <TextInput
                style={styles.fieldInput}
                value={state}
                onChangeText={setState}
                placeholderTextColor={colors.neutral[400]}
              />
            </FormField>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setHasDisability((v) => !v)}
            >
              <View style={styles.toggleLeft}>
                <Accessibility size={16} color={colors.neutral[500]} strokeWidth={2.2} />
                <Text style={styles.toggleLabel}>Person with disability</Text>
              </View>
              <View style={[styles.toggle, hasDisability && styles.toggleOn]}>
                <View style={[styles.toggleKnob, hasDisability && styles.toggleKnobOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsSenior((v) => !v)}
            >
              <View style={styles.toggleLeft}>
                <Users size={16} color={colors.neutral[500]} strokeWidth={2.2} />
                <Text style={styles.toggleLabel}>Senior citizen (60+)</Text>
              </View>
              <View style={[styles.toggle, isSenior && styles.toggleOn]}>
                <View style={[styles.toggleKnob, isSenior && styles.toggleKnobOn]} />
              </View>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditing(false);
                  load();
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={16} color="#fff" strokeWidth={2.2} />
                    <Text style={styles.saveBtnText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoList}>
            <InfoRow icon={<User size={16} color={colors.primary[500]} />} label="Full name" value={fullName || '—'} />
            <InfoRow icon={<Users size={16} color={colors.secondary[500]} />} label="Age" value={profile?.age != null ? String(profile.age) : '—'} />
            <InfoRow icon={<Users size={16} color={colors.accent[500]} />} label="Family size" value={profile?.family_size != null ? String(profile.family_size) : '—'} />
            <InfoRow icon={<DollarSign size={16} color={colors.success} />} label="Annual income" value={profile?.annual_income != null ? formatCurrency(profile.annual_income) : '—'} />
            <InfoRow icon={<MapPin size={16} color={colors.info} />} label="State / Region" value={profile?.state || '—'} />
            <InfoRow icon={<Accessibility size={16} color={colors.category.disability} />} label="Disability" value={profile?.has_disability ? 'Yes' : 'No'} />
            <InfoRow icon={<Users size={16} color={colors.category.senior} />} label="Senior citizen" value={profile?.is_senior ? 'Yes' : 'No'} />
          </View>
        )}
      </View>

      {/* Account */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <View style={styles.infoList}>
          <InfoRow icon={<Mail size={16} color={colors.primary[500]} />} label="Email" value={user?.email ?? '—'} />
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={16} color={colors.error} strokeWidth={2.2} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>WelfareConnect v1.0</Text>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldWrap}>
        {icon}
        {children}
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
  content: {
    padding: 20,
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: -20,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    color: '#fff',
  },
  email: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
    color: colors.neutral[900],
  },
  statLabel: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 11,
    color: colors.neutral[600],
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 16,
    color: colors.neutral[900],
  },
  cardSub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.primary[50],
  },
  editBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    color: colors.primary[600],
  },
  infoList: {
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[500],
    flex: 1,
  },
  infoValue: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    color: colors.neutral[900],
    textAlign: 'right',
    flexShrink: 1,
  },
  form: {
    gap: 14,
  },
  field: {},
  fieldLabel: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 6,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    fontFamily: typography.fontFamilyRegular,
    fontSize: 14,
    color: colors.neutral[900],
    paddingVertical: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 14,
    color: colors.neutral[700],
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: colors.primary[600],
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    color: colors.neutral[600],
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    color: '#fff',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.errorLight,
  },
  signOutText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    color: colors.error,
  },
  version: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 11,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 8,
  },
});
