import { useContext, useMemo } from 'react'
import { Box } from 'grommet'
import { Navigate, Route, Routes } from 'react-router-dom'
import { StripeProvider } from 'react-stripe-elements'

import { CurrentUserContext, PluralConfigurationContext, PluralProvider } from './login/CurrentUser'
import MyPublisher from './publisher/MyPublisher'
import Publisher from './publisher/Publisher'
import Toolbar, { TOOLBAR_SIZE } from './Toolbar'
import Chart from './repos/Chart'
import Terraform from './repos/Terraform'
import EditUser from './users/EditUser'
import { IntegrationPage } from './repos/Integrations'
import Invoices from './payments/Invoices'
import Sidebar from './layout/Sidebar'
import Publishers from './publisher/Publishers'
import Explore from './explore/Explore'
import Repository from './repository/Repository'
import RepositoryDescription from './repository/RepositoryDescription'
import RepositoryPackages from './repository/RepositoryPackages'
import RepositoryPackagesHelm from './repository/RepositoryPackagesHelm'
import RepositoryPackagesTerraform from './repository/RepositoryPackagesTerraform'
import RepositoryPackagesDocker from './repository/RepositoryPackagesDocker'
import RepositoryTests from './repository/RepositoryTests'
import RepositoryDeployments from './repository/RepositoryDeployments'
import RepositoryArtifacts from './repository/RepositoryArtifacts'
import RepositoryEdit from './repository/RepositoryEdit'
import { Billing } from './users/Billing'
import BreadcrumbProvider from './Breadcrumbs'
import { EditAccount } from './accounts/EditAccount'
import { Incidents } from './incidents/Incidents'
import { Incident } from './incidents/Incident'
import { IncidentContext } from './incidents/context'
import { Integrations } from './integrations/Webhooks'
import { Webhook } from './integrations/Webhook'
import { OauthCreator } from './integrations/OauthCreator'
import { FlyoutContainer } from './utils/Flyout'
import { Docker, DockerRepository } from './repos/Docker'
import { Audits } from './accounts/Audits'
import { UpgradeQueues } from './upgrades/UpgradeQueues'
import { UpgradeQueue } from './upgrades/UpgradeQueue'
import { IncidentDirectory } from './IncidentDirectory'
import { VerifyEmailConfirmed } from './users/EmailConfirmation'
// import { AutoRefresh } from './login/AutoRefresh'
import { NavigationContext } from './navigation/Submenu'
import { DeviceLoginNotif } from './users/DeviceLoginNotif'
import { CloudShell, OAuthCallback } from './shell/CloudShell'

function EditIncident(props) {
  return (
    <Incident
      {...props}
      editing
    />
  )
}

function EditBilling(props) {
  return (
    <EditAccount
      {...props}
      billing
    />
  )
}

function WrapStripe({ children }) {
  const { stripePublishableKey } = useContext(PluralConfigurationContext)

  if (!stripePublishableKey) return children

  return (
    <StripeProvider apiKey={stripePublishableKey}>
      {children}
    </StripeProvider>
  )
}

export function PluralInner() {
  // const { id } = useParams()
  const me = useContext(CurrentUserContext)

  return (
    <NavigationContext>
      <IncidentContext.Provider value={useMemo(() => ({}), [])}>
        <WrapStripe>
          <BreadcrumbProvider>
            <VerifyEmailConfirmed />
            {/* <AutoRefresh /> */}
            <DeviceLoginNotif />
            <Toolbar />
            <Box
              direction="row"
              background="background"
              style={{ height: `calc(100vh - ${TOOLBAR_SIZE}px)` }}
            >
              <Sidebar />
              <Box fill>
                <Box
                  fill
                >
                  <Routes>
                    <Route
                      path="/shell"
                      component={<CloudShell />}
                    />
                    <Route
                      path="/accounts/edit/:section/*"
                      element={<EditAccount />}
                    />
                    <Route
                      exact
                      path="/accounts/edit"
                      element={(
                        <Navigate
                          replace
                          to="/accounts/edit/users"
                        />
                      )}
                    />
                    <Route
                      path="/accounts/billing/:section"
                      element={<EditBilling />}
                    />
                    <Route
                      path="/publishers/mine/:editing"
                      element={<MyPublisher />}
                    />
                    <Route
                      path="/publishers/:id/:editing"
                      element={<MyPublisher />}
                    />
                    <Route
                      path="/publishers/:publisherId"
                      element={<Publisher />}
                    />
                    <Route
                      path="/publishers"
                      element={<Publishers />}
                    />
                    <Route
                      path="/dkr/repo/:id"
                      element={<DockerRepository />}
                    />
                    <Route
                      path="/dkr/img/:id"
                      element={<Docker />}
                    />
                    <Route
                      path="/shell"
                      element={<CloudShell />}
                    />
                    <Route
                      path="/oauth/callback/github/shell"
                      element={<OAuthCallback />}
                    />
                    <Route
                      path="/repositories/:id/integrations"
                      element={<IntegrationPage />}
                    />
                    <Route
                      path="/repository/:id"
                      element={<Repository />}
                    >
                      <Route
                        index
                        element={<RepositoryDescription />}
                      />
                      <Route
                        path="packages"
                        element={<RepositoryPackages />}
                      >
                        <Route
                          index
                          element={(
                            <Navigate
                              replace
                              to="helm"
                            />
                          )}
                        />
                        <Route
                          path="helm"
                          element={<RepositoryPackagesHelm />}
                        />
                        <Route
                          path="terraform"
                          element={<RepositoryPackagesTerraform />}
                        />
                        <Route
                          path="docker"
                          element={<RepositoryPackagesDocker />}
                        />
                      </Route>
                      <Route
                        path="tests"
                        element={<RepositoryTests />}
                      />
                      <Route
                        path="deployments"
                        element={<RepositoryDeployments />}
                      />
                      <Route
                        path="artifacts"
                        element={<RepositoryArtifacts />}
                      />
                      <Route
                        path="edit"
                        element={<RepositoryEdit />}
                      />
                    </Route>
                    <Route
                      path="/charts/:chartId"
                      element={<Chart />}
                    />
                    <Route
                      path="/terraform/:tfId"
                      element={<Terraform />}
                    />
                    <Route
                      exact
                      path="/me/edit"
                      element={<Navigate to="/me/edit/user" />}
                    />
                    <Route
                      path="/me/edit/:editing"
                      element={<EditUser />}
                    />
                    <Route
                      path="/billing/:section"
                      element={<Billing />}
                    />
                    <Route
                      path="/me/invoices/:subscriptionId"
                      element={<Invoices />}
                    />
                    <Route
                      path="/incidents/:group"
                      element={<IncidentDirectory />}
                    />
                    <Route
                      exact
                      path="/incidents"
                      element={(
                        <Navigate
                          replace
                          to="/incidents/all"
                        />
                      )}
                    />
                    <Route
                      path="/incident/:incidentId/edit"
                      element={<EditIncident />}
                    />
                    <Route
                      path="/incident/:incidentId"
                      element={<Incident />}
                    />
                    <Route
                      path="/incidents"
                      element={<Incidents />}
                    />
                    <Route
                      path="/webhooks/:id"
                      element={<Webhook />}
                    />
                    <Route
                      path="/webhooks"
                      element={<Integrations />}
                    />
                    <Route
                      path="/oauth/accept/:service"
                      element={<OauthCreator />}
                    />
                    <Route
                      path="/audits/:graph"
                      element={<Audits />}
                    />
                    <Route
                      exact
                      path="/audits"
                      element={(
                        <Navigate
                          replace
                          to="/audits/table"
                        />
                      )}
                    />
                    <Route
                      path="/upgrades/:id"
                      element={<UpgradeQueue />}
                    />
                    <Route
                      path="/upgrades"
                      element={<UpgradeQueues />}
                    />
                    <Route
                      path="/explore"
                      element={<Explore />}
                    />
                    <Route
                      path="/installed"
                      element={<Explore installed />}
                    />
                    <Route
                      path="/*"
                      element={(
                        <Navigate
                          replace
                          to={me.hasInstallations ? '/installed' : '/explore'}
                        />
                      )}
                    />
                  </Routes>
                </Box>
              </Box>
              <FlyoutContainer />
            </Box>
          </BreadcrumbProvider>
        </WrapStripe>
      </IncidentContext.Provider>
    </NavigationContext>
  )
}

export default function Plural() {
  return (
    <PluralProvider>
      <PluralInner />
    </PluralProvider>
  )
}
