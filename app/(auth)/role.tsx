import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { GradientBackground } from '../../src/presentation/components/GradientBackground'
import { Colors, Typography, Spacing, Radius } from '../../constants'
import { useAuthStore } from '../../src/presentation/stores/authStore'

export default function RoleScreen() {
  const router = useRouter()
  const { user, completeOnboarding } = useAuthStore()

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario'

  function handleRent() {
    completeOnboarding()
    router.replace('/(app)/')
  }

  function handleControl() {
    completeOnboarding()
    router.replace('/(app)/')
  }

  return (
    <GradientBackground variant="main">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.greeting}>¡Bienvenido/a {firstName}! 👋</Text>
          <Text style={styles.title}>¿Cómo quieres usar{'\n'}la app?</Text>
          <Text style={styles.subtitle}>¿Quieres arrendar un scooter o controlar el tuyo? Puedes usar la app para ambas cosas cuando quieras.</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleRent}>
              <Text style={styles.btnPrimaryText}>Quiero Arrendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={handleControl}>
              <Text style={styles.btnSecondaryText}>Quiero Controlar mi Scooter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  greeting: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white[100],
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitle: { fontSize: Typography.size.sm, color: Colors.white[60], textAlign: 'center', lineHeight: 22 },

  buttons: { gap: Spacing.sm, marginTop: Spacing.md },
  btnPrimary: {
    backgroundColor: Colors.green[500],
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnPrimaryText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.bg.primary },
  btnSecondary: {
    backgroundColor: Colors.white[10],
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnSecondaryText: { fontSize: Typography.size.md, fontWeight: Typography.weight.medium, color: Colors.white[100] },
})
