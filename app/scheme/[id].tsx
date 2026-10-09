import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  CheckCircle2,
  Circle,
  FileText,
  ListChecks,
  Phone,
  Calendar,
  Wallet,
  Trash2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { Scheme, ApplicationStatus, STATUS_META, STATUS_ORDER, UserScheme } from '@/lib/types';
import { colors, typography, radius, formatCurrency } from '@/lib/theme';
import { CategoryIcon, categoryLabel } from '@/components/CategoryIcon';
import { StatusBadge } from '@/components/StatusBadge';
import { updateUserScheme, removeUserScheme, upsertUserScheme } from '@/lib/data';

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  healthcare: ['#f43f5e', '#e11d48'],
  education: ['#8b5cf6', '#7c3aed'],
  housing: ['#06b6d4', '#0891b2'],
  food: ['#fb923c', '#ea580c'],
  employment: ['#14b8a6', '#0d9488'],
  financial: ['#3b82f6', '#2563eb'],
  disability: ['#ec4899', '#be185d'],
  senior: ['#a855f7', '#9333ea'],
  women: ['#f43f5e', '#db2777'],
  agriculture: ['#22c55e', '#16a34a'],
};

export default function SchemeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [userScheme, setUserScheme] = useState<UserScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [editMode, setEditMode] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [{ data: s }, { data: us }] = await Promise.all([
      supabase.from('schemes').select('*').eq('id', id).maybeSingle(),
      supabase.from('user_schemes').select('*').eq('scheme_id', id).maybeSingle(),
    ]);
    setScheme(s as Scheme);
    const u = us as UserScheme | null;
    setUserScheme(u);
    if (u) {
      setNotes(u.notes ?? '');
      setAmountReceived(u.amount_received != null ? String(u.amount_received) : '');
      setNextAction(u.next_action ?? '');
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleTrack = async (newStatus: ApplicationStatus) => {
    if (!id) return;
    setSaving(true);
    const { error } = await upsertUserScheme(id, newStatus);
    setSaving(false);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    load();
  };

  const handleSaveDetails = async () => {
    if (!userScheme) return;
    setSaving(true);
    const patch: Partial<UserScheme> = {
      notes: notes.trim() || null,
      next_action: nextAction.trim() || null,
      amount_received: amountReceived.trim() ? Number(amountReceived) : null,
    };
    const { error } = await updateUserScheme(userScheme.id, patch);
    setSaving(false);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    setEditMode(false);
    load();
  };

  const handleRemove = () => {
    if (!userScheme) return;
    Alert.alert(
      'Remove from tracking?',
      'This scheme will be removed from your benefits list. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await removeUserScheme(userScheme.id);
            if (error) {
              Alert.alert('Error', error);
              return;
            }
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!scheme) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.emptyText}>Scheme not found.</Text>
      </View>
    );
  }

  const catGradient = CATEGORY_GRADIENTS[scheme.category] ?? colors.gradient.primary;

  return (
    <View style={styles.container}>
      <View style={styles.modalHeader}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={22} color={colors.neutral[700]} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Scheme Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient hero */}
        <LinearGradient
          colors={catGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <CategoryIcon category={scheme.category} size={24} color="#fff" />
            </View>
            <View style={styles.heroCatWrap}>
              <Text style={styles.heroCat}>{categoryLabel(scheme.category)}</Text>
              {userScheme && <StatusBadge status={userScheme.status} size="sm" />}
            </View>
          </View>
          <Text style={styles.heroTitle}>{scheme.title}</Text>
          <Text style={styles.heroDesc}>{scheme.description}</Text>

          <View style={styles.benefitBox}>
            <Wallet size={16} color="#fff" strokeWidth={2.2} />
            <View style={styles.benefitItemBody}>
              <Text style={styles.benefitLabel}>Benefit</Text>
              <Text style={styles.benefitValue}>
                {scheme.benefit_amount ? formatCurrency(scheme.benefit_amount) : 'Non-monetary'}
                {scheme.benefit_unit ? ` · ${scheme.benefit_unit}` : ''}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Section title="Eligibility" icon={<FileText size={16} color={colors.primary[600]} />}>
          <Text style={styles.sectionText}>{scheme.eligibility}</Text>
          {scheme.eligibility_criteria.length > 0 && (
            <View style={styles.listWrap}>
              {scheme.eligibility_criteria.map((c, i) => (
                <View key={i} style={styles.listItem}>
                  <Circle size={7} color={colors.primary[500]} strokeWidth={2} />
                  <Text style={styles.listText}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Section
          title="Documents Required"
          icon={<ListChecks size={16} color={colors.success} />}
        >
          {scheme.documents_required.length > 0 ? (
            <View style={styles.listWrap}>
              {scheme.documents_required.map((d, i) => (
                <View key={i} style={styles.listItem}>
                  <CheckCircle2 size={15} color={colors.success} strokeWidth={2.2} />
                  <Text style={styles.listText}>{d}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionText}>No specific documents listed.</Text>
          )}
        </Section>

        {scheme.contact_info && (
          <Section title="Contact" icon={<Phone size={16} color={colors.info} />}>
            <Text style={styles.sectionText}>{scheme.contact_info}</Text>
          </Section>
        )}

        {scheme.application_url && (
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={async () => {
              await WebBrowser.openBrowserAsync(scheme.application_url!);
            }}
            activeOpacity={0.85}
          >
            <ExternalLink size={18} color="#fff" strokeWidth={2.2} />
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        )}

        {/* Tracking section */}
        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Track this scheme</Text>
          <Text style={styles.trackingSub}>
            {userScheme
              ? 'Update your application status below.'
              : 'Add this scheme to your tracked benefits.'}
          </Text>

          {userScheme ? (
            <>
              <View style={styles.statusSteps}>
                {STATUS_ORDER.map((s) => {
                  const meta = STATUS_META[s];
                  const isCurrent = userScheme.status === s;
                  const isPast = STATUS_META[userScheme.status].step > meta.step && meta.step >= 0;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusChip,
                        isCurrent && { backgroundColor: meta.color, borderColor: meta.color },
                        !isCurrent && !isPast && styles.statusChipInactive,
                        isPast && { backgroundColor: meta.bg, borderColor: meta.color },
                      ]}
                      disabled={saving}
                      onPress={() => handleTrack(s)}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          { color: isCurrent ? '#fff' : isPast ? meta.color : colors.neutral[500] },
                        ]}
                      >
                        {meta.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {editMode ? (
                <View style={styles.editForm}>
                  <Text style={styles.fieldLabel}>Amount received</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={amountReceived}
                    onChangeText={setAmountReceived}
                    placeholder="e.g. 6000"
                    keyboardType="numeric"
                    placeholderTextColor={colors.neutral[400]}
                  />
                  <Text style={styles.fieldLabel}>Next action</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={nextAction}
                    onChangeText={setNextAction}
                    placeholder="e.g. Submit documents by deadline"
                    placeholderTextColor={colors.neutral[400]}
                  />
                  <Text style={styles.fieldLabel}>Notes</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add any personal notes..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholderTextColor={colors.neutral[400]}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setEditMode(false)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSaveDetails}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.saveBtnText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {(userScheme.amount_received != null ||
                    userScheme.next_action ||
                    userScheme.notes) && (
                    <View style={styles.detailsBox}>
                      {userScheme.amount_received != null && (
                        <View style={styles.detailRow}>
                          <Wallet size={14} color={colors.success} strokeWidth={2.2} />
                          <Text style={styles.detailLabel}>Received</Text>
                          <Text style={styles.detailValue}>
                            {formatCurrency(userScheme.amount_received)}
                          </Text>
                        </View>
                      )}
                      {userScheme.next_action && (
                        <View style={styles.detailRow}>
                          <Calendar size={14} color={colors.warning} strokeWidth={2.2} />
                          <Text style={styles.detailValue}>{userScheme.next_action}</Text>
                        </View>
                      )}
                      {userScheme.notes && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailValueNotes}>{userScheme.notes}</Text>
                        </View>
                      )}
                    </View>
                  )}
                  <View style={styles.trackingActions}>
                    <TouchableOpacity
                      style={styles.editDetailsBtn}
                      onPress={() => setEditMode(true)}
                    >
                      <Text style={styles.editDetailsBtnText}>Edit details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
                      <Trash2 size={16} color={colors.error} strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          ) : (
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => handleTrack('interested')}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <CheckCircle2 size={18} color="#fff" strokeWidth={2.2} />
                  <Text style={styles.trackBtnText}>Add to my benefits</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
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
  emptyText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 15,
    color: colors.neutral[500],
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 56,
    paddingBottom: 12,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 16,
    color: colors.neutral[900],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: 22,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCatWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCat: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    color: '#fff',
  },
  heroTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    color: '#fff',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroDesc: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 21,
  },
  benefitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    padding: 14,
  },
  benefitItemBody: {
    flex: 1,
  },
  benefitLabel: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
  },
  benefitValue: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    color: '#fff',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    color: colors.neutral[900],
  },
  sectionText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  listWrap: {
    marginTop: 10,
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  listText: {
    flex: 1,
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 19,
  },
  trackingCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  trackingTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    color: colors.neutral[900],
  },
  trackingSub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
    marginBottom: 16,
  },
  statusSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  statusChipInactive: {
    backgroundColor: colors.neutral[50],
  },
  statusChipText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  trackBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary[600],
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trackBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    color: '#fff',
  },
  editForm: {
    marginTop: 4,
  },
  fieldLabel: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 12,
    marginBottom: 6,
  },
  fieldInput: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 14,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 72,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    color: '#fff',
  },
  detailsBox: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: 12,
    color: colors.neutral[500],
  },
  detailValue: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    color: colors.neutral[800],
    flex: 1,
  },
  detailValueNotes: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.neutral[600],
    flex: 1,
    lineHeight: 19,
  },
  applyBtn: {
    flexDirection: 'row',
    backgroundColor: colors.accent[600],
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    shadowColor: colors.accent[600],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    color: '#fff',
  },
  trackingActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  editDetailsBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
  },
  editDetailsBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    color: colors.primary[700],
  },
  removeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
