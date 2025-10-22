import { Suspense, lazy } from 'react'
import { Navigate, Outlet, Route, Routes, useMatch } from 'react-router-dom'

import { useHistory } from '../router'

import { WrapStripe } from './WrapStripe'
import { LegacyExpirationNotice } from './login/LegacyExpiration'
import LoadingIndicator from './utils/LoadingIndicator'
import { UsersList } from './account/UsersList'
import { Invites } from './account/Invites'
import { DelinquencyToast } from './account/billing/DelinquencyNotices'
import { INSTANCE_ID_PARAM } from './overview/clusters/plural-cloud/details/PluralCloudInstanceDetails'
import { PLURAL_CLOUD_INSTANCES_PATH_ABS } from './overview/clusters/plural-cloud/PluralCloudInstances'

const ApplicationLayout = lazy(() => import('./layout/ApplicationLayout'))
const BreadcrumbProvider = lazy(() => import('./Breadcrumbs'))
const CloudShell = lazy(() => import('./shell/Shell'))
const Marketplace = lazy(() => import('./marketplace/Marketplace'))
const OAuthCallback = lazy(() => import('./shell/OAuthCallback'))
const Publisher = lazy(() => import('./publisher/Publisher'))
const Stack = lazy(() => import('./stack/Stack'))
const StackApps = lazy(() => import('./stack/StackApps'))
const BillingLayout = lazy(() => import('./account/billing/BillingLayout'))
const BillingManagePlan = lazy(
  () => import('./account/billing/BillingManagePlan')
)
const BillingPayments = lazy(() => import('./account/billing/BillingPayments'))
const AccessTokens = lazy(() =>
  import('./profile/AccessTokens').then((module) => ({
    default: module.AccessTokens,
  }))
)
const Account = lazy(() =>
  import('./account/Account').then((module) => ({ default: module.Account }))
)
const AccountAttributes = lazy(() =>
  import('./account/AccountAttributes').then((module) => ({
    default: module.AccountAttributes,
  }))
)
const AuditChloropleth = lazy(() =>
  import('./audits/AuditChloropleth').then((module) => ({
    default: module.AuditChloropleth,
  }))
)
const AuditDirectory = lazy(() =>
  import('./audits/AuditDirectory').then((module) => ({
    default: module.AuditDirectory,
  }))
)
const Audits = lazy(() =>
  import('./audits/Audits').then((module) => ({ default: module.Audits }))
)
const ChecklistProvider = lazy(() =>
  import('./shell/onboarding/checklist/Checklist').then((module) => ({
    default: module.ChecklistProvider,
  }))
)

// Overview.
const Overview = lazy(() =>
  import('./overview/Overview').then((module) => ({ default: module.Overview }))
)
const Clusters = lazy(() =>
  import('./overview/clusters/Clusters').then((module) => ({
    default: module.Clusters,
  }))
)
const AllClusters = lazy(() =>
  import('./overview/clusters/all/AllClusters').then((module) => ({
    default: module.AllClusters,
  }))
)
const SelfHostedClusters = lazy(() =>
  import('./overview/clusters/self-hosted/SelfHostedClusters').then(
    (module) => ({
      default: module.SelfHostedClusters,
    })
  )
)
const PluralCloudInstances = lazy(() =>
  import('./overview/clusters/plural-cloud/PluralCloudInstances').then(
    (module) => ({
      default: module.PluralCloudInstances,
    })
  )
)
const PluralCloudInstanceDetails = lazy(() =>
  import(
    './overview/clusters/plural-cloud/details/PluralCloudInstanceDetails'
  ).then((module) => ({
    default: module.PluralCloudInstanceDetails,
  }))
)

// Create cluster.
const CreateCluster = lazy(() =>
  import('./create-cluster/CreateCluster').then((module) => ({
    default: module.CreateCluster,
  }))
)

// Cluster and app.
const Cluster = lazy(() =>
  import('./cluster/Cluster').then((module) => ({ default: module.Cluster }))
)
const App = lazy(() =>
  import('./app/App').then((module) => ({ default: module.App }))
)
const Upgrade = lazy(() =>
  import('./app/upgrade/Upgrade').then((module) => ({
    default: module.Upgrade,
  }))
)
const OIDC = lazy(() =>
  import('./app/oidc/OIDC').then((module) => ({ default: module.OIDC }))
)
const Uninstall = lazy(() =>
  import('./app/uninstall/Uninstall').then((module) => ({
    default: module.Uninstall,
  }))
)
const AppDocs = lazy(() =>
  import('./app/docs/AppDocs').then((module) => ({ default: module.AppDocs }))
)

const PluralProvider = lazy(() =>
  import('./login/CurrentUser').then((module) => ({
    default: module.PluralProvider,
  }))
)
const DeviceLoginNotif = lazy(() =>
  import('./users/DeviceLoginNotif').then((module) => ({
    default: module.DeviceLoginNotif,
  }))
)
const Domains = lazy(() =>
  import('./account/Domains').then((module) => ({ default: module.Domains }))
)
const EabCredentials = lazy(() =>
  import('./profile/EabCredentials').then((module) => ({
    default: module.EabCredentials,
  }))
)
const Groups = lazy(() =>
  import('./account/Groups').then((module) => ({ default: module.Groups }))
)
const LoginAudits = lazy(() =>
  import('./audits/LoginAudits').then((module) => ({
    default: module.LoginAudits,
  }))
)
const MyProfile = lazy(() =>
  import('./profile/MyProfile').then((module) => ({
    default: module.MyProfile,
  }))
)
const Profile = lazy(() =>
  import('./profile/Profile').then((module) => ({ default: module.Profile }))
)
const PublicKeys = lazy(() =>
  import('./profile/PublicKeys').then((module) => ({
    default: module.PublicKeys,
  }))
)
const KeyBackups = lazy(() =>
  import('./profile/KeyBackups').then((module) => ({
    default: module.KeyBackups,
  }))
)
const Roles = lazy(() =>
  import('./account/Roles').then((module) => ({ default: module.Roles }))
)
const Security = lazy(() =>
  import('./profile/Security').then((module) => ({ default: module.Security }))
)
const ServiceAccounts = lazy(() =>
  import('./account/ServiceAccounts').then((module) => ({
    default: module.ServiceAccounts,
  }))
)
const Users = lazy(() =>
  import('./account/Users').then((module) => ({ default: module.Users }))
)
const VerifyEmailConfirmed = lazy(() =>
  import('./users/EmailConfirmation').then((module) => ({
    default: module.VerifyEmailConfirmed,
  }))
)

/** Repository - /repository/:name * */
const Repository = lazy(() => import('./repository/Repository'))
const RepositoryArtifacts = lazy(
  () => import('./repository/RepositoryArtifacts')
)
const RepositoryDeployments = lazy(
  () => import('./repository/RepositoryDeployments')
)
const RepositoryDescription = lazy(
  () => import('./repository/RepositoryDescription')
)
const RepositoryEdit = lazy(() => import('./repository/RepositoryEdit'))
const RepositoryPackages = lazy(() => import('./repository/RepositoryPackages'))
const RepositoryPackagesDocker = lazy(
  () => import('./repository/RepositoryPackagesDocker')
)
const RepositoryPackagesHelm = lazy(
  () => import('./repository/RepositoryPackagesHelm')
)
const RepositoryPackagesTerraform = lazy(
  () => import('./repository/RepositoryPackagesTerraform')
)
const RepositoryTests = lazy(() => import('./repository/RepositoryTests'))

// Packages - Helm - /charts
const Chart = lazy(() => import('./repository/packages/Chart'))
const PackageReadme = lazy(
  () => import('./repository/packages/helm/PackageReadme')
)
const PackageConfiguration = lazy(
  () => import('./repository/packages/helm/PackageConfiguration')
)
const PackageDependencies = lazy(
  () => import('./repository/packages/helm/PackageDependencies')
)
const PackageSecurity = lazy(
  () => import('./repository/packages/helm/PackageSecurity')
)
const PackageUpdateQueue = lazy(
  () => import('./repository/packages/helm/PackageUpdateQueue')
)

// Packages - Docker - /dkr/img
const Docker = lazy(() =>
  import('./repository/packages/Docker').then((module) => ({
    default: module.Docker,
  }))
)
const DockerRepository = lazy(() =>
  import('./repository/packages/Docker').then((module) => ({
    default: module.DockerRepository,
  }))
)
const ImagePullMetrics = lazy(
  () => import('./repository/packages/docker/ImagePullMetrics')
)
const ImageVulnerabilities = lazy(
  () => import('./repository/packages/docker/ImageVulnerabilities')
)

// For accepting Github app installations
const GitHubSetup = lazy(() => import('./github/GitHubSetup'))

// Packages - Terraform - /terraform
const Terraform = lazy(() => import('./repository/packages/Terraform'))

// TODO: Deprecated or unused features
// const OauthCreator = lazy(() => import('../_deprecated/components/integrations/OauthCreator').then(module => ({ default: module.OauthCreator })))
// const OnboardingChecklist = lazy(() => import('./shell/onboarding/checklist/Checklist').then(module => ({ default: module.OnboardingChecklist })))
// const DockerRepository = lazy(() => import('../_deprecated/components/repos/Docker').then(module => ({ default: module.DockerRepository })))
// const IntegrationPage = lazy(() => import('../_deprecated/components/repos/Integrations').then(module => ({ default: module.IntegrationPage })))
// const EditAccount = lazy(() => import('./users/EditAccount').then(module => ({ default: module.EditAccount })))
// const UpgradeQueue = lazy(() => import('./clusters/UpgradeQueue').then(module => ({ default: module.UpgradeQueue })))
// const UpgradeQueues = lazy(() => import('./clusters/UpgradeQueues').then(module => ({ default: module.UpgradeQueues })))
// function EditBilling(props) {
//   return (
//     <EditAccount
//       {...props}
//       billing
//     />
//   )
// }

// Weird judo to get around inability to match oauth callback
// routes as subroutes passed from App.js.
// If anyone knows a better way around this, I'm all ears.
// - Klink
function OAuthOrFallback() {
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
      to={history.pop('/overview')}
    />
  )
}

export function PluralInner() {
  return (
    <WrapStripe>
      <BreadcrumbProvider>
        <ChecklistProvider>
          <ApplicationLayout>
            <DelinquencyToast />
            <LegacyExpirationNotice />
            <VerifyEmailConfirmed />
            <DeviceLoginNotif />
            <Routes>
              {/* --- OAUTH --- */}
              {/* TODO: Enable if route will be used by the app */}
              {/* <Route */}
              {/*  path="/oauth/accept/:service" */}
              {/*  element={<OauthCreator />} */}
              {/* /> */}
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
              {/* TODO: Enable if route will be accessible within the app */}
              {/* <Route */}
              {/*  path="/repositories/:id/integrations" */}
              {/*  element={<IntegrationPage />} */}
              {/* /> */}
              {/* --- PROFILE --- */}
              <Route
                path="/profile"
                element={<MyProfile />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      replace
                      to="me"
                    />
                  }
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
                  path="encryption-keys"
                  element={<KeyBackups />}
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
                path="/repository/:name/*"
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
                    element={
                      <Navigate
                        replace
                        to="helm"
                      />
                    }
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
                path="/account/*"
                element={<Account />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      replace
                      to="edit"
                    />
                  }
                />
                <Route
                  path="edit"
                  element={<Outlet />}
                >
                  <Route
                    index
                    element={<AccountAttributes />}
                  />
                  {/* TODO: Enable if route will be accessible within the app */}
                  {/* <Route */}
                  {/*  path=":section/*" */}
                  {/*  element={<EditAccount />} */}
                  {/* /> */}
                </Route>
                <Route
                  path="users"
                  element={<Users />}
                >
                  <Route
                    index
                    element={<UsersList />}
                  />
                  <Route
                    path="invites"
                    element={<Invites />}
                  />
                </Route>
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
                <Route
                  path="billing"
                  element={<BillingLayout />}
                >
                  <Route
                    index
                    element={<BillingManagePlan />}
                  />
                  <Route
                    path="payments"
                    element={<BillingPayments />}
                  />
                </Route>
              </Route>
              {/* TODO: Enable if route will be accessible within the app */}
              {/* <Route */}
              {/*  path="/account/billing/:section" */}
              {/*  element={<EditBilling />} */}
              {/* /> */}
              <Route
                path="/audits/*"
                element={<AuditDirectory />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      replace
                      to="logs"
                    />
                  }
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
              {/* TODO: Enable if route will be accessible within the app */}
              {/* <Route */}
              {/*  path="/upgrades/:id" */}
              {/*  element={<UpgradeQueue />} */}
              {/* /> */}
              {/* <Route */}
              {/*  path="/upgrades" */}
              {/*  element={<UpgradeQueues />} */}
              {/* /> */}
              {/* --- Overview --- */}
              <Route
                path="/overview"
                element={<Overview />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      replace
                      to="clusters"
                    />
                  }
                />
                <Route
                  path="clusters"
                  element={<Clusters />}
                >
                  <Route
                    index
                    element={
                      <Navigate
                        replace
                        to="all"
                      />
                    }
                  />
                  <Route
                    path="all"
                    element={<AllClusters />}
                  />
                  <Route
                    path="self-hosted"
                    element={<SelfHostedClusters />}
                  />
                  <Route
                    path="plural-cloud"
                    element={<PluralCloudInstances />}
                  />
                </Route>
                <Route
                  path={`${PLURAL_CLOUD_INSTANCES_PATH_ABS}/:${INSTANCE_ID_PARAM}`}
                  element={<PluralCloudInstanceDetails />}
                />
              </Route>
              {/* CREATE CLUSTER */}
              <Route
                path="/create-cluster"
                element={<CreateCluster />}
              />
              {/* CLUSTERS  */}
              <Route
                path="/clusters/:clusterId/"
                element={<Cluster />}
              />
              {/* CLUSTER APPS  */}
              <Route
                path="/apps/:clusterId/:appName"
                element={<App />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      replace
                      to="upgrade"
                    />
                  }
                />
                <Route
                  path="upgrade"
                  element={<Upgrade />}
                />
                <Route
                  path="oidc"
                  element={<OIDC />}
                />
                <Route
                  path="uninstall"
                  element={<Uninstall />}
                />
                <Route
                  path="docs"
                  element={<AppDocs />}
                >
                  <Route
                    path=":docName"
                    element={<AppDocs />}
                  />
                </Route>
              </Route>
              <Route
                path="/github/setup"
                element={<GitHubSetup />}
              />
              {/* --- 404 --- */}
              <Route
                path="/*"
                element={<OAuthOrFallback />}
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
    <Suspense fallback={<LoadingIndicator />}>
      <PluralProvider>
        <PluralInner />
      </PluralProvider>
    </Suspense>
  )
}
