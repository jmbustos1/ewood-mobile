import { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/stores/authStore'
import { GradientBackground } from '../../src/presentation/components/GradientBackground'
import { Colors, Typography, Spacing, Radius } from '../../constants'

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isReady = email.trim().length > 0 && password.length > 0

  async function handleLogin() {
    clearError()
    await login({ email: email.trim(), password })
  }

  return (
    <GradientBackground variant="subtle">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Iniciar Sesión</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electrónico"
              placeholderTextColor={Colors.white[30]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              selectionColor={Colors.green[500]}
            />

            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor={Colors.white[30]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                selectionColor={Colors.green[500]}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.btn, isReady && styles.btnActive]}
            onPress={handleLogin}
            disabled={!isReady || isLoading}
          >
            <Text style={[styles.btnText, isReady && styles.btnTextActive]}>
              {isLoading ? 'Ingresando...' : 'Inicias Sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: Spacing.lg, paddingTop: 60, paddingBottom: 48 },

  backRow: { marginBottom: Spacing.xl },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },

  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100], marginBottom: Spacing.xl },

  form: { gap: Spacing.md },
  input: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.md,
    color: Colors.white[100],
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
  },
  passwordInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.md,
    color: Colors.white[100],
  },
  eyeBtn: { paddingHorizontal: Spacing.md, paddingVertical: 14 },
  eyeText: { fontSize: 18 },

  error: { fontSize: Typography.size.sm, color: Colors.red[500] },
  forgotText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.green[400], textAlign: 'right' },

  spacer: { flex: 1 },

  btn: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: Colors.green[500] },
  btnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[30] },
  btnTextActive: { color: Colors.bg.primary },
})
