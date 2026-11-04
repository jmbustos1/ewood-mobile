import type { Config } from '../entities'

export interface ConfigRepository {
  getConfig(): Promise<Config>
}
