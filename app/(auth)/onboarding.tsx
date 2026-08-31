import { useRef, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Modal, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { GradientBackground } from '../../src/presentation/components/GradientBackground'
import { Icon } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius } from '../../constants'

const { width } = Dimensions.get('window')

const LOGO = require('../../assets/logo-exwood.png')

const SLIDES = [
  {
    id: '1',
    icon: '🛴',
    title: 'Explora la ciudad\nen scooter',
    subtitle: 'Encuentra un scooter cerca, desbloquéalo desde la app y muévete por la ciudad.',
  },
  {
    id: '2',
    icon: '🛴',
    title: 'Tu scooter, siempre\nbajo control',
    subtitle: 'Enciéndelo, bloquéalo, revisa su ubicación y sigue tus métricas de uso e impacto.',
  },
]

type SheetVariant = 'sign-in' | 'sign-up'

export default function OnboardingScreen() {
  const router = useRouter()
  const listRef = useRef<FlatList>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [sheet, setSheet] = useState<SheetVariant | null>(null)

  function onScroll(e: any) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  function handleSSO(provider: 'google' | 'apple') {
    Alert.alert(
      'Próximamente',
      `El inicio con ${provider === 'google' ? 'Google' : 'Apple'} estará disponible pronto.`,
    )
  }

  function handleEmail() {
    const target = sheet === 'sign-up' ? '/(auth)/register' : '/(auth)/login'
    setSheet(null)
    router.push(target)
  }

  return (
    <GradientBackground variant="main">
      <View style={styles.container}>
        <View style={styles.logoRow}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Text style={styles.slideIcon}>{item.icon}</Text>
            </View>
          )}
        />

        <View style={styles.bottom}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{SLIDES[activeIndex].title}</Text>
            <Text style={styles.subtitle}>{SLIDES[activeIndex].subtitle}</Text>
          </View>

          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setSheet('sign-in')}>
              <Text style={styles.btnPrimaryText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setSheet('sign-up')}>
              <Text style={styles.btnSecondaryText}>Registrarme</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <TouchableOpacity activeOpacity={1} style={styles.sheetOverlay} onPress={() => setSheet(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{sheet === 'sign-up' ? 'Regístrate' : 'Inicia Sesión'}</Text>
              <TouchableOpacity style={styles.sheetClose} onPress={() => setSheet(null)}>
                <Text style={styles.sheetCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sheetBtnLight} onPress={() => handleSSO('google')}>
              <Icon name="google" size={18} />
              <Text style={styles.sheetBtnLightText}>
                {sheet === 'sign-up' ? 'Regístrate con Google' : 'Continúa con Google'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetBtnLight} onPress={() => handleSSO('apple')}>
              <Icon name="apple" size={16} />
              <Text style={styles.sheetBtnLightText}>
                {sheet === 'sign-up' ? 'Regístrate con Apple' : 'Continúa con Apple'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetBtnDark} onPress={handleEmail}>
              <Icon name="mail" size={18} color={Colors.white[100]} />
              <Text style={styles.sheetBtnDarkText}>
                {sheet === 'sign-up' ? 'Regístrate con Correo Electrónico' : 'Continúa con Correo Electrónico'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  logoRow: { alignItems: 'center', paddingTop: 72, paddingBottom: Spacing.xl },
  logo: { width: 140, height: 36 },

  slide: { width, alignItems: 'center', justifyContent: 'center', flex: 1 },
  slideIcon: { fontSize: 80 },

  bottom: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.lg },

  textBlock: { gap: Spacing.sm },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white[100],
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitle: { fontSize: Typography.size.sm, color: Colors.white[60], lineHeight: 22, textAlign: 'center' },

  dots: { flexDirection: 'row', gap: Spacing.sm, alignSelf: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white[30] },
  dotActive: { width: 24, backgroundColor: Colors.white[100] },

  buttons: { gap: Spacing.sm },
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

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 48,
    gap: Spacing.md,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sheetTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  sheetClose: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetCloseText: { fontSize: 14, color: Colors.white[60] },

  sheetBtnLight: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white[100],
    borderRadius: Radius.pill,
    paddingVertical: 16,
  },
  sheetBtnLightText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.bg.primary },

  sheetBtnDark: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.pill,
    paddingVertical: 16,
  },
  sheetBtnDarkText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },
})
