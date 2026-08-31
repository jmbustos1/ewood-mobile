import { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, ScrollView, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { GradientBackground } from '../../src/presentation/components/GradientBackground'
import { Colors, Typography, Spacing, Radius } from '../../constants'
import { useAuthStore } from '../../src/presentation/stores/authStore'

const TERMS_URL = 'https://api.exwood.dev/terms'
const PRIVACY_URL = 'https://api.exwood.dev/privacy'
// Version actual de los documentos legales. Se persiste en la DB junto al
// consentimiento del usuario. Cuando la abogada apruebe el texto final,
// subir a "2.0" y forzar re-aceptacion al proximo login.
const TERMS_VERSION = '1.0'
const PRIVACY_VERSION = '1.0'

export default function RegisterScreen() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [rut, setRut] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const isReady =
    rut.trim().length > 0 &&
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6 &&
    accepted

  async function handleContinue() {
    clearError()
    // TODO: backend aún no acepta `rut`. Cuando lo soporte, pasarlo en register().
    await register({
      name: name.trim(),
      email: email.trim(),
      password,
      acceptedTermsVersion: TERMS_VERSION,
      acceptedPrivacyVersion: PRIVACY_VERSION,
    })
  }

  return (
    <GradientBackground variant="subtle">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Regístrate</Text>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.input}
              value={rut}
              onChangeText={setRut}
              placeholder="Tu RUT (sin puntos)"
              placeholderTextColor={Colors.white[30]}
              autoCapitalize="none"
              selectionColor={Colors.green[500]}
            />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu Nombre"
              placeholderTextColor={Colors.white[30]}
              autoCapitalize="words"
              selectionColor={Colors.green[500]}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electrónico"
              placeholderTextColor={Colors.white[30]}
              keyboardType="email-address"
              autoCapitalize="none"
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

            <View style={styles.termsRow}>
              <TouchableOpacity onPress={() => setAccepted(a => !a)}>
                <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
                  {accepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Acepto los{' '}
                <Text style={styles.termsLink} onPress={() => Linking.openURL(TERMS_URL)}>
                  Términos y Condiciones
                </Text>
                {' '}y la{' '}
                <Text style={styles.termsLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
                  Política de Privacidad
                </Text>
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.btn, isReady && styles.btnActive]}
            onPress={handleContinue}
            disabled={!isReady || isLoading}
          >
            <Text style={[styles.btnText, isReady && styles.btnTextActive]}>
              {isLoading ? 'Creando cuenta...' : 'Continuar'}
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

  scroll: { gap: Spacing.md, paddingBottom: Spacing.lg },
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

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.xs },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: Colors.white[30],
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: { backgroundColor: Colors.green[500], borderColor: Colors.green[500] },
  checkmark: { fontSize: 12, color: Colors.bg.primary, fontWeight: Typography.weight.bold },
  termsText: { flex: 1, fontSize: Typography.size.sm, color: Colors.white[60], lineHeight: 20 },
  termsLink: { color: Colors.green[400], fontWeight: Typography.weight.bold },

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
