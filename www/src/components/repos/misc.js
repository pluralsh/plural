import React from 'react'
import { DEFAULT_CHART_ICON, DKR_DNS, ProviderIcons } from './constants'

export function Provider({provider, width}) {
  const url = ProviderIcons[provider] || DEFAULT_CHART_ICON
  return <img alt={provider} width={`${width}px`} height={`${width}px`} src={url} />
}

export function dockerPull({tag, dockerRepository: {name, repository}}) {
  return `${DKR_DNS}/${repository.name}/${name}:${tag}`
}