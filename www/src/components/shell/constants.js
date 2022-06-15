// START <<Remove this after dev>>
export const DEBUG_SCM_TOKENS = {
  GITLAB: '',
  GITHUB: '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',
}
// END <<Remove this after dev>>

export const CLOUDS = ['AWS', 'GCP']

export const SECTION_GIT = 'git'
export const SECTION_CLOUD = 'cloud'
export const SECTION_WORKSPACE = 'workspace'
export const SECTION_FINISH = 'finish'
export const SECTION_INSTALL_CLI = 'cli'

export const SECTIONS = {
  [SECTION_GIT]: {
    next: SECTION_CLOUD,
    previous: null,
    stepIndex: 0,
  },
  [SECTION_CLOUD]: {
    next: SECTION_WORKSPACE,
    previous: SECTION_GIT,
    stepIndex: 1,
  },
  [SECTION_WORKSPACE]: {
    next: SECTION_FINISH,
    previous: SECTION_CLOUD,
    stepIndex: 2,
  },
  [SECTION_FINISH]: {
    next: null,
    previous: SECTION_WORKSPACE,
    stepIndex: 3,
  },
  [SECTION_INSTALL_CLI]: {
    next: null,
    previous: SECTION_CLOUD,
    stepIndex: 1,
  },
}
