import { ComponentType } from 'react'

import {
  AuthorizationUrl,
  Provider,
  ScmProvider,
  User,
} from '../../../../generated/graphql'

enum CloudProvider {
  Azure = 'azure',
  GCP = 'gcp',
  AWS = 'aws',
}

// Keys should match CloudProvider values
enum CloudProviderDisplayName {
  aws = 'Amazon Web Services',
  azure = 'Azure',
  gcp = 'Google Cloud Platform',
}

// Keys should match CloudProvider values
enum CloudProviderToProvider {
  aws = Provider.Aws,
  azure = Provider.Azure,
  gcp = Provider.Gcp,
}

enum SectionKey {
  WELCOME = 'WELCOME',
  ONBOARDING_OVERVIEW = 'ONBOARDING_OVERVIEW',
  CONFIGURE_CLOUD = 'CONFIGURE_CLOUD',
  CONFIGURE_WORKSPACE = 'CONFIGURE_WORKSPACE',
  CREATE_CLOUD_SHELL = 'CREATE_CLOUD_SHELL',
  INSTALL_CLI = 'INSTALL_CLI',
  COMPLETE_SETUP = 'COMPLETE_SETUP',
}

interface Section {
  index: number
  key: SectionKey
  title: string
  IconComponent: ComponentType
  next?: Section
  prev?: Section
  state?: CreateCloudShellSectionState | ConfigureCloudSectionState
  hasError?: boolean
}

type Sections = { [key in keyof typeof SectionKey]?: Section }

enum CreateCloudShellSectionState {
  Summary = 'Summary',
  Creating = 'Creating',
  Finished = 'Finished',
}

enum ConfigureCloudSectionState {
  CloudSelection = 'CloudSelection',
  RepositorySelection = 'RepositorySelection',
  RepositoryConfiguration = 'RepositoryConfiguration',
  CloudConfiguration = 'CloudConfiguration',
}

enum OrgType {
  User = 'User',
  Organization = 'Organization',
}

interface SCMProps {
  token?: string
  provider?: ScmProvider
  authUrls: Array<AuthorizationUrl>
  repositoryName?: string
  org?: SCMOrg
}

interface SCMOrg {
  id?: string
  name?: string
  orgType?: OrgType
  avatarUrl?: string
}

enum CloudType {
  Cloud,
  Local,
  Demo,
}

interface AWSCloudProvider {
  accessKey?: string
  secretKey?: string
}

interface AzureCloudProvider {
  storageAccount?: string
  subscriptionID?: string
  tenantID?: string
  clientID?: string
  clientSecret?: string
}

interface GCPCloudProvider {
  fileName?: string
  applicationCredentials?: string
}

type CloudProviderBase =
  | AzureCloudProvider
  | AWSCloudProvider
  | GCPCloudProvider

interface CloudProps {
  type?: CloudType
  provider?: CloudProvider
  demoID?: string
  aws?: AWSCloudProvider
  azure?: AzureCloudProvider
  gcp?: GCPCloudProvider
}

interface WorkspaceProps {
  project?: string
  region?: string
  clusterName?: string
  bucketPrefix?: string
  subdomain?: string
}

interface Impersonation {
  userId?: string
  user?: User
}

enum OnboardingPath {
  None,
  CD,
  OSS,
}

export type {
  Sections,
  Section,
  SCMProps,
  CloudProps,
  WorkspaceProps,
  GCPCloudProvider,
  AWSCloudProvider,
  AzureCloudProvider,
  CloudProviderBase,
  SCMOrg,
  Impersonation,
}
export {
  SectionKey,
  OrgType,
  CloudType,
  CloudProviderDisplayName,
  CloudProvider,
  CloudProviderToProvider,
  CreateCloudShellSectionState,
  ConfigureCloudSectionState,
  OnboardingPath,
}
