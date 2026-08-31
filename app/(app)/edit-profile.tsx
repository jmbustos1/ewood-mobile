import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/stores/authStore'
import { Icon } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius } from '../../constants'

export default function EditProfileScreen() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [birthDate, setBirthDate] = useState('')
  const [height, setHeight] = useState('')
  const [saving, setSaving] = useState(false)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValid = name.trim().length > 0 && isValidEmail
  const hasChanges = name !== (user?.name ?? '') || email !== (user?.email ?? '') || birthDate !== '' || height !== ''

  async function handleSave() {
    if (!isValid || !hasChanges) return
    setSaving(true)
    try {
      // TODO: backend endpoint pendiente — PUT /auth/me con { name, email, birthDate, heightCm }
      await new Promise(r => setTimeout(r, 600))
      Alert.alert(
        'Cambios guardados',
        'El endpoint del backend para actualizar el perfil aún está en desarrollo.',
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Icon name="left" size={18} color={Colors.white[60]} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Perfil</Text>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
              placeholderTextColor={Colors.white[60]}
              autoCapitalize="words"
              selectionColor={Colors.green[500]}
            />
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electrónico"
              placeholderTextColor={Colors.white[60]}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor={Colors.green[500]}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.fieldHalf]}>
              <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={Colors.white[60]}
                keyboardType="number-pad"
                selectionColor={Colors.green[500]}
              />
            </View>
            <View style={[styles.field, styles.fieldHalf]}>
              <View style={styles.heightRow}>
                <TextInput
                  style={[styles.input, styles.heightInput]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Estatura"
                  placeholderTextColor={Colors.white[60]}
                  keyboardType="number-pad"
                  selectionColor={Colors.green[500]}
                />
                <Text style={styles.heightUnit}>cm</Text>
              </View>
            </View>
          </View>

          <Text style={styles.helper}>
            Debes ser mayor de 18 años y medir al menos 1,50 m para usar los scooters.
          </Text>
        </ScrollView>

        <TouchableOpacity
          style={[styles.btn, hasChanges && isValid && styles.btnActive]}
          onPress={handleSave}
          disabled={!hasChanges || !isValid || saving}
        >
          <Text style={[styles.btnText, hasChanges && isValid && styles.btnTextActive]}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.primary },
  container: { flex: 1, paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: Spacing.md },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100], marginBottom: Spacing.md },

  scroll: { gap: Spacing.lg, paddingBottom: Spacing.xl },

  field: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.white[10],
    paddingBottom: Spacing.xs,
  },
  fieldHalf: { flex: 1 },
  row: { flexDirection: 'row', gap: Spacing.md },

  input: {
    fontSize: Typography.size.md,
    color: Colors.white[100],
    paddingVertical: Spacing.sm,
  },

  heightRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heightInput: { flex: 1 },
  heightUnit: { fontSize: Typography.size.md, color: Colors.white[60] },

  helper: { fontSize: Typography.size.xs, color: Colors.white[60], lineHeight: 18 },

  btn: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: Colors.green[500] },
  btnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[60] },
  btnTextActive: { color: Colors.bg.primary },
})
