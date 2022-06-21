export const CLOUDS = ['AWS', 'GCP']

export const SECTION_GIT_PROVIDER = 'git-provider'
export const SECTION_CLOUD_SELECT = 'cloud-select'
export const SECTION_CLOUD_WORKSPACE = 'cloud-workspace'
export const SECTION_INSTALL_CLI = 'install-cli'
export const SECTION_COMPLETE_CLI = 'complete-cli'
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
  [SECTION_INSTALL_CLI]: {
    stepIndex: 1,
    previous: SECTION_CLOUD_SELECT,
    next: SECTION_COMPLETE_CLI,
  },
  [SECTION_COMPLETE_CLI]: {
    stepIndex: 2,
    previous: SECTION_INSTALL_CLI,
    next: null,
  },
}
