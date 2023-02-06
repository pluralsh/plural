import {
  Suspense,
  lazy,
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
import { Toast } from '@pluralsh/design-system'
import { useFeature } from '@growthbook/growthbook-react'

import { growthbook } from '../helpers/growthbook'
import { useHistory } from '../router'

import PluralConfigurationContext from '../contexts/PluralConfigurationContext'
import CurrentUserContext from '../contexts/CurrentUserContext'
import PosthogIdentiy from '../utils/posthog'

const ApplicationLayout = lazy(() => import('./layout/ApplicationLayout'))
const BreadcrumbProvider = lazy(() => import('./Breadcrumbs'))
const Chart = lazy(() => import('./repos/Chart'))
const CloudShell = lazy(() => import('./shell/Shell'))
const ImagePullMetrics = lazy(() => import('./repos/common/ImagePullMetrics'))
const ImageVulnerabilities = lazy(() => import('./repos/common/ImageVulnerabilities'))
const Marketplace = lazy(() => import('./marketplace/Marketplace'))
const OAuthCallback = lazy(() => import('./shell/OAuthCallback'))
const PackageConfiguration = lazy(() => import('./repos/common/PackageConfiguration'))
const PackageDependencies = lazy(() => import('./repos/common/PackageDependencies'))
const PackageReadme = lazy(() => import('./repos/common/PackageReadme'))
const PackageSecurity = lazy(() => import('./repos/common/PackageSecurity'))
const PackageUpdateQueue = lazy(() => import('./repos/common/PackageUpdateQueue'))
const Publisher = lazy(() => import('./publisher/Publisher'))
const Repository = lazy(() => import('./repository/Repository'))
const RepositoryArtifacts = lazy(() => import('./repository/RepositoryArtifacts'))
const RepositoryDeployments = lazy(() => import('./repository/RepositoryDeployments'))
const RepositoryDescription = lazy(() => import('./repository/RepositoryDescription'))
const RepositoryEdit = lazy(() => import('./repository/RepositoryEdit'))
const RepositoryPackages = lazy(() => import('./repository/RepositoryPackages'))
const RepositoryPackagesDocker = lazy(() => import('./repository/RepositoryPackagesDocker'))
const RepositoryPackagesHelm = lazy(() => import('./repository/RepositoryPackagesHelm'))
const RepositoryPackagesTerraform = lazy(() => import('./repository/RepositoryPackagesTerraform'))
const RepositoryTests = lazy(() => import('./repository/RepositoryTests'))
const Stack = lazy(() => import('./stack/Stack'))
const StackApps = lazy(() => import('./stack/StackApps'))
const Terraform = lazy(() => import('./repos/Terraform'))
const Roadmap = lazy(() => import('./roadmap/Roadmap'))
const RoadmapRoadmap = lazy(() => import('./roadmap/RoadmapRoadmap'))
const RoadmapChangelog = lazy(() => import('./roadmap/RoadmapChangelog'))
const RoadmapApplicationRequests = lazy(() => import('./roadmap/RoadmapApplicationRequests'))
const RoadmapFeatureRequests = lazy(() => import('./roadmap/RoadmapFeatureRequests'))
const RoadmapFeedback = lazy(() => import('./roadmap/RoadmapFeedback'))
const AccessTokens = lazy(() => import('./profile/AccessTokens').then(module => ({ default: module.AccessTokens })))
const Account = lazy(() => import('./account/Account').then(module => ({ default: module.Account })))
const AccountAttributes = lazy(() => import('./account/AccountAttributes').then(module => ({ default: module.AccountAttributes })))
const AuditChloropleth = lazy(() => import('./audits/AuditChloropleth').then(module => ({ default: module.AuditChloropleth })))
const AuditDirectory = lazy(() => import('./audits/AuditDirectory').then(module => ({ default: module.AuditDirectory })))
const Audits = lazy(() => import('./audits/Audits').then(module => ({ default: module.Audits })))
const ChecklistProvider = lazy(() => import('./shell/onboarding/checklist/Checklist').then(module => ({ default: module.ChecklistProvider })))
const OnboardingChecklist = lazy(() => import('./shell/onboarding/checklist/Checklist').then(module => ({ default: module.OnboardingChecklist })))
const Clusters = lazy(() => import('./clusters/Clusters').then(module => ({ default: module.Clusters })))
const PluralProvider = lazy(() => import('./login/CurrentUser').then(module => ({ default: module.PluralProvider })))
const DeviceLoginNotif = lazy(() => import('./users/DeviceLoginNotif').then(module => ({ default: module.DeviceLoginNotif })))
const Docker = lazy(() => import('./repos/Docker').then(module => ({ default: module.Docker })))
const DockerRepository = lazy(() => import('./repos/Docker').then(module => ({ default: module.DockerRepository })))
const Domains = lazy(() => import('./account/Domains').then(module => ({ default: module.Domains })))
const EabCredentials = lazy(() => import('./profile/EabCredentials').then(module => ({ default: module.EabCredentials })))
const EditAccount = lazy(() => import('./users/EditAccount').then(module => ({ default: module.EditAccount })))
const Groups = lazy(() => import('./account/Groups').then(module => ({ default: module.Groups })))
const IntegrationPage = lazy(() => import('./repos/Integrations').then(module => ({ default: module.IntegrationPage })))
const LoginAudits = lazy(() => import('./audits/LoginAudits').then(module => ({ default: module.LoginAudits })))
const MyProfile = lazy(() => import('./profile/MyProfile').then(module => ({ default: module.MyProfile })))
const OIDCProvider = lazy(() => import('./repository/OIDCProvider').then(module => ({ default: module.OIDCProvider })))
const OauthCreator = lazy(() => import('./integrations/OauthCreator').then(module => ({ default: module.OauthCreator })))
const Profile = lazy(() => import('./profile/Profile').then(module => ({ default: module.Profile })))
const PublicKeys = lazy(() => import('./profile/PublicKeys').then(module => ({ default: module.PublicKeys })))
const Roles = lazy(() => import('./account/Roles').then(module => ({ default: module.Roles })))
const Security = lazy(() => import('./profile/Security').then(module => ({ default: module.Security })))
const ServiceAccounts = lazy(() => import('./account/ServiceAccounts').then(module => ({ default: module.ServiceAccounts })))
const UpgradeQueue = lazy(() => import('./clusters/UpgradeQueue').then(module => ({ default: module.UpgradeQueue })))
const UpgradeQueues = lazy(() => import('./clusters/UpgradeQueues').then(module => ({ default: module.UpgradeQueues })))
const Users = lazy(() => import('./account/Users').then(module => ({ default: module.Users })))
const VerifyEmailConfirmed = lazy(() => import('./users/EmailConfirmation').then(module => ({ default: module.VerifyEmailConfirmed })))

function EditBilling(props) {
  return (
    <EditAccount
      {...props}
      billing
    />
  )
}

function WrapStripe({ children }: any) {
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
  const { me } = useContext(CurrentUserContext)
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

function PosthogIdentifier() {
  const { me } = useContext(CurrentUserContext)

  PosthogIdentiy(me)

  useEffect(() => {
    const onPrefChange = () => {
      PosthogIdentiy(me)
    }

    window.addEventListener('CookiebotOnAccept', onPrefChange)
    window.addEventListener('CookiebotOnDecline', onPrefChange)
  }, [me])

  return null
}

export function PluralInner() {
  const isChecklistEnabled = useFeature('checklist').on

  return (
    <WrapStripe>
      <BreadcrumbProvider>
        <ChecklistProvider>
          <ApplicationLayout>
            <PosthogIdentifier />
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
                path="/repository/:name"
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
                path="/charts/:id"
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
              {/* --- ROADMAP --- */}
              <Route
                path="/roadmap"
                element={<Roadmap />}
              >
                <Route
                  index
                  element={<RoadmapRoadmap />}
                />
                <Route
                  path="changelog"
                  element={<RoadmapChangelog />}
                />
                <Route
                  path="application-requests"
                  element={<RoadmapApplicationRequests />}
                />
                <Route
                  path="feature-requests"
                  element={<RoadmapFeatureRequests />}
                />
                <Route
                  path="feedback"
                  element={<RoadmapFeedback />}
                />
              </Route>
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
    <Suspense>
      <PluralProvider>
        <PluralInner />
      </PluralProvider>
    </Suspense>
  )
}
