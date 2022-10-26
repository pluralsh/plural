import {
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useMatch,
} from 'react-router-dom'
import { StripeProvider } from 'react-stripe-elements'
import { Toast } from 'pluralsh-design-system'
import { useFeature } from '@growthbook/growthbook-react'

import { growthbook } from '../helpers/growthbook'
import { useHistory } from '../router'

import PluralConfigurationContext from '../contexts/PluralConfigurationContext'
import CurrentUserContext from '../contexts/CurrentUserContext'

import ApplicationLayout from './layout/ApplicationLayout'
import BreadcrumbProvider from './Breadcrumbs'
import Chart from './repos/Chart'
import CloudShell from './shell/CloudShell'
import ImagePullMetrics from './repos/common/ImagePullMetrics'
import ImageVulnerabilities from './repos/common/ImageVulnerabilities'
import Marketplace from './marketplace/Marketplace'
import OAuthCallback from './shell/OAuthCallback'
import PackageConfiguration from './repos/common/PackageConfiguration'
import PackageDependencies from './repos/common/PackageDependencies'
import PackageReadme from './repos/common/PackageReadme'
import PackageSecurity from './repos/common/PackageSecurity'
import PackageUpdateQueue from './repos/common/PackageUpdateQueue'
import Publisher from './publisher/Publisher'
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
import Stack from './stack/Stack'
import StackApps from './stack/StackApps'
import Terraform from './repos/Terraform'
import { AccessTokens } from './profile/AccessTokens'
import { Account } from './account/Account'
import { AccountAttributes } from './account/AccountAttributes'
import { AuditChloropleth } from './audits/AuditChloropleth'
import { AuditDirectory } from './audits/AuditDirectory'
import { Audits } from './audits/Audits'
import { ChecklistProvider, OnboardingChecklist } from './shell/onboarding/checklist/Checklist'
import { Clusters } from './clusters/Clusters'
import { PluralProvider } from './login/CurrentUser'
import { DeviceLoginNotif } from './users/DeviceLoginNotif'
import { Docker, DockerRepository } from './repos/Docker'
import { Domains } from './account/Domains'
import { EabCredentials } from './profile/EabCredentials'
import { EditAccount } from './users/EditAccount'
import { Groups } from './account/Groups'
import { IntegrationPage } from './repos/Integrations'
import { LoginAudits } from './audits/LoginAudits'
import { MyProfile } from './profile/MyProfile'
import { OIDCProvider } from './repository/OIDCProvider'
import { OauthCreator } from './integrations/OauthCreator'
import { Profile } from './profile/Profile'
import { PublicKeys } from './profile/PublicKeys'
import { Roles } from './account/Roles'
import { Security } from './profile/Security'
import { ServiceAccounts } from './account/ServiceAccounts'
import { UpgradeQueue } from './clusters/UpgradeQueue'
import { UpgradeQueues } from './clusters/UpgradeQueues'
import { Users } from './account/Users'
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

// Weird judo to get around inability to match oauth callback
// routes as subroutes passed from App.js.
// If anyone knows a better way around this, I'm all ears.
// - Klink
function OAuthOrFallback() {
  const me = useContext(CurrentUserContext)
  const history = useHistory()
  const shellOAuthMatch = useMatch('/oauth/callback/:provider/shell')

  if (shellOAuthMatch) {
    return <OAuthCallback provider={shellOAuthMatch.params.provider} />
  }

  return (
    <Navigate
      // @ts-expect-error
      shellOAuthMatch={shellOAuthMatch}
      replace
      to={history.pop(me.hasInstallations ? '/installed' : '/marketplace')}
    />
  )
}

function TestBanner() {
  const [enable, setEnable] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setEnable(false), 5000)

    return () => clearTimeout(timeout)
  }, [])

  if (growthbook.isOn('growthbook-test') && enable) {
    return (
      <Toast
        severity="success"
        marginBottom="medium"
        marginRight="xxxxlarge"
      >Growthbook Test!
      </Toast>
    )
  }

  return null
}

export function PluralInner() {
  const isChecklistEnabled = useFeature('checklist').on

  return (
    <WrapStripe>
      <BreadcrumbProvider>
        <ChecklistProvider>
          <ApplicationLayout>
            <VerifyEmailConfirmed />
            <DeviceLoginNotif />
            <TestBanner />
            {isChecklistEnabled && (
              <OnboardingChecklist />
            )}
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
                  element={<Profile />}
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
              {/* --- STACK --- */}
              <Route
                path="/stack/:name"
                element={<Stack />}
              >
                <Route
                  index
                  element={<StackApps />}
                />
              </Route>
              {/* --- HELM CHARTS --- */}
              <Route
                path="/charts/:chartId"
                element={<Chart />}
              >
                <Route
                  index
                  element={<PackageReadme />}
                />
                <Route
                  path="configuration"
                  element={<PackageConfiguration />}
                />
                <Route
                  path="dependencies"
                  element={<PackageDependencies />}
                />
                <Route
                  path="security"
                  element={<PackageSecurity />}
                />
                <Route
                  path="updatequeue"
                  element={<PackageUpdateQueue />}
                />
              </Route>
              {/* --- TERRAFORM CHARTS --- */}
              <Route
                path="/terraform/:tfId"
                element={<Terraform />}
              >
                <Route
                  index
                  element={<PackageReadme />}
                />
                <Route
                  path="configuration"
                  element={<PackageConfiguration />}
                />
                <Route
                  path="dependencies"
                  element={<PackageDependencies />}
                />
                <Route
                  path="security"
                  element={<PackageSecurity />}
                />
                <Route
                  path="updatequeue"
                  element={<PackageUpdateQueue />}
                />
              </Route>
              {/* --- DOCKER --- */}
              <Route
                path="/dkr/repo/:id"
                element={<DockerRepository />}
              />
              <Route
                path="/dkr/img/:id"
                element={<Docker />}
              >
                <Route
                  index
                  element={<ImagePullMetrics />}
                />
                <Route
                  path="vulnerabilities"
                  element={<ImageVulnerabilities />}
                />
              </Route>
              {/* --- SHELL --- */}
              <Route
                path="/shell"
                element={<CloudShell />}
              />
              {/* --- ACCOUNT --- */}
              <Route
                path="/account"
                element={<Account />}
              >
                <Route
                  index
                  element={(
                    <Navigate
                      replace
                      to="edit"
                    />
                  )}
                />
                <Route
                  path="edit"
                  element={<Outlet />}
                >
                  <Route
                    index
                    element={<AccountAttributes />}
                  />
                  <Route
                    path=":section/*"
                    element={<EditAccount />}
                  />
                </Route>
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
              {/* --- PUBLISHER --- */}
              <Route
                path="/publisher/:id"
                element={<Publisher />}
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
        </ChecklistProvider>
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
