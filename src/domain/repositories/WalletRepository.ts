import type { Wallet } from '../entities'

export interface WalletRepository {
  getWallet(): Promise<Wallet>
  recharge(amount: number): Promise<Wallet>
}
