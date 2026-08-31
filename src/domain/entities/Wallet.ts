export type WalletTransactionType = 'recharge' | 'trip_charge' | 'refund' | 'adjustment'

export interface WalletTransaction {
  id: number
  userId: number
  type: WalletTransactionType
  amount: number          // positivo en recargas, negativo en cobros
  balanceAfter: number
  tripId?: number
  description?: string
  createdAt: string
}

export interface Wallet {
  balance: number
  canRent: boolean
  transactions: WalletTransaction[]
}
