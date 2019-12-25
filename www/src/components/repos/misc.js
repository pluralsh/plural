import React from 'react'
import { DEFAULT_GCP_ICON } from './constants'

export function Provider({provider, width}) {
  switch (provider) {
    case "GCP":
      return <img alt='gcp' width={`${width}px`} height={`${width}px`} src={DEFAULT_GCP_ICON} />
    default:
      return null
  }
}