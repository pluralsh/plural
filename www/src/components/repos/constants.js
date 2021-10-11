export const DEFAULT_CHART_ICON = process.env.PUBLIC_URL + '/chart.png'
export const DEFAULT_TF_ICON    = process.env.PUBLIC_URL + '/terraform.png'
export const DEFAULT_DKR_ICON   = process.env.PUBLIC_URL + '/docker.png'
export const DEFAULT_GCP_ICON   = process.env.PUBLIC_URL + '/gcp.png'
export const DEFAULT_AZURE_ICON = process.env.PUBLIC_URL + '/azure.png'
export const DEFAULT_AWS_ICON   = process.env.PUBLIC_URL + '/aws.png'
export const DARK_AWS_ICON      = process.env.PUBLIC_URL + '/aws-icon.png'

export const DKR_DNS = 'dkr.plural.sh'

export const ProviderIcons = {
  GCP: DEFAULT_GCP_ICON,
  AWS: DEFAULT_AWS_ICON,
  AZURE: DEFAULT_AZURE_ICON,
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
  STORAGE: 'STORAGE'
}

export const Tools = {
  HELM: 'HELM',
  TERRAFORM: 'TERRAFORM'
}

export const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
  NONE: 'NONE'
}

export const AttackVector = {
  PHYSICAL: 'PHYSICAL',
  LOCAL: 'LOCAL',
  ADJACENT: 'ADJACENT',
  NETWORK: 'NETWORK'
}

export const ColorMap = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
  NONE: 'good',
  A: 'good',
  B: 'low',
  C: 'medium',
  D: 'high',
  F: 'critical',
  PHYSICAL: 'low',
  LOCAL: 'medium',
  ADJACENT: 'high',
  NETWORK: 'critical'
}