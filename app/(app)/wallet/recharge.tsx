import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { WebView, type WebViewNavigation } from 'react-native-webview'
import { useWalletStore } from '../../../src/presentation/stores/walletStore'
import { useConfigStore } from '../../../src/presentation/stores/configStore'
import { Icon } from '../../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../constants'

const MIN_RECHARGE = 1000
const QUICK_AMOUNTS = [5000, 10000, 15000]

// Esquema deep-link que el backend pone como back_url en la preference MP.
// Cuando MP redirige a este URL, lo detectamos y cerramos el WebView.
const RETURN_URL_SCHEME = 'ewood://wallet/recharge-result'

export default function RechargeScreen() {
  const router = useRouter()
  const { startRecharge, loadWallet, isRecharging } = useWalletStore()
  const [amountText, setAmountText] = useState('')
  const [resultModal, setResultModal] = useState<'success' | 'error' | 'pending' | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  const pricePerMinute = useConfigStore(s => s.config.pricing.pricePerMinuteClp)

  const amount = Number(amountText.replace(/\D/g, '')) || 0
  const minutes = amount / pricePerMinute
  const isValid = amount >= MIN_RECHARGE
  const showError = amount > 0 && amount < MIN_RECHARGE

  function handleQuick(value: number) {
    setAmountText(String(value))
  }

  async function handleContinue() {
    if (!isValid) return
    try {
      const { checkoutUrl: url } = await startRecharge(amount)
      if (!url) throw new Error('checkout_url missing')
      setCheckoutUrl(url)
    } catch {
      setResultModal('error')
    }
  }

  /**
   * Detecta cuando MP redirige al deep-link ewood://. La WebView no puede cargar
   * ese esquema, así que interceptamos y cerramos el flow según ?status=.
   */
  function handleNavStateChange(navState: WebViewNavigation) {
    if (!navState.url.startsWith(RETURN_URL_SCHEME)) return

    setCheckoutUrl(null)
    const params = parseStatus(navState.url)
    if (params.status === 'success' || params.status === 'approved') {
      // Refrescar wallet — el webhook MP puede tardar unos segundos en acreditar
      loadWallet()
      setResultModal('success')
    } else if (params.status === 'pending') {
      loadWallet()
      setResultModal('pending')
    } else {
      setResultModal('error')
    }
  }

  function parseStatus(url: string): { status?: string } {
    const queryIdx = url.indexOf('?')
    if (queryIdx === -1) return {}
    const pairs = url.slice(queryIdx + 1).split('&')
    const out: Record<string, string> = {}
    for (const p of pairs) {
      const [k, v] = p.split('=')
      if (k) out[k] = decodeURIComponent(v ?? '')
    }
    return out
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>

        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Saldo</Text>

        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={(t) => {
              // Solo digitos + eliminar ceros a la izquierda ("02000" -> "2000",
              // input vacio -> "" para que se muestre el placeholder).
              const cleaned = t.replace(/\D/g, '').replace(/^0+/, '')
              setAmountText(cleaned)
            }}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={Colors.white[30]}
          />
          <View style={styles.currency}>
            <Text style={styles.currencyText}>En pesos</Text>
            <Text style={styles.currencyArrow}>⌄</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <Text style={styles.helper}>
          Equivale a {minutes % 1 === 0 ? minutes.toFixed(0) : minutes.toFixed(1).replace('.', ',')} minutos de viaje.
        </Text>

        {showError && (
          <Text style={styles.errorText}>El monto mínimo de recarga es ${MIN_RECHARGE.toLocaleString('es-CL')}.</Text>
        )}

        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(v => {
            const selected = amount === v
            return (
              <TouchableOpacity
                key={v}
                style={[styles.quickPill, selected && styles.quickPillSelected]}
                onPress={() => handleQuick(v)}
              >
                <Text style={[styles.quickText, selected && styles.quickTextSelected]}>
                  ${v.toLocaleString('es-CL')}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.btn, isValid && styles.btnActive]}
          onPress={handleContinue}
          disabled={!isValid || isRecharging}
        >
          <Text style={[styles.btnText, isValid && styles.btnTextActive]}>
            {isRecharging ? 'Procesando...' : 'Continuar al Pago'}
          </Text>
        </TouchableOpacity>

        {/* Modal Success */}
        <Modal visible={resultModal === 'success'} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={[styles.modal, Shadow.card]}>
              <View style={styles.iconCircle}>
                <Icon name="check-big" size={22} color={Colors.white[100]} />
              </View>
              <Text style={styles.modalTitle}>¡Saldo recargado!</Text>
              <Text style={styles.modalBody}>Tu saldo ya está listo. Empieza a moverte cuando quieras.</Text>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => { setResultModal(null); router.replace('/(app)/map') }}
              >
                <Text style={styles.modalBtnText}>Volver al Mapa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Pending */}
        <Modal visible={resultModal === 'pending'} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={[styles.modal, Shadow.card]}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconCircleText}>⏳</Text>
              </View>
              <Text style={styles.modalTitle}>Pago pendiente</Text>
              <Text style={styles.modalBody}>
                MercadoPago está confirmando tu pago. El saldo se acreditará en unos minutos.
              </Text>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => { setResultModal(null); router.replace('/(app)/wallet') }}
              >
                <Text style={styles.modalBtnText}>Ver mi saldo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Error */}
        <Modal visible={resultModal === 'error'} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={[styles.modal, Shadow.card]}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconCircleText}>!</Text>
              </View>
              <Text style={styles.modalTitle}>¡Ups! Hubo un error al procesar tu pago</Text>
              <Text style={styles.modalBody}>No pudimos procesar tu pago. Intenta nuevamente.</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setResultModal(null); handleContinue() }}>
                <Text style={styles.modalBtnText}>Reintentar Pago</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => { setResultModal(null); router.replace('/(app)/map') }}>
                <Text style={styles.modalBtnSecondaryText}>Volver al Mapa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* WebView de MercadoPago Checkout Pro (pantalla completa) */}
        <Modal visible={checkoutUrl != null} animationType="slide" onRequestClose={() => setCheckoutUrl(null)}>
          <View style={styles.webviewContainer}>
            <View style={styles.webviewHeader}>
              <TouchableOpacity onPress={() => setCheckoutUrl(null)}>
                <Text style={styles.webviewClose}>✕  Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.webviewTitle}>Pagar con MercadoPago</Text>
              <View style={{ width: 80 }} />
            </View>
            {checkoutUrl && (
              <WebView
                source={{ uri: checkoutUrl }}
                onNavigationStateChange={handleNavStateChange}
                onShouldStartLoadWithRequest={(req) => {
                  // Bloquear deep-links propios de MP/ML que tratan de abrir
                  // sus apps nativas. Nos quedamos en el flow web.
                  if (req.url.startsWith('mercadopago://')) return false
                  if (req.url.startsWith('mercadolibre://')) return false
                  // Detectar redirect final al deep-link de nuestra app.
                  if (req.url.startsWith(RETURN_URL_SCHEME)) {
                    handleNavStateChange({ url: req.url } as WebViewNavigation)
                    return false
                  }
                  return true
                }}
                // Refuerzo del viewport por si MP sirve HTML sin meta correcto.
                // Con UA mobile (default del dispositivo) ya viene bien, pero por las dudas.
                injectedJavaScriptBeforeContentLoaded={`
                  (function() {
                    var setViewport = function() {
                      var meta = document.querySelector('meta[name="viewport"]');
                      var content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
                      if (meta) {
                        meta.setAttribute('content', content);
                      } else if (document.head) {
                        var m = document.createElement('meta');
                        m.name = 'viewport';
                        m.content = content;
                        document.head.appendChild(m);
                      }
                    };
                    setViewport();
                    document.addEventListener('DOMContentLoaded', setViewport);
                  })();
                  true;
                `}
                javaScriptEnabled
                domStorageEnabled
                // sharedCookiesEnabled deshabilitado: evita que el WebView tome
                // cookies de sesiones reales de MP guardadas en el sistema.
                // sharedCookiesEnabled={false}
                // thirdPartyCookiesEnabled sí: MP usa subdominios y los necesita
                // para mantener su propia sesión durante el checkout.
                thirdPartyCookiesEnabled
                // incognito: el WebView arranca con un cookie jar limpio cada vez.
                // Esto evita el error "Una de las partes ... es de prueba" que ocurre
                // cuando el WebView mezcla cookies de cuenta real + transacción sandbox.
                incognito
                mixedContentMode="always"
                originWhitelist={['*', 'http://*', 'https://*']}
                startInLoadingState
                // User-agent: dejamos el default del WebView (mobile) para que MP
                // sirva el HTML responsive. Los intentos de redirect a la app nativa
                // (mercadopago://, mercadolibre://) se filtran arriba en
                // onShouldStartLoadWithRequest.
                style={styles.webview}
              />
            )}
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.primary },
  container: { flex: 1, paddingTop: 60, padding: Spacing.lg, gap: Spacing.md },

  backRow: { marginBottom: Spacing.xs },
  backText: { fontSize: Typography.size.sm, color: Colors.white[60] },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100] },

  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.lg },
  amountInput: { fontSize: 32, fontWeight: Typography.weight.medium as any, color: Colors.white[100], flex: 1 },
  currency: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  currencyText: { fontSize: Typography.size.md, color: Colors.white[60] },
  currencyArrow: { fontSize: Typography.size.md, color: Colors.white[60] },
  divider: { height: 1, backgroundColor: Colors.white[10] },

  helper: { fontSize: Typography.size.sm, color: Colors.white[60], marginTop: Spacing.xs },
  errorText: { fontSize: Typography.size.sm, color: Colors.red[500] },

  quickRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  quickPill: {
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  quickPillSelected: { backgroundColor: Colors.green[500] },
  quickText: { fontSize: Typography.size.sm, color: Colors.white[100] },
  quickTextSelected: { color: Colors.bg.primary, fontWeight: Typography.weight.bold },

  spacer: { flex: 1 },

  btn: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnActive: { backgroundColor: Colors.green[500] },
  btnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[30] },
  btnTextActive: { color: Colors.bg.primary },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end', paddingHorizontal: Spacing.md, paddingBottom: 40 },
  modal: {
    backgroundColor: Colors.bg.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  iconCircleText: { fontSize: 22, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  modalTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  modalBody: { fontSize: Typography.size.sm, color: Colors.white[60], lineHeight: 22 },
  modalBtn: { width: '100%', backgroundColor: Colors.green[500], borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm },
  modalBtnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.bg.primary },
  modalBtnSecondary: { width: '100%', backgroundColor: Colors.bg.elevated, borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center' },
  modalBtnSecondaryText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },

  // WebView Checkout Pro
  webviewContainer: { flex: 1, backgroundColor: Colors.bg.primary },
  webviewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    backgroundColor: Colors.bg.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.white[10],
  },
  webviewClose: { fontSize: Typography.size.sm, color: Colors.white[60], width: 80 },
  webviewTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  webview: { flex: 1, backgroundColor: 'white' },
  webviewLoader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
})
