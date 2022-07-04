import { ThemeContext } from 'grommet'
import { useContext } from 'react'

import { DEFAULT_CHART_ICON, DarkProviderIcons, ProviderIcons } from './constants'

export function Provider({ provider, width, size }) {
  const { dark } = useContext(ThemeContext)
  let url = ProviderIcons[provider] || DEFAULT_CHART_ICON
  if (dark && DarkProviderIcons[provider]) {
    url = DarkProviderIcons[provider]
  }

  return (
    <img
      alt={provider}
      width={`${size || width}px`}
      src={url}
    />
  )
}

export function dockerPull(registry, { tag, dockerRepository: { name, repository } }) {
  return `${registry}/${repository.name}/${name}:${tag}`
}
