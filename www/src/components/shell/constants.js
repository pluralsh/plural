export const CLOUDS = ['AWS', 'GCP']

export const SECTION_GIT = 'git'
export const SECTION_CLOUD = 'cloud'
export const SECTION_WORKSPACE = 'workspace'
export const SECTION_FINISH = 'finish'
export const SECTION_INSTALL_CLI = 'cli'
export const SECTION_FINISH_CLI = 'finish-cli'

export const SECTIONS = {
  [SECTION_GIT]: {
    stepIndex: 0,
    previous: null,
    next: SECTION_CLOUD,
  },
  [SECTION_CLOUD]: {
    stepIndex: 1,
    previous: SECTION_GIT,
    next: SECTION_WORKSPACE,
  },
  [SECTION_WORKSPACE]: {
    stepIndex: 2,
    previous: SECTION_CLOUD,
    next: SECTION_FINISH,
  },
  [SECTION_FINISH]: {
    stepIndex: 3,
    previous: SECTION_WORKSPACE,
    next: null,
  },
  [SECTION_INSTALL_CLI]: {
    stepIndex: 1,
    previous: SECTION_CLOUD,
    next: SECTION_FINISH_CLI,
  },
  [SECTION_FINISH_CLI]: {
    stepIndex: 2,
    previous: SECTION_INSTALL_CLI,
    next: null,
  },
}
