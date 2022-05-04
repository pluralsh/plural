import { useContext, useMemo } from 'react'
import { Box } from 'grommet'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
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
import Sidebar from './Sidebar'
import Publishers from './publisher/Publishers'
import Explore from './explore/Explore'
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
import { RepoDirectory } from './repos/RepoDirectory'
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

function NavigateId({ to, replace }) {
  const { id } = useParams()

  return (
    <Navigate
      replace={replace}
      to={to.replaceAll(':id', id)}
    />
  )
}

export function PluralInner() {
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
                      exact
                      path="/repositories/:id"
                      element={(
                        <NavigateId
                          replace
                          to="/repositories/:id/bundles"
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/repositories/:id/packages"
                      element={(
                        <NavigateId
                          replace
                          to="/repositories/:id/packages/helm"
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/repositories/:id/edit"
                      element={(
                        <NavigateId
                          replace
                          to="/repositories/:id/edit/details"
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/repositories/:id/configure"
                      element={(
                        <NavigateId
                          replace
                          to="/repositories/:id/configure/upgrades"
                        />
                      )}
                    />
                    <Route
                      path="/repositories/:id/:group/:subgroup"
                      element={<RepoDirectory />}
                    />
                    <Route
                      path="/repositories/:id/:group"
                      element={<RepoDirectory />}
                    />
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
                    {/* <Route
                      path="/explore/:group/:tag"
                      element={<Explore />}
                    />
                    <Route
                      path="/explore/:group"
                      element={<Explore />}
                    /> */}
                    {/* <Route
                      exact
                      path="/"
                      element={<Navigate to={me.hasInstallations ? '/explore/installed' : '/explore/public'} />}
                    />
                    <Route
                      exact
                      path="/explore"
                      element={<Navigate to="/explore/public" />}
                    /> */}
                    <Route
                      path="/explore"
                      element={<Explore />}
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
