import { Navigate, Outlet, Route } from 'react-router'

import TerminalIndex from './terminal/TerminalIndex'
import OnboardingRoot from './onboarding/OnboardingRoot'
import OnboardingApplications from './onboarding/steps/OnboardingApplications'

export const urlPartToStepIndex = {
  applications: 0,
  git: 1,
  repository: 1,
  cloud: 2,
  workspace: 2,
  synopsis: 3,
  cli: 2,
}

export const urlPartToPreviousStep = {
  git: 'applications',
  repository: 'git',
  cloud: 'repository',
  workspace: 'cloud',
  synopsys: 'workspace',
}

export const urlPartToNextStep = {
  applications: 'git',
  git: 'repository',
  repository: 'cloud',
  cloud: 'workspace',
  workspace: 'synopsys',
}

function ShellRouter() {
  return (
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
          element={<Navigate to="/shell/onboarding/applications" />}
        />
        <Route
          path="applications"
          element={<OnboardingApplications />}
        />
        <Route
          path="git"
          element={<OnboardingGit />}
        />
        <Route
          path="repository"
          element={<OnboardingRepository />}
        />
        <Route
          path="cloud"
          element={<OnboardingCloud />}
        />
        <Route
          path="workspace"
          element={<OnboardingWorkspace />}
        />
        <Route
          path="synopsis"
          element={<OnboardingSynopsis />}
        />
        <Route
          path="cli"
          element={<OnboardingCli />}
        />
      </Route>
    </Route>
  )
}

export default ShellRouter
