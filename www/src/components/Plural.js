import { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { StripeProvider } from 'react-stripe-elements'

import ApplicationLayout from './layout/ApplicationLayout'
import BreadcrumbProvider from './Breadcrumbs'
import Chart from './repos/Chart'
import EditUser from './users/EditUser'
import Invoices from './payments/Invoices'
import Marketplace from './marketplace/Marketplace'
import MyPublisher from './publisher/MyPublisher'
import Publisher from './publisher/Publisher'
import Publishers from './publisher/Publishers'
import Repository from './repository/Repository'
import RepositoryArtifacts from './repository/RepositoryArtifacts'
import RepositoryDeployments from './repository/RepositoryDeployments'
import RepositoryDescription from './repository/RepositoryDescription'
import RepositoryEdit from './repository/RepositoryEdit'
import RepositoryPackages from './repository/RepositoryPackages'
import RepositoryPackagesDocker from './repository/RepositoryPackagesDocker'
import RepositoryPackagesHelm from './repository/RepositoryPackagesHelm'
import RepositoryPackagesTerraform from './repository/RepositoryPackagesTerraform'
import RepositoryTests from './repository/RepositoryTests'
import Terraform from './repos/Terraform'
import { Audits } from './accounts/Audits'
import { Billing } from './users/Billing'
import { CloudShell, OAuthCallback } from './shell/CloudShell'
import { CurrentUserContext, PluralConfigurationContext, PluralProvider } from './login/CurrentUser'
import { DeviceLoginNotif } from './users/DeviceLoginNotif'
import { Docker, DockerRepository } from './repos/Docker'
import { EditAccount } from './accounts/EditAccount'
import { IntegrationPage } from './repos/Integrations'
import { OauthCreator } from './integrations/OauthCreator'
import { UpgradeQueue } from './upgrades/UpgradeQueue'
import { UpgradeQueues } from './upgrades/UpgradeQueues'
import { VerifyEmailConfirmed } from './users/EmailConfirmation'

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
    <WrapStripe>
      <BreadcrumbProvider>
        <ApplicationLayout>
          <VerifyEmailConfirmed />
          <DeviceLoginNotif />
          <Routes>
            {/* --- OAUTH --- */}
            <Route
              path="/oauth/callback/github/shell"
              element={<OAuthCallback />}
            />
            <Route
              path="/oauth/accept/:service"
              element={<OauthCreator />}
            />
            {/* --- APPLICATIONS --- */}
            <Route
              path="/marketplace"
              element={<Marketplace />}
            />
            <Route
              path="/installed"
              element={<Marketplace installed />}
            />
            {/* --- REPOSITORIES --- */}
            <Route
              path="/repositories/:id/integrations"
              element={<IntegrationPage />}
            />
            {/* --- REPOSITORY --- */}
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
            {/* --- CHARTS --- */}
            <Route
              path="/charts/:chartId"
              element={<Chart />}
            />
            <Route
              path="/terraform/:tfId"
              element={<Terraform />}
            />
            {/* --- DOCKER --- */}
            <Route
              path="/dkr/repo/:id"
              element={<DockerRepository />}
            />
            <Route
              path="/dkr/img/:id"
              element={<Docker />}
            />
            {/* --- SHELL --- */}
            <Route
              path="/shell"
              element={<CloudShell />}
            />
            {/* --- ACCOUNT --- */}
            <Route
              path="/account/edit/:section/*"
              element={<EditAccount />}
            />
            <Route
              exact
              path="/account"
              element={(
                <Navigate
                  replace
                  to="/account/edit/users"
                />
              )}
            />
            <Route
              exact
              path="/account/edit"
              element={(
                <Navigate
                  replace
                  to="/account/edit/users"
                />
              )}
            />
            <Route
              path="/account/billing/:section"
              element={<EditBilling />}
            />
            {/* --- PUBLISHER --- */}
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
            {/* --- USER --- */}
            <Route
              exact
              path="/user/edit"
              element={<Navigate to="/user/edit/user" />}
            />
            <Route
              path="/user/edit/:editing"
              element={<EditUser />}
            />
            <Route
              path="/billing/:section"
              element={<Billing />}
            />
            <Route
              path="/user/invoices/:subscriptionId"
              element={<Invoices />}
            />
            {/* --- AUDITS --- */}
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
            {/* --- UPGRADES --- */}
            <Route
              path="/upgrades/:id"
              element={<UpgradeQueue />}
            />
            <Route
              path="/upgrades"
              element={<UpgradeQueues />}
            />
            {/* --- 404 --- */}
            <Route
              path="/*"
              element={(
                <Navigate
                  replace
                  to={me.hasInstallations ? '/installed' : '/marketplace'}
                />
              )}
            />
          </Routes>
        </ApplicationLayout>
      </BreadcrumbProvider>
    </WrapStripe>
  )
}

export default function Plural() {
  return (
    <PluralProvider>
      <PluralInner />
    </PluralProvider>
  )
}
