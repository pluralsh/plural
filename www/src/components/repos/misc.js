import React from 'react'
import { DarkProviderIcons, DEFAULT_CHART_ICON, ProviderIcons } from './constants'

export function Provider({dark, provider, width}) {
  let url = ProviderIcons[provider] || DEFAULT_CHART_ICON
  if (dark && DarkProviderIcons[provider]) {
    url = DarkProviderIcons[provider]
  }

  return <img alt={provider} height={`${width}px`} src={url} />
}

export function dockerPull(registry, {tag, dockerRepository: {name, repository}}) {
  return `${registry}/${repository.name}/${name}:${tag}`
}