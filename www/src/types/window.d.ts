import type { cookiebot } from '../utils/cookiebot'

declare global {
  interface Window {
    Cookiebot?: cookiebot
    _hsq?: any[]
  }
}
