import type { WalletRepository } from '../../domain/repositories'
import type { Wallet, WalletTransaction } from '../../domain/entities'
import { apiClient } from '../api/apiClient'

/** Respuesta de POST /api/wallet/recharge cuando hay integración MP. */
export interface RechargeStartResponse {
  checkoutUrl: string
  preferenceId: string
  externalReference: string
  amount: number
}

export class WalletRepositoryImpl implements WalletRepository {
  async getWallet(): Promise<Wallet> {
    const { data } = await apiClient.get('/api/wallet')
    return this.mapWallet(data)
  }

  /**
   * Inicia una recarga: pide al backend que cree una preference en MP y
   * retorna la URL de checkout para abrir en una WebView.
   * El saldo NO se acredita acá — eso lo hace el webhook MP cuando el pago
   * está aprobado. La app debe refrescar la wallet después de cerrar el flow.
   */
  async startRecharge(amount: number): Promise<RechargeStartResponse> {
    const { data } = await apiClient.post('/api/wallet/recharge', { amount })
    return {
      checkoutUrl: data.checkout_url,
      preferenceId: data.preference_id,
      externalReference: data.external_reference,
      amount: data.amount,
    }
  }

  // Legacy: para compatibilidad con código que aún llama recharge() directo.
  // No se usa con la integración MP — preferir startRecharge + flujo WebView.
  async recharge(_amount: number): Promise<Wallet> {
    return this.getWallet()
  }

  private mapWallet(raw: any): Wallet {
    return {
      balance: Number(raw.balance ?? 0),
      canRent: Boolean(raw.can_rent),
      transactions: (raw.transactions ?? []).map(this.mapTransaction),
    }
  }

  private mapTransaction(raw: any): WalletTransaction {
    return {
      id: raw.id,
      userId: raw.user_id,
      type: raw.type,
      amount: Number(raw.amount),
      balanceAfter: Number(raw.balance_after),
      tripId: raw.trip_id ?? undefined,
      description: raw.description ?? undefined,
      createdAt: raw.created_at,
    }
  }
}
