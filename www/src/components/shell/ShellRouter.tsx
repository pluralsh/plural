import { Navigate, Outlet, Route } from 'react-router'

import {
  SECTION_APPLICATIONS,
  SECTION_BUILD,
  SECTION_CLI_COMPLETION,
  SECTION_CLI_INSTALLATION,
  SECTION_CREDENTIALS,
  SECTION_GIT,
  SECTION_LAUNCH,
  SECTION_REPOSITORY,
  SECTION_SELECT,
  SECTION_SYNOPSIS,
  SECTION_WORKSPACE,
} from './constants'

import TerminalIndex from './terminal/TerminalIndex'
import OnboardingRoot from './onboarding/OnboardingRoot'
import OnboardingOAuthCallback from './onboarding/OnboardingOAuthCallback'

import OnboardingApplications from './onboarding/steps/OnboardingApplications'
import OnboardingGit from './onboarding/steps/OnboardingGit'
import OnboardingRepository from './onboarding/steps/OnboardingRepository'
import OnboardingSelect from './onboarding/steps/OnboardingSelect'
import OnboardingBuild from './onboarding/steps/OnboardingBuild'
import OnboardingCredentials from './onboarding/steps/OnboardingCredentials'
import OnboardingWorkspace from './onboarding/steps/OnboardingWorkspace'
import OnboardingSynopsis from './onboarding/steps/OnboardingSynopsis'
import OnboardingLaunch from './onboarding/steps/OnboardingLaunch'

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

function ShellRouter() {
  return (
    <>
      <Route
        path="shell"
        element={<Outlet />}
      >
        <Route
          index
          element={<TerminalIndex />}
        />
        <Route
          path="onboarding"
          element={<OnboardingRoot />}
        >
          <Route
            index
            element={<Navigate to={`/shell/onboarding/${SECTION_TO_URL[SECTION_APPLICATIONS]}`} />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_APPLICATIONS]}
            element={<OnboardingApplications />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_GIT]}
            element={<OnboardingGit />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_REPOSITORY]}
            element={<OnboardingRepository />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_SELECT]}
            element={<OnboardingSelect />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_BUILD]}
            element={<OnboardingBuild />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_CREDENTIALS]}
            element={<OnboardingCredentials />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_WORKSPACE]}
            element={<OnboardingWorkspace />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_SYNOPSIS]}
            element={<OnboardingSynopsis />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_LAUNCH]}
            element={<OnboardingLaunch />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_CLI_INSTALLATION]}
            element={<OnboardingCliInstallation />}
          />
          <Route
            path={SECTION_TO_URL[SECTION_CLI_COMPLETION]}
            element={<OnboardingCliComplete />}
          />
        </Route>
      </Route>
      <Route
        path="/oauth/callback/:provider/shell"
        element={<OnboardingOAuthCallback />}
      />
    </>
  )
}

export default ShellRouter
