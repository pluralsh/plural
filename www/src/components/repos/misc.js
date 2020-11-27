import React from 'react'
import { DEFAULT_GCP_ICON, ProviderIcons } from './constants'

export function Provider({provider, width}) {
  const url = ProviderIcons[provider]
  if (!url) return null

  return <img alt='gcp' width={`${width}px`} height={`${width}px`} src={url} />
}