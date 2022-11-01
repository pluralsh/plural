import { ThemeContext } from 'grommet'
import { useContext } from 'react'

import { DEFAULT_CHART_ICON, DarkProviderIcons, ProviderIcons } from './constants'

export function Provider({ provider, width }: any) {
  const { dark } = useContext(ThemeContext) as any
  const url = providerToURL(provider, dark)

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
