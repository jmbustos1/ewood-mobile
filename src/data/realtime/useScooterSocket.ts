import { useEffect, useRef, useState, useCallback } from 'react'
import { Config } from '../../../constants'
import { tokenStorage } from '../storage/tokenStorage'

/** Mensajes que el backend broadcastea por /ws/scooters */
export interface ScooterUpdate {
  type: 'location_update' | 'scooter_status' | 'command_ack' | 'error' | 'message_sent' | string
  scooter_id: number
  data?: {
    id?: number
    code?: string
    latitude?: number
    longitude?: number
    battery_level?: number
    status?: string
    // Estado físico del actuador reportado por el firmware (SYS STATUS).
    lock_state?: 'locked' | 'unlocked' | 'unknown'
    timestamp?: string
  }
  // location_update también puede mandar lat/lng en la raíz
  latitude?: number
  longitude?: number
}

interface UseScooterSocketOptions {
  /** Filtrar por scooter — sólo dispara onMessage si scooter_id == este */
  scooterId?: number
  onMessage?: (msg: ScooterUpdate) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

/**
 * Conecta al WebSocket /ws/scooters del backend con auth JWT.
 * Reconecta automáticamente con backoff. Si scooterId está definido,
 * sólo invoca onMessage para mensajes de ese scooter.
 */
export function useScooterSocket(options: UseScooterSocketOptions = {}) {
  const {
    scooterId,
    onMessage,
    reconnectInterval = 3000,
    maxReconnectAttempts = 8,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<ScooterUpdate | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isConnectingRef = useRef(false)
  const onMessageRef = useRef(onMessage)
  const scooterIdRef = useRef(scooterId)

  // Mantener refs actualizadas sin reconectar
  useEffect(() => {
    onMessageRef.current = onMessage
    scooterIdRef.current = scooterId
  }, [onMessage, scooterId])

  const connect = useCallback(async () => {
    if (isConnectingRef.current) return
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    const token = await tokenStorage.getAccessToken()
    if (!token) {
      // Sin token no se puede conectar; reintentamos cuando se vuelva a montar
      return
    }

    const baseWs = Config.WS_URL.replace(/^http/, 'ws')
    const url = `${baseWs}/ws/scooters?token=${encodeURIComponent(token)}`

    isConnectingRef.current = true
    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        isConnectingRef.current = false
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const msg: ScooterUpdate = JSON.parse(event.data as string)
          setLastMessage(msg)
          // Filtro por scooter si está definido
          const sid = scooterIdRef.current
          if (sid == null || msg.scooter_id === sid) {
            onMessageRef.current?.(msg)
          }
        } catch {
          // mensaje no-JSON, ignorar
        }
      }

      ws.onerror = () => {
        isConnectingRef.current = false
      }

      ws.onclose = (event) => {
        isConnectingRef.current = false
        setIsConnected(false)
        wsRef.current = null

        // Reconectar si no fue cierre limpio y no superamos intentos
        const wasClean = (event as CloseEvent).wasClean === true || event.code === 1000
        if (!wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          // Backoff lineal (suficiente para uso normal)
          const delay = reconnectInterval * Math.min(reconnectAttemptsRef.current, 5)
          reconnectTimeoutRef.current = setTimeout(() => { connect() }, delay)
        }
      }
    } catch {
      isConnectingRef.current = false
    }
  }, [reconnectInterval, maxReconnectAttempts])

  useEffect(() => {
    let mounted = true
    const t = setTimeout(() => { if (mounted) connect() }, 50)
    return () => {
      mounted = false
      clearTimeout(t)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting')
        wsRef.current = null
      }
      isConnectingRef.current = false
    }
  }, [connect])

  const sendMessage = useCallback((message: object | string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof message === 'string' ? message : JSON.stringify(message))
    }
  }, [])

  return { isConnected, lastMessage, sendMessage, reconnect: connect }
}
