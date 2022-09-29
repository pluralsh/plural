import { Navigate, Outlet, Route } from 'react-router'

import TerminalIndex from './terminal/TerminalIndex'
import OnboardingRoot from './onboarding/OnboardingRoot'

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
