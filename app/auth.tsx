import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/auth';
import { colors, typography, radius } from '@/lib/theme';

export default function AuthScreen() {
  const { signIn, signUp, session, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setSubmitting(true);
    const result =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, fullName.trim());
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={40}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={colors.gradient.tricolour}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.logoCircle}>
            <Shield size={40} color="#fff" strokeWidth={2} />
          </View>
          <Text style={styles.title}>WelfareConnect</Text>
          <Text style={styles.subtitle}>
            Track your government welfare scheme benefits in one place
          </Text>
          <View style={styles.pill}>
            <Sparkles size={13} color={colors.primary[700]} strokeWidth={2.2} />
            <Text style={styles.pillText}>15+ schemes available</Text>
          </View>
          <View style={styles.tricolourStrip}>
            <View style={styles.tricolourSaffron} />
            <View style={styles.tricolourWhite} />
            <View style={styles.tricolourGreen} />
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'signin' && styles.tabActive]}
              onPress={() => {
                setMode('signin');
                setError(null);
              }}
            >
              <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => {
                setMode('signup');
                setError(null);
              }}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <View style={styles.inputWrap}>
              <User size={18} color={colors.primary[500]} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                placeholderTextColor={colors.neutral[400]}
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Mail size={18} color={colors.primary[500]} strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>

          <View style={styles.inputWrap}>
            <Lock size={18} color={colors.primary[500]} strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.neutral[400]}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
                <ArrowRight size={18} color="#fff" strokeWidth={2.2} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Your data is private and only visible to you.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  heroBanner: {
    alignItems: 'center',
    borderRadius: radius.xl,
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 30,
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.full,
  },
  pillText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    color: '#fff',
  },
  tricolourStrip: {
    flexDirection: 'row',
    width: '100%',
    height: 6,
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
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tricolourGreen: {
    flex: 1,
    backgroundColor: colors.tricolour.green,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    padding: 22,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.neutral[0],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    color: colors.neutral[500],
  },
  tabTextActive: {
    color: colors.primary[700],
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamilyRegular,
    fontSize: 15,
    color: colors.neutral[900],
    paddingVertical: 12,
    marginLeft: 10,
  },
  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 13,
    color: colors.error,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary[600],
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    color: '#fff',
  },
  footerNote: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 20,
  },
});
