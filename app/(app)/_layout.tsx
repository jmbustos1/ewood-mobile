import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon, type IconName } from '../../src/presentation/components/Icon'
import { Colors, Spacing } from '../../constants'

// Para pantallas secundarias: sin tab en la nav, y sin tab bar visible
// (evita que la nav flotante tape los botones inferiores).
const hiddenTab = { href: null, tabBarStyle: { display: 'none' as const } }

function TabIcon({ icon, focused }: { icon: IconName; focused: boolean }) {
  return (
    <View style={styles.tab}>
      <Icon
        name={icon}
        size={26}
        color={focused ? Colors.green[500] : Colors.white[60]}
      />
    </View>
  )
}

export default function AppLayout() {
  const insets = useSafeAreaInsets()
  // Separar la nav flotante de la barra del sistema Android
  // (gesture bar o botones de navegacion). Minimo 16, o el inset + 12 si es mas.
  const bottomOffset = Math.max(insets.bottom + 12, 16)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { bottom: bottomOffset }],
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabItem,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="house-nav" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="map-nav" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="user-nav" focused={focused} />,
        }}
      />
      <Tabs.Screen name="history" options={hiddenTab} />
      <Tabs.Screen name="summary" options={hiddenTab} />
      <Tabs.Screen name="payment-result" options={hiddenTab} />
      <Tabs.Screen name="payment-methods" options={hiddenTab} />
      <Tabs.Screen name="add-card" options={hiddenTab} />
      <Tabs.Screen name="wallet/index" options={hiddenTab} />
      <Tabs.Screen name="wallet/recharge" options={hiddenTab} />
      <Tabs.Screen name="about" options={hiddenTab} />
      <Tabs.Screen name="edit-profile" options={hiddenTab} />
      <Tabs.Screen name="change-password" options={hiddenTab} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    // `bottom` se setea dinamicamente en el component con useSafeAreaInsets
    left: Spacing.lg,
    right: Spacing.lg,
    height: 64,
    borderTopWidth: 0,
    borderRadius: 32,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    backgroundColor: 'transparent',
  },
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.92)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Colors.white[10],
  },
  // paddingTop:0 y padding vertical 0 hacen que el icono se centre verticalmente
  // en el alto de 64 del tabBar. Sin esto React Navigation aplica un paddingTop
  // por defecto que hace que el icono quede pegado a la parte superior.
  tabItem: {
    paddingTop: 0,
    paddingBottom: 0,
    height: '100%',
    justifyContent: 'center',
  },
  tab: { alignItems: 'center', justifyContent: 'center' },
})
