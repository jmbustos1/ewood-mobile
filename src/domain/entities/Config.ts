export interface Pricing {
  pricePerMinuteClp: number
  taxRate: number
  currency: string
}

export interface AppInfo {
  minSupportedVersion: string
}

export interface Config {
  pricing: Pricing
  app: AppInfo
}
