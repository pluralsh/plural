import { useContext } from 'react'
import { Navigate, Route, Routes, useMatch } from 'react-router-dom'
import { StripeProvider } from 'react-stripe-elements'

import ApplicationLayout from './layout/ApplicationLayout'
import BreadcrumbProvider from './Breadcrumbs'
import Chart from './repos/Chart'
import CloudShell from './shell/CloudShell'
import EditUser from './users/EditUser'
import Marketplace from './marketplace/Marketplace'
import OAuthCallback from './shell/OAuthCallback'
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
import { AccessTokens } from './profile/AccessTokens'
import { Account } from './account/Account'
import { AccountAttributes } from './account/AccountAttributes'
import { Clusters } from './clusters/Clusters'
import { CurrentUserContext, PluralConfigurationContext, PluralProvider } from './login/CurrentUser'
import { DeviceLoginNotif } from './users/DeviceLoginNotif'
import { Docker, DockerRepository } from './repos/Docker'
import { Domains } from './account/Domains'
import { EabCredentials } from './profile/EabCredentials'
import { EditAccount } from './accounts/EditAccount'
import { Groups } from './account/Groups'
import { IntegrationPage } from './repos/Integrations'
import { Me } from './profile/Me'
import { MyProfile } from './profile/MyProfile'
import { OIDCProvider } from './repository/OIDCProvider'
import { OauthCreator } from './integrations/OauthCreator'
import { PublicKeys } from './profile/PublicKeys'
import { Roles } from './account/Roles'
import { Security } from './profile/Security'
import { ServiceAccounts } from './account/ServiceAccounts'
import { UpgradeQueue } from './clusters/UpgradeQueue'
import { UpgradeQueues } from './clusters/UpgradeQueues'
import { Users } from './account/Users'
import { VerifyEmailConfirmed } from './users/EmailConfirmation'
import { AuditDirectory } from './audits/AuditDirectory'
import { Audits } from './audits/Audits'
import { LoginAudits } from './audits/LoginAudits'
import { AuditChloropleth } from './audits/AuditChloropleth'

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

// Weird judo to get around inability to match oauth callback
// routes as subroutes passed from App.js.
// If anyone knows a better way around this, I'm all ears.
// - Klink
function OAuthOrFallback() {
  const me = useContext(CurrentUserContext)
  const shellOAuthMatch = useMatch('/oauth/callback/:provider/shell')

  if (shellOAuthMatch) {
    return <OAuthCallback provider={shellOAuthMatch.params.provider} />
  }

  return (
    <Navigate
      shellOAuthMatch={shellOAuthMatch}
      replace
      to={me.hasInstallations ? '/installed' : '/marketplace'}
    />
  )
}

export function PluralInner() {
  return (
    <WrapStripe>
      <BreadcrumbProvider>
        <ApplicationLayout>
          <VerifyEmailConfirmed />
          <DeviceLoginNotif />
          <Routes>
            {/* --- OAUTH --- */}
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
            {/* --- PROFILE --- */}
            <Route
              path="/profile"
              element={<MyProfile />}
            >
              <Route
                index
                element={(
                  <Navigate
                    replace
                    to="me"
                  />
                )}
              />
              <Route
                path="me"
                element={<Me />}
              />
              <Route
                path="security"
                element={<Security />}
              />
              <Route
                path="tokens"
                element={<AccessTokens />}
              />
              <Route
                path="keys"
                element={<PublicKeys />}
              />
              <Route
                path="eab"
                element={<EabCredentials />}
              />
            </Route>
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
                path="oidc"
                element={<OIDCProvider />}
              />
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
              element={<Account />}
            >
              <Route
                index
                element={(
                  <Navigate
                    replace
                    to="users"
                  />
                )}
              />
              <Route
                path="edit"
                element={<AccountAttributes />}
              />
              <Route
                path="users"
                element={<Users />}
              />
              <Route
                path="groups"
                element={<Groups />}
              />
              <Route
                path="service-accounts"
                element={<ServiceAccounts />}
              />
              <Route
                path="roles"
                element={<Roles />}
              />
              <Route
                path="domains"
                element={<Domains />}
              />
            </Route>
            <Route
              path="/account/billing/:section"
              element={<EditBilling />}
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
              path="/audits"
              element={<AuditDirectory />}
            >
              <Route
                index
                element={(
                  <Navigate
                    replace
                    to="logs"
                  />
                )}
              />
              <Route
                path="logs"
                element={<Audits />}
              />
              <Route
                path="logins"
                element={<LoginAudits />}
              />
              <Route
                path="geo"
                element={<AuditChloropleth />}
              />
            </Route>
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
            <Route
              path="/clusters"
              element={<Clusters />}
            />
            {/* --- 404 --- */}
            <Route
              path="/*"
              element={(
                <OAuthOrFallback />
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
