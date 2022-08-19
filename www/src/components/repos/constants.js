export const DEFAULT_CHART_ICON = `${process.env.PUBLIC_URL}/chart.png`
export const DEFAULT_TF_ICON = `${process.env.PUBLIC_URL}/terraform.png`
export const DEFAULT_DKR_ICON = `${process.env.PUBLIC_URL}/docker.png`
export const DEFAULT_GCP_ICON = `${process.env.PUBLIC_URL}/gcp.png`
export const DEFAULT_AZURE_ICON = `${process.env.PUBLIC_URL}/azure.png`
export const DEFAULT_AWS_ICON = `${process.env.PUBLIC_URL}/aws.png`
export const DEFAULT_EQUINIX_ICON = `${process.env.PUBLIC_URL}/equinix-metal.png`
export const DEFAULT_KIND_ICON = `${process.env.PUBLIC_URL}/kind.png`
export const DARK_AWS_ICON = `${process.env.PUBLIC_URL}/aws-icon.png`

export const ProviderIcons = {
  GCP: DEFAULT_GCP_ICON,
  AWS: DEFAULT_AWS_ICON,
  AZURE: DEFAULT_AZURE_ICON,
  EQUINIX: DEFAULT_EQUINIX_ICON,
  KIND: DEFAULT_KIND_ICON,
}

export const DarkProviderIcons = {
  AWS: DARK_AWS_ICON,
}

export const Categories = {
  DEVOPS: 'DEVOPS',
  DATABASE: 'DATABASE',
  MESSAGING: 'MESSAGING',
  SECURITY: 'SECURITY',
  DATA: 'DATA',
  PRODUCTIVITY: 'PRODUCTIVITY',
  NETWORK: 'NETWORK',
  STORAGE: 'STORAGE',
}

export const Tools = {
  HELM: 'HELM',
  TERRAFORM: 'TERRAFORM',
}

export const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
  NONE: 'NONE',
}

export const AttackVector = {
  PHYSICAL: 'PHYSICAL',
  LOCAL: 'LOCAL',
  ADJACENT: 'ADJACENT',
  NETWORK: 'NETWORK',
}
