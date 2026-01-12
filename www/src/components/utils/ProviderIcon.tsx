import { useTheme } from 'styled-components'
import { type styledTheme } from '@pluralsh/design-system'

import { Provider } from '../../generated/graphql'

export const CHART_ICON_DARK = '/providers/chart-icon.png'
export const CHART_ICON_LIGHT = '/providers/chart-icon.png'
export const GCP_ICON_DARK = '/providers/gcp-icon.png'
export const GCP_ICON_LIGHT = '/providers/gcp-icon.png'
export const AZURE_ICON_DARK = '/providers/azure-icon.png'
export const AZURE_ICON_LIGHT = '/providers/azure-icon.png'
export const EQUINIX_ICON_DARK = '/providers/equinix-icon.png'
export const EQUINIX_ICON_LIGHT = '/providers/equinix-icon.png'
export const KIND_ICON_DARK = '/providers/kind-icon.png'
export const KIND_ICON_LIGHT = '/providers/kind-icon.png'
export const AWS_ICON_DARK = '/providers/aws-icon-dark.png'
export const AWS_ICON_LIGHT = '/providers/aws-icon-light.png'
export const LINODE_ICON_DARK = '/providers/linode-icon.png'
export const LINODE_ICON_LIGHT = '/providers/linode-icon.png'

const ProviderNames = {
  aws: 'AWS',
  azure: 'Azure',
  equinix: 'Equinix',
  gcp: 'GCP',
  kind: 'kind',
  generic: 'Generic',
  custom: 'Custom',
  kubernetes: 'Kubernetes',
  linode: 'Linode',
} as const satisfies Record<Lowercase<Provider>, string>

export function getProviderName(provider?: string | null) {
  const p = provider?.toLowerCase()

  return p && ProviderNames[p] ? ProviderNames[p] : 'BYOK'
}

export function getProviderIconUrl(
  provider: string,
  mode: typeof styledTheme.mode
) {
  return (
    (
      {
        GCP: mode === 'light' ? GCP_ICON_LIGHT : GCP_ICON_DARK,
        AWS: mode === 'light' ? AWS_ICON_LIGHT : AWS_ICON_DARK,
        AZURE: mode === 'light' ? AZURE_ICON_LIGHT : AZURE_ICON_DARK,
        EQUINIX: mode === 'light' ? EQUINIX_ICON_LIGHT : EQUINIX_ICON_DARK,
        KIND: mode === 'light' ? KIND_ICON_LIGHT : KIND_ICON_DARK,
        GENERIC: mode === 'light' ? CHART_ICON_LIGHT : CHART_ICON_DARK,
        CUSTOM: mode === 'light' ? CHART_ICON_LIGHT : CHART_ICON_DARK,
        KUBERNETES: mode === 'light' ? CHART_ICON_LIGHT : CHART_ICON_DARK,
        LINODE: mode === 'light' ? LINODE_ICON_LIGHT : LINODE_ICON_DARK,
      } as const satisfies Record<Provider, string>
    )[provider?.toUpperCase()] ??
    (mode === 'light' ? CHART_ICON_LIGHT : CHART_ICON_DARK)
  )
}

export function ProviderIcon({
  provider,
  width = 16,
}: {
  provider: string
  width: number
}) {
  const theme = useTheme()

  return (
    <div css={{ display: 'flex', justifyContent: 'center', width }}>
      <img
        alt={getProviderName(provider) || provider}
        src={getProviderIconUrl(provider, theme.mode)}
        width={width}
      />
    </div>
  )
}
