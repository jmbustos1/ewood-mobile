import { create } from 'zustand'
import type { Wallet } from '../../domain/entities'
import { WalletRepositoryImpl, type RechargeStartResponse } from '../../data/repositories/WalletRepositoryImpl'

const repo = new WalletRepositoryImpl()

interface WalletState {
  balance: number
  canRent: boolean
  transactions: Wallet['transactions']
  isLoading: boolean
  isRecharging: boolean
  error: string | null

  loadWallet: () => Promise<void>
  /** Inicia el flujo de recarga: retorna la URL de checkout MP para abrir en WebView. */
  startRecharge: (amount: number) => Promise<RechargeStartResponse>
  clearError: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  canRent: true,
  transactions: [],
  isLoading: false,
  isRecharging: false,
  error: null,

  loadWallet: async () => {
    set({ isLoading: true, error: null })
    try {
      const wallet = await repo.getWallet()
      set({
        balance: wallet.balance,
        canRent: wallet.canRent,
        transactions: wallet.transactions,
      })
    } catch (e: any) {
      set({ error: e?.response?.data?.error ?? 'Error al cargar saldo' })
    } finally {
      set({ isLoading: false })
    }
  },

  startRecharge: async (amount) => {
    set({ isRecharging: true, error: null })
    try {
      return await repo.startRecharge(amount)
    } catch (e: any) {
      set({ error: e?.response?.data?.error ?? 'Error al iniciar recarga' })
      throw e
    } finally {
      set({ isRecharging: false })
    }
  },

  clearError: () => set({ error: null }),
}))
