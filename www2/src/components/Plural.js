import { useContext, useMemo } from 'react'
import { Box, Grid } from 'grommet'
import { Navigate, Route, Routes } from 'react-router-dom'
import { StripeProvider } from 'react-stripe-elements'

import { CurrentUserContext, PluralConfigurationContext, PluralProvider } from './login/CurrentUser'
import MyPublisher from './publisher/MyPublisher'
import Publisher from './publisher/Publisher'
import Toolbar from './Toolbar'
import Chart from './repos/Chart'
import Terraform from './repos/Terraform'
import EditUser from './users/EditUser'
import { IntegrationPage } from './repos/Integrations'
import Invoices from './payments/Invoices'
import Sidebar from './Sidebar'
import Publishers from './publisher/Publishers'
import Explore from './Explore'
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

export const TOOLBAR_SIZE = '55px'

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
  const me = useContext(CurrentUserContext)

  return (
    <NavigationContext>
      <IncidentContext.Provider value={useMemo(() => ({}), [])}>
        <WrapStripe>
          <BreadcrumbProvider>
            <VerifyEmailConfirmed />
            {/* <AutoRefresh /> */}
            <DeviceLoginNotif />
            <Grid
              fill
              rows={[TOOLBAR_SIZE, 'flex']}
              columns={['100vw']}
              areas={[
                { name: 'toolbarTop', start: [0, 0], end: [0, 0] },
                { name: 'viewport', start: [0, 1], end: [0, 1] },
              ]}
            >
              <Box
                background="sidebar"
                gridArea="toolbarTop"
                align="center"
                justify="center"
              >
                <Toolbar />
              </Box>
              <Box
                style={{ height: `calc(100vh - ${TOOLBAR_SIZE})` }}
                direction="row"
                gridArea="viewport"
                background="backgroundColor"
              >
                <Sidebar />
                <Box fill>
                  <Box
                    background="white"
                    fill
                  >
                    <Routes>
                      <Route
                        path="/accounts/edit/:section"
                        component={EditAccount}
                      />
                      <Route
                        exact
                        path="/accounts/edit"
                      >
                        <Navigate to="/accounts/edit/users" />
                      </Route>
                      <Route
                        path="/accounts/billing/:section"
                        component={EditBilling}
                      />
                      <Route
                        path="/publishers/mine/:editing"
                        component={MyPublisher}
                      />
                      <Route
                        path="/publishers/:id/:editing"
                        component={MyPublisher}
                      />
                      <Route
                        path="/publishers/:publisherId"
                        component={Publisher}
                      />
                      <Route
                        path="/publishers"
                        component={Publishers}
                      />
                      <Route
                        path="/dkr/repo/:id"
                        component={DockerRepository}
                      />
                      <Route
                        path="/dkr/img/:id"
                        component={Docker}
                      />
                      <Route
                        path="/shell"
                        component={CloudShell}
                      />
                      <Route
                        path="/oauth/callback/github/shell"
                        component={OAuthCallback}
                      />
                      <Route
                        path="/repositories/:id/integrations"
                        component={IntegrationPage}
                      />
                      <Route
                        exact
                        path="/repositories/:id"
                        render={props => (
                          <Navigate to={`/repositories/${props.match.params.id}/bundles`} />
                        )}
                      />
                      <Route
                        exact
                        path="/repositories/:id/packages"
                        render={props => (
                          <Navigate to={`/repositories/${props.match.params.id}/packages/helm`} />
                        )}
                      />
                      <Route
                        exact
                        path="/repositories/:id/edit"
                        render={props => (
                          <Navigate to={`/repositories/${props.match.params.id}/edit/details`} />
                        )}
                      />
                      <Route
                        exact
                        path="/repositories/:id/configure"
                        render={props => (
                          <Navigate to={`/repositories/${props.match.params.id}/configure/upgrades`} />
                        )}
                      />
                      <Route
                        path="/repositories/:id/:group/:subgroup"
                        component={RepoDirectory}
                      />
                      <Route
                        path="/repositories/:id/:group"
                        component={RepoDirectory}
                      />
                      <Route
                        path="/charts/:chartId"
                        component={Chart}
                      />
                      <Route
                        path="/terraform/:tfId"
                        component={Terraform}
                      />
                      <Route
                        exact
                        path="/me/edit"
                      >
                        <Navigate to="/me/edit/user" />
                      </Route>
                      <Route
                        path="/me/edit/:editing"
                        component={EditUser}
                      />
                      <Route
                        path="/billing/:section"
                        component={Billing}
                      />
                      <Route
                        path="/me/invoices/:subscriptionId"
                        component={Invoices}
                      />
                      <Route
                        path="/incidents/:group"
                        component={IncidentDirectory}
                      />
                      <Route
                        exact
                        path="/incidents"
                      >
                        <Navigate to="/incidents/all" />
                      </Route>
                      <Route
                        path="/incident/:incidentId/edit"
                        component={EditIncident}
                      />
                      <Route
                        path="/incident/:incidentId"
                        component={Incident}
                      />
                      <Route
                        path="/incidents"
                        component={Incidents}
                      />
                      <Route
                        path="/webhooks/:id"
                        component={Webhook}
                      />
                      <Route
                        path="/webhooks"
                        component={Integrations}
                      />
                      <Route
                        path="/oauth/accept/:service"
                        component={OauthCreator}
                      />
                      <Route
                        path="/audits/:graph"
                        component={Audits}
                      />
                      <Route
                        exact
                        path="/audits"
                      >
                        <Navigate to="/audits/table" />
                      </Route>
                      <Route
                        path="/upgrades/:id"
                        component={UpgradeQueue}
                      />
                      <Route
                        path="/upgrades"
                        component={UpgradeQueues}
                      />
                      <Route
                        path="/explore/:group/:tag"
                        component={Explore}
                      />
                      <Route
                        path="/explore/:group"
                        component={Explore}
                      />
                      <Route path="/">
                        <Navigate to={me.hasInstallations ? '/explore/installed' : '/explore/public'} />
                      </Route>
                    </Routes>
                  </Box>
                </Box>
                <FlyoutContainer />
              </Box>
            </Grid>
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
