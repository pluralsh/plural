import { ComponentType, ReactElement } from 'react'

import { AuthorizationUrl, Provider, ScmProvider } from '../../../../generated/graphql'

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
  CREATE_REPOSITORY = 'CREATE_REPOSITORY',
  CONFIGURE_CLOUD = 'CONFIGURE_CLOUD',
  CONFIGURE_WORKSPACE = 'CONFIGURE_WORKSPACE',
  CREATE_CLOUD_SHELL = 'CREATE_CLOUD_SHELL',
  INSTALL_CLI = 'INSTALL_CLI',
  COMPLETE_SETUP = 'COMPLETE_SETUP',
}

interface Section {
  index: number,
  key: SectionKey
  title: string
  IconComponent: ComponentType
  next?: Section
  prev?: Section
  state?: 'Creating' | undefined
}

type Sections = {[key in keyof typeof SectionKey]?: Section}

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
}

interface AWSCloudProvider {
  accessKey?: string
  secretKey?: string
}

interface AzureCloudProvider {
  resourceGroup?: string
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

type CloudProviderBase = AzureCloudProvider | AWSCloudProvider | GCPCloudProvider

interface CloudProps {
  type?: CloudType
  provider?: CloudProvider
  aws?: AWSCloudProvider
  azure?: AzureCloudProvider
  gcp?: GCPCloudProvider
}

interface WorkspaceProps {
  project?: string,
  region?: string,
  clusterName?: string,
  bucketPrefix?: string,
  subdomain?: string,
}

export type {
  Sections, Section, SCMProps, CloudProps, WorkspaceProps, GCPCloudProvider, AWSCloudProvider, AzureCloudProvider, CloudProviderBase, SCMOrg,
}
export {
  SectionKey, OrgType, CloudType, CloudProviderDisplayName, CloudProvider, CloudProviderToProvider,
}
