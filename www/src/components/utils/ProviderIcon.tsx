import { DEFAULT_CHART_ICON, DarkProviderIcons, ProviderIcons } from '../constants'

export function ProviderIcon({ provider, width }: any) {
  const url = providerToURL(provider, true)

  return (
    <img
      alt={provider}
      width={`${width}px`}
      src={url}
    />
  )
}

export function providerToURL(provider, dark) {
  let url = ProviderIcons[provider] || DEFAULT_CHART_ICON

  if (dark && DarkProviderIcons[provider]) {
    url = DarkProviderIcons[provider]
  }

  return url
}
