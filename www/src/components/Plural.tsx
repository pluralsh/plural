import { Suspense, lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import BreadcrumbProvider from './Breadcrumbs'
import ApplicationLayout from './layout/ApplicationLayout'
import { PluralProvider } from './login/CurrentUser'
import { WrapStripe } from './WrapStripe'
import { LegacyExpirationNotice } from './login/LegacyExpiration'
import LoadingIndicator from './utils/LoadingIndicator'
import { UsersList } from './account/UsersList'
import { Invites } from './account/Invites'
import { DelinquencyToast } from './account/billing/DelinquencyNotices'
import {
  INSTANCE_ID_PARAM,
  PLURAL_CLOUD_INSTANCES_PATH_ABS,
} from './overview/clusters/plural-cloud/PluralCloudInstances'

const Home = lazy(() => import('./home/Home'))
const BillingLayout = lazy(() => import('./account/billing/BillingLayout'))
const BillingManagePlan = lazy(
  () => import('./account/billing/BillingManagePlan')
)
const BillingPayments = lazy(() => import('./account/billing/BillingPayments'))
const BillingUsage = lazy(() => import('./account/billing/usage/BillingUsage'))
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
  import('./overview/clusters/plural-cloud/details/PluralCloudInstanceDetails').then(
    (module) => ({
      default: module.PluralCloudInstanceDetails,
    })
  )
)

// Create cluster.
const CreateCluster = lazy(() =>
  import('./create-cluster/CreateCluster').then((module) => ({
    default: module.CreateCluster,
  }))
)

// Cluster.
const Cluster = lazy(() =>
  import('./cluster/Cluster').then((module) => ({ default: module.Cluster }))
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
const GroupCreate = lazy(() =>
  import('./account/groups/GroupEditOrCreate').then((module) => ({
    default: module.GroupCreate,
  }))
)
const GroupEdit = lazy(() =>
  import('./account/groups/GroupEditOrCreate').then((module) => ({
    default: module.GroupEdit,
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
const Appearance = lazy(() =>
  import('./profile/Appearance').then((module) => ({
    default: module.Appearance,
  }))
)
const KeyBackups = lazy(() =>
  import('./profile/KeyBackups').then((module) => ({
    default: module.KeyBackups,
  }))
)
const LoginAudits = lazy(() =>
  import('./audits/LoginAudits').then((module) => ({
    default: module.LoginAudits,
  }))
)
const PublicKeys = lazy(() =>
  import('./profile/PublicKeys').then((module) => ({
    default: module.PublicKeys,
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

// For accepting Github app installations
const GitHubSetup = lazy(() => import('./github/GitHubSetup'))

function Fallback() {
  return (
    <Navigate
      replace
      to="/"
    />
  )
}

export function PluralInner() {
  return (
    <WrapStripe>
      <BreadcrumbProvider>
        <ApplicationLayout>
          <DelinquencyToast />
          <LegacyExpirationNotice />
          <Suspense fallback={null}>
            <VerifyEmailConfirmed />
            <DeviceLoginNotif />
          </Suspense>
          <Suspense fallback={<LoadingIndicator />}>
            <Routes>
              <Route
                index
                element={<Home />}
              />
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
                  path="appearance"
                  element={<Appearance />}
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
                  path="groups/create"
                  element={<GroupCreate />}
                />
                <Route
                  path="groups/:groupId"
                  element={<GroupEdit />}
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
                path="/account/billing"
                element={<BillingLayout />}
              >
                <Route
                  index
                  element={<BillingManagePlan />}
                />
                <Route
                  path="usage"
                  element={<BillingUsage />}
                />
                <Route
                  path="payments"
                  element={<BillingPayments />}
                />
              </Route>
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
              <Route
                path="/github/setup"
                element={<GitHubSetup />}
              />
              {/* --- 404 --- */}
              <Route
                path="/*"
                element={<Fallback />}
              />
            </Routes>
          </Suspense>
        </ApplicationLayout>
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
