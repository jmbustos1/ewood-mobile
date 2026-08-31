import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '../src/presentation/stores/authStore'
import { useTripStore } from '../src/presentation/stores/tripStore'
import { tokenStorage } from '../src/data/storage/tokenStorage'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const { isAuthenticated, isNewUser, loadMe } = useAuthStore()
  const { checkActiveTrip } = useTripStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    bootstrap()
  }, [])

  useEffect(() => {
    if (!ready) return

    const inAuth = segments[0] === '(auth)'
    if (!isAuthenticated && !inAuth) router.replace('/(auth)/onboarding')
    if (isAuthenticated && isNewUser) router.replace('/(auth)/role')
    else if (isAuthenticated && inAuth) router.replace('/(app)/')
  }, [isAuthenticated, isNewUser, segments, ready])

  async function bootstrap() {
    const token = await tokenStorage.getAccessToken()
    if (token) {
      await loadMe()
      const activeTrip = await checkActiveTrip()
      if (activeTrip) {
        setReady(true)
        router.replace('/(app)/map')
        return
      }
    }
    setReady(true)
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#080D09' } }} />
    </>
  )
}
