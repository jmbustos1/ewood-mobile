import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { Icon } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing } from '../../constants'

const PRIVACY_URL = 'https://api.exwood.dev/privacy'
const TERMS_URL = 'https://api.exwood.dev/terms'

export default function AboutScreen() {
  const router = useRouter()
  const appVersion = Constants.expoConfig?.version ?? '1.0.0'

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Icon name="left" size={18} color={Colors.white[60]} />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Acerca</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(TERMS_URL)}>
          <Text style={styles.rowLabel}>Términos y Condiciones</Text>
          <Icon name="right" size={20} color={Colors.white[60]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(PRIVACY_URL)}>
          <Text style={styles.rowLabel}>Política de Privacidad</Text>
          <Icon name="right" size={20} color={Colors.white[60]} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Versión {appVersion}</Text>
          <Text style={styles.legalText}>© {new Date().getFullYear()} Exwood SpA</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary, paddingTop: 56, paddingHorizontal: Spacing.lg, gap: Spacing.md },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100], marginBottom: Spacing.md },

  scroll: { paddingBottom: 60 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLabel: { fontSize: Typography.size.md, color: Colors.white[100] },

  footer: { marginTop: 'auto', alignItems: 'center', gap: 4, paddingTop: 80 },
  versionText: { fontSize: Typography.size.xs, color: Colors.white[60] },
  legalText: { fontSize: Typography.size.xs, color: Colors.white[30] },
})
