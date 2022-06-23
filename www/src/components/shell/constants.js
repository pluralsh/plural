export const CLOUDS = ['AWS', 'GCP']

export const SECTION_GIT_PROVIDER = 'git-provider'
export const SECTION_CLOUD_SELECT = 'cloud-select'
export const SECTION_CLOUD_CREDENTIALS = 'cloud-credentials'
export const SECTION_CLOUD_WORKSPACE = 'cloud-workspace'
export const SECTION_DEMO_BUILD = 'demo-build'
export const SECTION_CLI_INSTALLATION = 'cli-installation'
export const SECTION_CLI_COMPLETION = 'cli-completion'
export const SECTION_SYNOPSIS = 'synopsis'

export const SECTIONS = {
  [SECTION_GIT_PROVIDER]: {
    stepIndex: 0,
    previous: null,
    next: SECTION_CLOUD_SELECT,
  },
  [SECTION_CLOUD_SELECT]: {
    stepIndex: 1,
    previous: SECTION_GIT_PROVIDER,
    next: null, // Next will be decided by the user, using setSection directly
  },
  [SECTION_DEMO_BUILD]: {
    stepIndex: 1,
    previous: SECTION_CLOUD_SELECT,
    next: SECTION_CLOUD_WORKSPACE,
  },
  [SECTION_CLOUD_CREDENTIALS]: {
    stepIndex: 2,
    previous: SECTION_CLOUD_SELECT,
    next: SECTION_CLOUD_WORKSPACE,
  },
  [SECTION_CLOUD_WORKSPACE]: {
    stepIndex: 2,
    previous: SECTION_CLOUD_SELECT,
    next: SECTION_SYNOPSIS,
  },
  [SECTION_SYNOPSIS]: {
    stepIndex: 3,
    previous: SECTION_CLOUD_WORKSPACE,
    next: null,
  },
  [SECTION_CLI_INSTALLATION]: {
    stepIndex: 1,
    previous: SECTION_CLOUD_SELECT,
    next: SECTION_CLI_COMPLETION,
  },
  [SECTION_CLI_COMPLETION]: {
    stepIndex: 2,
    previous: SECTION_CLI_INSTALLATION,
    next: null,
  },
}
