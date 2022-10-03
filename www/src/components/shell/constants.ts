export const CLOUDS = ['AWS', 'GCP']
export const MAX_SELECTED_APPLICATIONS = 5

export const SECTION_APPLICATIONS = 'applications'
export const SECTION_GIT = 'git'
export const SECTION_REPOSITORY = 'repository'
export const SECTION_SELECT = 'select'
export const SECTION_CREDENTIALS = 'credentials'
export const SECTION_WORKSPACE = 'workspace'
export const SECTION_BUILD = 'build'
export const SECTION_SYNOPSIS = 'synopsis'
export const SECTION_LAUNCH = 'launch'
export const SECTION_CLI_INSTALLATION = 'cli-installation'
export const SECTION_CLI_COMPLETION = 'cli-completion'

export const SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY = 'onboarding-selected-applications'
export const PROVIDER_LOCAL_STORAGE_KEY = 'onboarding-provider'
export const STACK_LOCAL_STORAGE_KEY = 'onboarding-stack'
export const CONSOLE_LOCAL_STORAGE_KEY = 'onboarding-console'
export const TERMINAL_ONBOARDING_SIDEBAR_LOCAL_STORAGE_KEY = 'onboarding-terminal-sidebar'
export const GIT_DATA_LOCAL_STORAGE_KEY = 'onboarding-git-data'
export const WORKSPACE_LOCAL_STORAGE_KEY = 'onboarding-workspace'
export const CREDENTIALS_LOCAL_STORAGE_KEY = 'onboarding-credentials'
export const DEMO_ID_LOCAL_STORAGE_KEY = 'onboarding-demo-id'

export const SECTION_TO_STEP_INDEX = {
  [SECTION_APPLICATIONS]: 0,
  [SECTION_GIT]: 1,
  [SECTION_REPOSITORY]: 1,
  [SECTION_SELECT]: 2,
  [SECTION_BUILD]: 3,
  [SECTION_CREDENTIALS]: 3,
  [SECTION_WORKSPACE]: 3,
  [SECTION_SYNOPSIS]: 4,
  [SECTION_LAUNCH]: 4,
  [SECTION_CLI_INSTALLATION]: 1,
  [SECTION_CLI_COMPLETION]: 2,
}

export const SECTION_TO_PREVIOUS_SECTION = {
  [SECTION_GIT]: SECTION_APPLICATIONS,
  [SECTION_REPOSITORY]: SECTION_GIT,
  [SECTION_SELECT]: SECTION_REPOSITORY,
  [SECTION_BUILD]: SECTION_SELECT,
  [SECTION_CREDENTIALS]: SECTION_SELECT,
  [SECTION_WORKSPACE]: SECTION_CREDENTIALS, // TODO
  [SECTION_SYNOPSIS]: SECTION_WORKSPACE,
  [SECTION_LAUNCH]: SECTION_SYNOPSIS,
  [SECTION_CLI_INSTALLATION]: SECTION_SELECT,
  [SECTION_CLI_COMPLETION]: SECTION_CLI_INSTALLATION,

}

export const SECTION_TO_NEXT_SECTION = {
  [SECTION_APPLICATIONS]: SECTION_GIT,
  [SECTION_GIT]: SECTION_REPOSITORY,
  [SECTION_SELECT]: (nextPath: string, byocShell: string) => {
    if (nextPath === 'byoc') {
      if (byocShell === 'cli') {
        return SECTION_CLI_INSTALLATION
      }

      return SECTION_CREDENTIALS
    }

    return SECTION_BUILD
  },
  [SECTION_CREDENTIALS]: SECTION_WORKSPACE,
  [SECTION_BUILD]: SECTION_WORKSPACE,
  [SECTION_WORKSPACE]: SECTION_SYNOPSIS,
  [SECTION_SYNOPSIS]: SECTION_LAUNCH,
  [SECTION_CLI_INSTALLATION]: SECTION_CLI_COMPLETION,
}

export const SECTION_TO_URL = {
  [SECTION_APPLICATIONS]: 'applications',
  [SECTION_GIT]: 'git',
  [SECTION_REPOSITORY]: 'repository',
  [SECTION_SELECT]: 'select',
  [SECTION_BUILD]: 'build',
  [SECTION_CREDENTIALS]: 'credentials',
  [SECTION_WORKSPACE]: 'workspace',
  [SECTION_SYNOPSIS]: 'synopsis',
  [SECTION_LAUNCH]: 'launch',
  [SECTION_CLI_INSTALLATION]: 'cli-installation',
  [SECTION_CLI_COMPLETION]: 'cli-completion',
}
