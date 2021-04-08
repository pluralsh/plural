import React from 'react'
import { DEFAULT_CHART_ICON, ProviderIcons } from './constants'

export function Provider({provider, width}) {
  const url = ProviderIcons[provider] || DEFAULT_CHART_ICON
  return <img alt={provider} width={`${width}px`} height={`${width}px`} src={url} />
}