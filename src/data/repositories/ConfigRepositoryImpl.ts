import type { ConfigRepository } from '../../domain/repositories'
import type { Config } from '../../domain/entities'
import { apiClient } from '../api/apiClient'

export class ConfigRepositoryImpl implements ConfigRepository {
  async getConfig(): Promise<Config> {
    const { data } = await apiClient.get('/api/config')
    return {
      pricing: {
        pricePerMinuteClp: data.pricing.price_per_minute_clp,
        taxRate: data.pricing.tax_rate,
        currency: data.pricing.currency,
      },
      app: {
        minSupportedVersion: data.app.min_supported_version,
      },
    }
  }
}
