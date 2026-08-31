import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/stores/authStore'
import { Icon, type IconName } from '../../src/presentation/components/Icon'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants'

interface MenuRowProps {
  icon: IconName
  label: string
  onPress?: () => void
  danger?: boolean
}

function MenuRow({ icon, label, onPress, danger }: MenuRowProps) {
  const color = danger ? Colors.red[500] : Colors.white[100]
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <Icon name={icon} size={22} color={color} />
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {!danger && <Icon name="right" size={20} color={Colors.white[60]} />}
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  async function handleDelete() {
    setDeleting(true)
    try {
      // TODO: backend endpoint pendiente — DELETE /auth/me
      await new Promise(r => setTimeout(r, 600))
      setShowDeleteModal(false)
      await logout()
      router.replace('/(auth)/login')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Perfil</Text>

        <TouchableOpacity style={[styles.userCard, Shadow.card]} onPress={() => router.push('/(app)/edit-profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Tu cuenta'}</Text>
            <Text style={styles.editLabel}>Editar Perfil</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.menu}>
          <MenuRow
            icon="scooter-line"
            label="Conectar Scooter"
            onPress={() => Alert.alert('Próximamente', 'El flow de conectar scooter manual está en desarrollo.')}
          />
          <MenuRow icon="credit-card" label="Saldo" onPress={() => router.push('/(app)/wallet')} />
          <MenuRow icon="key" label="Cambiar Contraseña" onPress={() => router.push('/(app)/change-password')} />
          <MenuRow
            icon="chat-dots"
            label="Ayuda"
            onPress={() => Alert.alert('Soporte', 'Escribinos a contacto@exwood.cl y te respondemos a la brevedad.')}
          />
          <MenuRow icon="info" label="Acerca" onPress={() => router.push('/(app)/about')} />
          <MenuRow icon="user-x" label="Eliminar Cuenta" danger onPress={() => setShowDeleteModal(true)} />
        </View>

        <TouchableOpacity style={styles.logoutRow} onPress={logout}>
          <Icon name="logout" size={20} color={Colors.white[60]} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadow.card]}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconCircleText}>!</Text>
            </View>
            <Text style={styles.modalTitle}>¿Eliminar tu cuenta?</Text>
            <Text style={styles.modalBody}>
              Se eliminarán todos tus datos y no podrás recuperarlos.
            </Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
              <Text style={styles.deleteBtnText}>
                {deleting ? 'Eliminando...' : 'Eliminar Cuenta'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: 120, gap: Spacing.lg },

  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: Colors.white[100] },

  userCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: 24,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.green[900],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: Typography.weight.bold, color: Colors.green[500] },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  editLabel: { fontSize: Typography.size.sm, color: Colors.white[60] },

  menu: { gap: 0 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
  },
  menuLabel: { flex: 1, fontSize: Typography.size.md, color: Colors.white[100] },
  menuLabelDanger: { color: Colors.red[500] },

  logoutRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginTop: Spacing.md,
  },
  logoutText: { fontSize: Typography.size.md, color: Colors.white[60] },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', paddingHorizontal: Spacing.md },
  modalCard: {
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
  deleteBtn: {
    width: '100%',
    backgroundColor: Colors.red[500],
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  deleteBtnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },
  cancelBtn: {
    width: '100%',
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.white[100] },
})
