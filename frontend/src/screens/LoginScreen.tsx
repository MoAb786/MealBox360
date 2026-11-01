import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { CurvedHeaderBackground } from '../components/CurvedHeaderBackground';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('demo@mealbox360.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser({ email: email.trim(), password });
      await login(res.access_token);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Forest Curved Top Section */}
        <View style={styles.topCurvedSection}>
          <CurvedHeaderBackground height={210} curveRadius={32}>
            <View style={styles.headerArea}>
              <View style={styles.brandIconBubble}>
                <Text style={styles.brandIcon}>🥫</Text>
              </View>
              <Text style={styles.title}>MealBox360</Text>
              <Text style={styles.subtitle}>Smart Pantry & Personalized Meals</Text>
            </View>
          </CurvedHeaderBackground>
        </View>

        {/* Card Form */}
        <View style={styles.formContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. demo@mealbox360.com"
              placeholderTextColor={colors.subtext}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.subtext}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.forest} />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.demoHint}>
              <Text style={styles.hintTitle}>💡 Seeded Demo Credentials</Text>
              <Text style={styles.hintText}>Email: demo@mealbox360.com</Text>
              <Text style={styles.hintText}>Password: demo1234</Text>
            </View>

            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                Don't have an account? <Text style={styles.switchLink}>Create One</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  topCurvedSection: {
    marginBottom: -24,
  },
  headerArea: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: spacing.lg,
  },
  brandIconBubble: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  brandIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  formContainer: {
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    marginBottom: spacing.md,
    backgroundColor: colors.bg,
    color: colors.textPrimary,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,            // pill CTA
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
    shadowColor: 'rgba(74,107,58,0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  demoHint: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(74,107,58,0.06)',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(74,107,58,0.12)',
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  switchBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
