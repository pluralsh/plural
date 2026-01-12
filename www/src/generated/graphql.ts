/* eslint-disable */
/* prettier-ignore */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `DateTime` scalar type represents a date and time in the UTC
   * timezone. The DateTime appears in a JSON response as an ISO8601 formatted
   * string, including UTC timezone ("Z"). The parsed date and time string will
   * be converted to UTC if there is an offset.
   */
  DateTime: { input: Date; output: Date; }
  Map: { input: Map<string, unknown>; output: Map<string, unknown>; }
  UploadOrUrl: { input: string; output: string; }
  Yaml: { input: unknown; output: unknown; }
};

export type Account = {
  __typename?: 'Account';
  availableFeatures?: Maybe<PlanFeatures>;
  backgroundColor?: Maybe<Scalars['String']['output']>;
  billingAddress?: Maybe<Address>;
  billingCustomerId?: Maybe<Scalars['String']['output']>;
  clusterCount?: Maybe<Scalars['String']['output']>;
  consumerEmailDomains?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  delinquentAt?: Maybe<Scalars['DateTime']['output']>;
  domainMappings?: Maybe<Array<Maybe<DomainMapping>>>;
  grandfatheredUntil?: Maybe<Scalars['DateTime']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  paymentMethods?: Maybe<PaymentMethodConnection>;
  rootUser?: Maybe<User>;
  subscription?: Maybe<PlatformSubscription>;
  trialed?: Maybe<Scalars['Boolean']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userCount?: Maybe<Scalars['String']['output']>;
  workosConnectionId?: Maybe<Scalars['String']['output']>;
};


export type AccountPaymentMethodsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type AccountAttributes = {
  billingAddress?: InputMaybe<AddressAttributes>;
  domainMappings?: InputMaybe<Array<InputMaybe<DomainMappingInput>>>;
  icon?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ActionItem = {
  __typename?: 'ActionItem';
  link: Scalars['String']['output'];
  type: ActionItemType;
};

export type ActionItemAttributes = {
  link: Scalars['String']['input'];
  type: ActionItemType;
};

export enum ActionItemType {
  Blog = 'BLOG',
  Issue = 'ISSUE',
  Pull = 'PULL'
}

export type Address = {
  __typename?: 'Address';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  line1?: Maybe<Scalars['String']['output']>;
  line2?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  zip?: Maybe<Scalars['String']['output']>;
};

export type AddressAttributes = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  line1: Scalars['String']['input'];
  line2?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  zip: Scalars['String']['input'];
};

export type AppLink = {
  __typename?: 'AppLink';
  description?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type ApplicationComponent = {
  __typename?: 'ApplicationComponent';
  group?: Maybe<Scalars['String']['output']>;
  kind?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type ApplicationInformation = {
  __typename?: 'ApplicationInformation';
  components?: Maybe<Array<Maybe<ApplicationComponent>>>;
  componentsReady?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ready?: Maybe<Scalars['Boolean']['output']>;
  spec?: Maybe<ApplicationSpec>;
};

export type ApplicationSpec = {
  __typename?: 'ApplicationSpec';
  description?: Maybe<Scalars['String']['output']>;
  links?: Maybe<Array<Maybe<AppLink>>>;
  version?: Maybe<Scalars['String']['output']>;
};

export type ApplyLock = {
  __typename?: 'ApplyLock';
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  lock?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<User>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Artifact = {
  __typename?: 'Artifact';
  arch?: Maybe<Scalars['String']['output']>;
  blob?: Maybe<Scalars['String']['output']>;
  filesize?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<ArtifactPlatform>;
  readme?: Maybe<Scalars['String']['output']>;
  sha?: Maybe<Scalars['String']['output']>;
  type?: Maybe<ArtifactType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ArtifactAttributes = {
  arch?: InputMaybe<Scalars['String']['input']>;
  blob?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  name: Scalars['String']['input'];
  platform: Scalars['String']['input'];
  readme: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export enum ArtifactPlatform {
  Android = 'ANDROID',
  Freebsd = 'FREEBSD',
  Linux = 'LINUX',
  Mac = 'MAC',
  Openbsd = 'OPENBSD',
  Solaris = 'SOLARIS',
  Windows = 'WINDOWS'
}

export enum ArtifactType {
  Cli = 'CLI',
  Desktop = 'DESKTOP',
  Mobile = 'MOBILE'
}

export type Audit = {
  __typename?: 'Audit';
  action: Scalars['String']['output'];
  actor?: Maybe<User>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  group?: Maybe<Group>;
  id: Scalars['ID']['output'];
  image?: Maybe<DockerImage>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  integrationWebhook?: Maybe<IntegrationWebhook>;
  ip?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  repository?: Maybe<Repository>;
  role?: Maybe<Role>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  version?: Maybe<Version>;
};

export type AuditConnection = {
  __typename?: 'AuditConnection';
  edges?: Maybe<Array<Maybe<AuditEdge>>>;
  pageInfo: PageInfo;
};

export type AuditEdge = {
  __typename?: 'AuditEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Audit>;
};

export type AuthorizationUrl = {
  __typename?: 'AuthorizationUrl';
  provider: ScmProvider;
  url: Scalars['String']['output'];
};

export type AwsShellCredentialsAttributes = {
  accessKeyId: Scalars['String']['input'];
  secretAccessKey: Scalars['String']['input'];
};

export type AzureShellCredentialsAttributes = {
  clientId: Scalars['String']['input'];
  clientSecret: Scalars['String']['input'];
  storageAccount: Scalars['String']['input'];
  subscriptionId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type BindingAttributes = {
  groupId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type Card = {
  __typename?: 'Card';
  brand: Scalars['String']['output'];
  expMonth: Scalars['Int']['output'];
  expYear: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  last4: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type CardConnection = {
  __typename?: 'CardConnection';
  edges?: Maybe<Array<Maybe<CardEdge>>>;
  pageInfo: PageInfo;
};

export type CardEdge = {
  __typename?: 'CardEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Card>;
};

/** Application categories. */
export enum Category {
  Data = 'DATA',
  Database = 'DATABASE',
  Devops = 'DEVOPS',
  Messaging = 'MESSAGING',
  Network = 'NETWORK',
  Productivity = 'PRODUCTIVITY',
  Security = 'SECURITY',
  Storage = 'STORAGE'
}

export type CategoryInfo = {
  __typename?: 'CategoryInfo';
  category?: Maybe<Category>;
  count?: Maybe<Scalars['Int']['output']>;
  tags?: Maybe<GroupedTagConnection>;
};


export type CategoryInfoTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
};

export type ChangeInstructions = {
  __typename?: 'ChangeInstructions';
  instructions?: Maybe<Scalars['String']['output']>;
  script?: Maybe<Scalars['String']['output']>;
};

export type Chart = {
  __typename?: 'Chart';
  dependencies?: Maybe<Dependencies>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  installation?: Maybe<ChartInstallation>;
  latestVersion?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  repository?: Maybe<Repository>;
  tags?: Maybe<Array<Maybe<VersionTag>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ChartAttributes = {
  tags?: InputMaybe<Array<InputMaybe<VersionTagAttributes>>>;
};

export type ChartConnection = {
  __typename?: 'ChartConnection';
  edges?: Maybe<Array<Maybe<ChartEdge>>>;
  pageInfo: PageInfo;
};

export type ChartEdge = {
  __typename?: 'ChartEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Chart>;
};

export type ChartInstallation = {
  __typename?: 'ChartInstallation';
  chart?: Maybe<Chart>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  installation?: Maybe<Installation>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  version?: Maybe<Version>;
};

export type ChartInstallationAttributes = {
  chartId?: InputMaybe<Scalars['ID']['input']>;
  versionId?: InputMaybe<Scalars['ID']['input']>;
};

export type ChartInstallationConnection = {
  __typename?: 'ChartInstallationConnection';
  edges?: Maybe<Array<Maybe<ChartInstallationEdge>>>;
  pageInfo: PageInfo;
};

export type ChartInstallationEdge = {
  __typename?: 'ChartInstallationEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<ChartInstallation>;
};

export type ChartName = {
  chart?: InputMaybe<Scalars['String']['input']>;
  repo?: InputMaybe<Scalars['String']['input']>;
};

export type ChatMessage = {
  __typename?: 'ChatMessage';
  content: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
};

export type ChatMessageAttributes = {
  content: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  role: Scalars['String']['input'];
};

export type CheckoutSession = {
  __typename?: 'CheckoutSession';
  url?: Maybe<Scalars['String']['output']>;
};

export type ClosureItem = {
  __typename?: 'ClosureItem';
  dep?: Maybe<Dependency>;
  helm?: Maybe<Chart>;
  terraform?: Maybe<Terraform>;
};

export enum CloudProvider {
  Aws = 'AWS'
}

export type CloudRegions = {
  __typename?: 'CloudRegions';
  aws?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type CloudShell = {
  __typename?: 'CloudShell';
  aesKey: Scalars['String']['output'];
  alive: Scalars['Boolean']['output'];
  cluster: Scalars['String']['output'];
  gitUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  missing?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  provider: Provider;
  region: Scalars['String']['output'];
  status?: Maybe<ShellStatus>;
  subdomain: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CloudShellAttributes = {
  credentials: ShellCredentialsAttributes;
  demoId?: InputMaybe<Scalars['ID']['input']>;
  provider?: InputMaybe<Provider>;
  scm?: InputMaybe<ScmAttributes>;
  workspace: WorkspaceAttributes;
};

/** A Kubernetes cluster that can be used to deploy applications on with Plural. */
export type Cluster = {
  __typename?: 'Cluster';
  /** The account that the cluster belongs to. */
  account?: Maybe<Account>;
  /** The URL of the console running on the cluster. */
  consoleUrl?: Maybe<Scalars['String']['output']>;
  /** the dependencies a cluster has */
  dependency?: Maybe<ClusterDependency>;
  /** The domain name used for applications deployed on the cluster. */
  domain?: Maybe<Scalars['String']['output']>;
  /** The git repository URL for the cluster. */
  gitUrl?: Maybe<Scalars['String']['output']>;
  /** The ID of the cluster. */
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  /** whether this is a legacy OSS cluster */
  legacy?: Maybe<Scalars['Boolean']['output']>;
  /** whether any installation in the cluster has been locked */
  locked?: Maybe<Scalars['Boolean']['output']>;
  /** The name of the cluster. */
  name: Scalars['String']['output'];
  /** The user that owns the cluster. */
  owner?: Maybe<User>;
  /** The last time the cluster was pinged. */
  pingedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The cluster's cloud provider. */
  provider: Provider;
  /** The upgrade queue for applications running on the cluster. */
  queue?: Maybe<UpgradeQueue>;
  /** the services deployed from this cluster */
  serviceCount?: Maybe<Scalars['Int']['output']>;
  /** The source of the cluster. */
  source?: Maybe<Source>;
  /** whether all installations in the cluster have been synced */
  synced?: Maybe<Scalars['Boolean']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** pending upgrades for each installed app */
  upgradeInfo?: Maybe<Array<Maybe<UpgradeInfo>>>;
  /** CPU/Memory history for this cluster */
  usageHistory?: Maybe<Array<Maybe<ClusterUsageHistory>>>;
};


/** A Kubernetes cluster that can be used to deploy applications on with Plural. */
export type ClusterUsageHistoryArgs = {
  begin: Scalars['DateTime']['input'];
};

/** Input for creating or updating a cluster. */
export type ClusterAttributes = {
  /** The URL of the console running on the cluster. */
  consoleUrl?: InputMaybe<Scalars['String']['input']>;
  /** The domain name used for applications deployed on the cluster. */
  domain?: InputMaybe<Scalars['String']['input']>;
  /** The git repository URL for the cluster. */
  gitUrl?: InputMaybe<Scalars['String']['input']>;
  /** whether this is a legacy oss cluster */
  legacy?: InputMaybe<Scalars['Boolean']['input']>;
  /** The name of the cluster. */
  name: Scalars['String']['input'];
  /** The cluster's cloud provider. */
  provider: Provider;
  /** The source of the cluster. */
  source?: InputMaybe<Source>;
};

export type ClusterConnection = {
  __typename?: 'ClusterConnection';
  edges?: Maybe<Array<Maybe<ClusterEdge>>>;
  pageInfo: PageInfo;
};

/** A dependncy reference between clusters */
export type ClusterDependency = {
  __typename?: 'ClusterDependency';
  /** the cluster holding this dependency */
  cluster?: Maybe<Cluster>;
  /** the source cluster of this dependency */
  dependency?: Maybe<Cluster>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ClusterEdge = {
  __typename?: 'ClusterEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Cluster>;
};

export type ClusterInformation = {
  __typename?: 'ClusterInformation';
  gitCommit?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export type ClusterInformationAttributes = {
  gitCommit?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type ClusterPingAttributes = {
  /** the cluster to ping */
  cluster: ClusterAttributes;
  /** the usage of the cluster */
  usage?: InputMaybe<ClusterUsageAttributes>;
};

export type ClusterUsageAttributes = {
  /** the number of bytes ingested by the cluster */
  bytesIngested?: InputMaybe<Scalars['Int']['input']>;
  /** the number of clusters in the cluster */
  clusters?: InputMaybe<Scalars['Int']['input']>;
  /** the number of services deployed on the cluster */
  services?: InputMaybe<Scalars['Int']['input']>;
};

/** A record of the utilization in a given cluster */
export type ClusterUsageHistory = {
  __typename?: 'ClusterUsageHistory';
  account?: Maybe<Account>;
  bytesIngested?: Maybe<Scalars['Int']['output']>;
  cluster?: Maybe<Cluster>;
  clusters?: Maybe<Scalars['Int']['output']>;
  cpu?: Maybe<Scalars['Int']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  memory?: Maybe<Scalars['Int']['output']>;
  services?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Community = {
  __typename?: 'Community';
  discord?: Maybe<Scalars['String']['output']>;
  gitUrl?: Maybe<Scalars['String']['output']>;
  homepage?: Maybe<Scalars['String']['output']>;
  slack?: Maybe<Scalars['String']['output']>;
  twitter?: Maybe<Scalars['String']['output']>;
  videos?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

/** Input for creating or updating the community links of an application. */
export type CommunityAttributes = {
  /** The application's Discord server. */
  discord?: InputMaybe<Scalars['String']['input']>;
  /** The application's git URL. */
  gitUrl?: InputMaybe<Scalars['String']['input']>;
  /** The application's homepage. */
  homepage?: InputMaybe<Scalars['String']['input']>;
  /** The application's Slack channel. */
  slack?: InputMaybe<Scalars['String']['input']>;
  /** The application's Twitter account. */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** The videos of the application. */
  videos?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ConsentRequest = {
  __typename?: 'ConsentRequest';
  requestedScope?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  skip?: Maybe<Scalars['Boolean']['output']>;
};

export type ConsoleConfigurationUpdateAttributes = {
  encryptionKey?: InputMaybe<Scalars['String']['input']>;
};

export type ConsoleInstance = {
  __typename?: 'ConsoleInstance';
  /** the cloud provider hosting this instance */
  cloud: CloudProvider;
  console?: Maybe<Cluster>;
  /** the time this instance was deleted on */
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  /** the domain of this instance */
  domain?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  /** the name of this instance (globally unique) */
  name: Scalars['String']['output'];
  /** the network configuration for this instance */
  network?: Maybe<ConsoleInstanceNetwork>;
  /** custom oidc configuration for this instance */
  oidc?: Maybe<ConsoleInstanceOidc>;
  owner?: Maybe<User>;
  /** the region this instance is hosted in */
  region: Scalars['String']['output'];
  /** the heuristic size of this instance */
  size: ConsoleSize;
  /** the provisioning status of this instance, liveness is fetched through the console field */
  status: ConsoleInstanceStatus;
  /** the subdomain this instance lives under */
  subdomain: Scalars['String']['output'];
  /** whether this is a shared or dedicated console */
  type: ConsoleInstanceType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** full console url of this instance */
  url: Scalars['String']['output'];
};

export type ConsoleInstanceAttributes = {
  /** the cloud provider to deploy to */
  cloud: CloudProvider;
  /** the name of this instance (globally unique) */
  name: Scalars['String']['input'];
  /** use this to add network security settings to this instance */
  network?: InputMaybe<ConsoleNetworkAttributes>;
  /** use this to add custom oidc configuration to this instance */
  oidc?: InputMaybe<ConsoleOidcAttributes>;
  /** the region to deploy to (provider specific) */
  region: Scalars['String']['input'];
  /** a heuristic size of this instance */
  size: ConsoleSize;
  /** the type of console instance */
  type: ConsoleInstanceType;
};

export type ConsoleInstanceConnection = {
  __typename?: 'ConsoleInstanceConnection';
  edges?: Maybe<Array<Maybe<ConsoleInstanceEdge>>>;
  pageInfo: PageInfo;
};

export type ConsoleInstanceEdge = {
  __typename?: 'ConsoleInstanceEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<ConsoleInstance>;
};

export type ConsoleInstanceNetwork = {
  __typename?: 'ConsoleInstanceNetwork';
  allowedCidrs?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type ConsoleInstanceOidc = {
  __typename?: 'ConsoleInstanceOidc';
  clientId?: Maybe<Scalars['String']['output']>;
  clientSecret?: Maybe<Scalars['String']['output']>;
  issuer?: Maybe<Scalars['String']['output']>;
};

export enum ConsoleInstanceStatus {
  DatabaseCreated = 'DATABASE_CREATED',
  DatabaseDeleted = 'DATABASE_DELETED',
  DeploymentCreated = 'DEPLOYMENT_CREATED',
  DeploymentDeleted = 'DEPLOYMENT_DELETED',
  Pending = 'PENDING',
  Provisioned = 'PROVISIONED',
  StackCreated = 'STACK_CREATED',
  StackDeleted = 'STACK_DELETED'
}

export enum ConsoleInstanceType {
  Dedicated = 'DEDICATED',
  Shared = 'SHARED'
}

export type ConsoleInstanceUpdateAttributes = {
  configuration?: InputMaybe<ConsoleConfigurationUpdateAttributes>;
  network?: InputMaybe<ConsoleNetworkAttributes>;
  oidc?: InputMaybe<ConsoleOidcAttributes>;
  size?: InputMaybe<ConsoleSize>;
};

export type ConsoleNetworkAttributes = {
  allowedCidrs?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ConsoleOidcAttributes = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  clientSecret?: InputMaybe<Scalars['String']['input']>;
  issuer?: InputMaybe<Scalars['String']['input']>;
};

export enum ConsoleSize {
  Large = 'LARGE',
  Medium = 'MEDIUM',
  Small = 'SMALL'
}

export type ContextAttributes = {
  buckets?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  configuration: Scalars['Map']['input'];
  domains?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** An external repository contributor */
export type Contributor = {
  __typename?: 'Contributor';
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type Crd = {
  __typename?: 'Crd';
  blob?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CrdAttributes = {
  blob?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  name: Scalars['String']['input'];
};

export type Cvss = {
  __typename?: 'Cvss';
  attackComplexity?: Maybe<VulnGrade>;
  attackVector?: Maybe<VulnVector>;
  availability?: Maybe<VulnGrade>;
  confidentiality?: Maybe<VulnGrade>;
  integrity?: Maybe<VulnGrade>;
  privilegesRequired?: Maybe<VulnGrade>;
  userInteraction?: Maybe<VulnRequirement>;
};

export enum Datatype {
  Bool = 'BOOL',
  Bucket = 'BUCKET',
  Domain = 'DOMAIN',
  File = 'FILE',
  Function = 'FUNCTION',
  Int = 'INT',
  Password = 'PASSWORD',
  String = 'STRING'
}

export type DeferredReason = {
  __typename?: 'DeferredReason';
  message?: Maybe<Scalars['String']['output']>;
  package?: Maybe<Scalars['String']['output']>;
  repository?: Maybe<Scalars['String']['output']>;
};

export type DeferredUpdate = {
  __typename?: 'DeferredUpdate';
  attempts?: Maybe<Scalars['Int']['output']>;
  chartInstallation?: Maybe<ChartInstallation>;
  dequeueAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  messages?: Maybe<Array<Maybe<DeferredReason>>>;
  pending?: Maybe<Scalars['Boolean']['output']>;
  terraformInstallation?: Maybe<TerraformInstallation>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  version?: Maybe<Version>;
};

export type DeferredUpdateConnection = {
  __typename?: 'DeferredUpdateConnection';
  edges?: Maybe<Array<Maybe<DeferredUpdateEdge>>>;
  pageInfo: PageInfo;
};

export type DeferredUpdateEdge = {
  __typename?: 'DeferredUpdateEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<DeferredUpdate>;
};

export enum Delta {
  Create = 'CREATE',
  Delete = 'DELETE',
  Update = 'UPDATE'
}

export type DemoProject = {
  __typename?: 'DemoProject';
  credentials?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  projectId: Scalars['String']['output'];
  ready?: Maybe<Scalars['Boolean']['output']>;
  state?: Maybe<DemoProjectState>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum DemoProjectState {
  Created = 'CREATED',
  Enabled = 'ENABLED',
  Ready = 'READY'
}

export type Dependencies = {
  __typename?: 'Dependencies';
  application?: Maybe<Scalars['Boolean']['output']>;
  breaking?: Maybe<Scalars['Boolean']['output']>;
  cliVsn?: Maybe<Scalars['String']['output']>;
  dependencies?: Maybe<Array<Maybe<Dependency>>>;
  instructions?: Maybe<ChangeInstructions>;
  outputs?: Maybe<Scalars['Map']['output']>;
  providerVsn?: Maybe<Scalars['String']['output']>;
  providerWirings?: Maybe<Scalars['Map']['output']>;
  providers?: Maybe<Array<Maybe<Provider>>>;
  secrets?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  wait?: Maybe<Scalars['Boolean']['output']>;
  wirings?: Maybe<Wirings>;
};

export type Dependency = {
  __typename?: 'Dependency';
  name?: Maybe<Scalars['String']['output']>;
  optional?: Maybe<Scalars['Boolean']['output']>;
  repo?: Maybe<Scalars['String']['output']>;
  type?: Maybe<DependencyType>;
  version?: Maybe<Scalars['String']['output']>;
};

export enum DependencyType {
  Helm = 'HELM',
  Terraform = 'TERRAFORM'
}

export type DeviceLogin = {
  __typename?: 'DeviceLogin';
  deviceToken: Scalars['String']['output'];
  loginUrl: Scalars['String']['output'];
};

export type DnsAccessPolicy = {
  __typename?: 'DnsAccessPolicy';
  bindings?: Maybe<Array<Maybe<PolicyBinding>>>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type DnsAccessPolicyAttributes = {
  bindings?: InputMaybe<Array<InputMaybe<BindingAttributes>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type DnsDomain = {
  __typename?: 'DnsDomain';
  accessPolicy?: Maybe<DnsAccessPolicy>;
  account?: Maybe<Account>;
  creator?: Maybe<User>;
  dnsRecords?: Maybe<DnsRecordConnection>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type DnsDomainDnsRecordsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type DnsDomainAttributes = {
  accessPolicy?: InputMaybe<DnsAccessPolicyAttributes>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type DnsDomainConnection = {
  __typename?: 'DnsDomainConnection';
  edges?: Maybe<Array<Maybe<DnsDomainEdge>>>;
  pageInfo: PageInfo;
};

export type DnsDomainEdge = {
  __typename?: 'DnsDomainEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<DnsDomain>;
};

export type DnsRecord = {
  __typename?: 'DnsRecord';
  cluster: Scalars['String']['output'];
  creator?: Maybe<User>;
  domain?: Maybe<DnsDomain>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  provider: Provider;
  records?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  type: DnsRecordType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type DnsRecordAttributes = {
  name: Scalars['String']['input'];
  records?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type: DnsRecordType;
};

export type DnsRecordConnection = {
  __typename?: 'DnsRecordConnection';
  edges?: Maybe<Array<Maybe<DnsRecordEdge>>>;
  pageInfo: PageInfo;
};

export type DnsRecordEdge = {
  __typename?: 'DnsRecordEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<DnsRecord>;
};

export enum DnsRecordType {
  A = 'A',
  Aaaa = 'AAAA',
  Cname = 'CNAME',
  Txt = 'TXT'
}

export type DockerImage = {
  __typename?: 'DockerImage';
  digest: Scalars['String']['output'];
  dockerRepository?: Maybe<DockerRepository>;
  grade?: Maybe<ImageGrade>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  scanCompletedAt?: Maybe<Scalars['DateTime']['output']>;
  scannedAt?: Maybe<Scalars['DateTime']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  vulnerabilities?: Maybe<Array<Maybe<Vulnerability>>>;
};

export type DockerImageConnection = {
  __typename?: 'DockerImageConnection';
  edges?: Maybe<Array<Maybe<DockerImageEdge>>>;
  pageInfo: PageInfo;
};

export type DockerImageEdge = {
  __typename?: 'DockerImageEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<DockerImage>;
};

export type DockerRepository = {
  __typename?: 'DockerRepository';
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  metrics?: Maybe<Array<Maybe<Metric>>>;
  name: Scalars['String']['output'];
  public?: Maybe<Scalars['Boolean']['output']>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type DockerRepositoryMetricsArgs = {
  offset?: InputMaybe<Scalars['String']['input']>;
  precision?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};

export type DockerRepositoryAttributes = {
  public: Scalars['Boolean']['input'];
};

export type DockerRepositoryConnection = {
  __typename?: 'DockerRepositoryConnection';
  edges?: Maybe<Array<Maybe<DockerRepositoryEdge>>>;
  pageInfo: PageInfo;
};

export type DockerRepositoryEdge = {
  __typename?: 'DockerRepositoryEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<DockerRepository>;
};

export type DomainMapping = {
  __typename?: 'DomainMapping';
  account?: Maybe<Account>;
  domain: Scalars['String']['output'];
  enableSso?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type DomainMappingInput = {
  domain?: InputMaybe<Scalars['String']['input']>;
  enableSso?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type EabCredential = {
  __typename?: 'EabCredential';
  cluster: Scalars['String']['output'];
  hmacKey: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  keyId: Scalars['String']['output'];
  provider: Provider;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type EntityAttributes = {
  endIndex?: InputMaybe<Scalars['Int']['input']>;
  startIndex?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  type: MessageEntityType;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export enum ExternalOidcProvider {
  GithubActions = 'GITHUB_ACTIONS'
}

export type File = {
  __typename?: 'File';
  blob: Scalars['String']['output'];
  contentType?: Maybe<Scalars['String']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  filesize?: Maybe<Scalars['Int']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  mediaType?: Maybe<MediaType>;
  message: IncidentMessage;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};

export type FileAttributes = {
  blob?: InputMaybe<Scalars['UploadOrUrl']['input']>;
};

export type FileConnection = {
  __typename?: 'FileConnection';
  edges?: Maybe<Array<Maybe<FileEdge>>>;
  pageInfo: PageInfo;
};

export type FileContent = {
  __typename?: 'FileContent';
  content: Scalars['String']['output'];
  path: Scalars['String']['output'];
};

export type FileEdge = {
  __typename?: 'FileEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<File>;
};

export type Follower = {
  __typename?: 'Follower';
  id: Scalars['ID']['output'];
  incident?: Maybe<Incident>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  preferences?: Maybe<NotificationPreferences>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user: User;
};

export type FollowerAttributes = {
  preferences?: InputMaybe<NotificationPreferencesAttributes>;
};

export type FollowerConnection = {
  __typename?: 'FollowerConnection';
  edges?: Maybe<Array<Maybe<FollowerEdge>>>;
  pageInfo: PageInfo;
};

export type FollowerEdge = {
  __typename?: 'FollowerEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Follower>;
};

export type GcpShellCredentialsAttributes = {
  applicationCredentials: Scalars['String']['input'];
};

export type GeoMetric = {
  __typename?: 'GeoMetric';
  count?: Maybe<Scalars['Int']['output']>;
  country?: Maybe<Scalars['String']['output']>;
};

export type GitConfiguration = {
  __typename?: 'GitConfiguration';
  branch?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  root?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type Group = {
  __typename?: 'Group';
  description?: Maybe<Scalars['String']['output']>;
  global?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type GroupAttributes = {
  description?: InputMaybe<Scalars['String']['input']>;
  global?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type GroupConnection = {
  __typename?: 'GroupConnection';
  edges?: Maybe<Array<Maybe<GroupEdge>>>;
  pageInfo: PageInfo;
};

export type GroupEdge = {
  __typename?: 'GroupEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Group>;
};

export type GroupMember = {
  __typename?: 'GroupMember';
  group?: Maybe<Group>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type GroupMemberConnection = {
  __typename?: 'GroupMemberConnection';
  edges?: Maybe<Array<Maybe<GroupMemberEdge>>>;
  pageInfo: PageInfo;
};

export type GroupMemberEdge = {
  __typename?: 'GroupMemberEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<GroupMember>;
};

export type GroupedTag = {
  __typename?: 'GroupedTag';
  count: Scalars['Int']['output'];
  tag: Scalars['String']['output'];
};

export type GroupedTagConnection = {
  __typename?: 'GroupedTagConnection';
  edges?: Maybe<Array<Maybe<GroupedTagEdge>>>;
  pageInfo: PageInfo;
};

export type GroupedTagEdge = {
  __typename?: 'GroupedTagEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<GroupedTag>;
};

export type ImageDependency = {
  __typename?: 'ImageDependency';
  id: Scalars['ID']['output'];
  image: DockerImage;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  version: Version;
};

export enum ImageGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F'
}

export type ImageLayer = {
  __typename?: 'ImageLayer';
  diffId?: Maybe<Scalars['String']['output']>;
  digest?: Maybe<Scalars['String']['output']>;
};

export type ImpersonationPolicy = {
  __typename?: 'ImpersonationPolicy';
  bindings?: Maybe<Array<Maybe<ImpersonationPolicyBinding>>>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ImpersonationPolicyAttributes = {
  bindings?: InputMaybe<Array<InputMaybe<ImpersonationPolicyBindingAttributes>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type ImpersonationPolicyBinding = {
  __typename?: 'ImpersonationPolicyBinding';
  group?: Maybe<Group>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type ImpersonationPolicyBindingAttributes = {
  groupId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type Incident = {
  __typename?: 'Incident';
  clusterInformation?: Maybe<ClusterInformation>;
  creator: User;
  description?: Maybe<Scalars['String']['output']>;
  files?: Maybe<FileConnection>;
  follower?: Maybe<Follower>;
  followers?: Maybe<FollowerConnection>;
  history?: Maybe<IncidentHistoryConnection>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  messages?: Maybe<IncidentMessageConnection>;
  nextResponseAt?: Maybe<Scalars['DateTime']['output']>;
  notificationCount?: Maybe<Scalars['Int']['output']>;
  owner?: Maybe<User>;
  postmortem?: Maybe<Postmortem>;
  repository: Repository;
  severity: Scalars['Int']['output'];
  status: IncidentStatus;
  subscription?: Maybe<SlimSubscription>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type IncidentFilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type IncidentFollowersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type IncidentHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type IncidentMessagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export enum IncidentAction {
  Accept = 'ACCEPT',
  Complete = 'COMPLETE',
  Create = 'CREATE',
  Edit = 'EDIT',
  Severity = 'SEVERITY',
  Status = 'STATUS'
}

export type IncidentAttributes = {
  clusterInformation?: InputMaybe<ClusterInformationAttributes>;
  description?: InputMaybe<Scalars['String']['input']>;
  severity?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<IncidentStatus>;
  tags?: InputMaybe<Array<InputMaybe<TagAttributes>>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type IncidentChange = {
  __typename?: 'IncidentChange';
  key: Scalars['String']['output'];
  next?: Maybe<Scalars['String']['output']>;
  prev?: Maybe<Scalars['String']['output']>;
};

export type IncidentConnection = {
  __typename?: 'IncidentConnection';
  edges?: Maybe<Array<Maybe<IncidentEdge>>>;
  pageInfo: PageInfo;
};

export type IncidentDelta = {
  __typename?: 'IncidentDelta';
  delta?: Maybe<Delta>;
  payload?: Maybe<Incident>;
};

export type IncidentEdge = {
  __typename?: 'IncidentEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Incident>;
};

export type IncidentFilter = {
  statuses?: InputMaybe<Array<InputMaybe<IncidentStatus>>>;
  type: IncidentFilterType;
  value?: InputMaybe<Scalars['String']['input']>;
};

export enum IncidentFilterType {
  Following = 'FOLLOWING',
  Notifications = 'NOTIFICATIONS',
  Status = 'STATUS',
  Tag = 'TAG'
}

export type IncidentHistory = {
  __typename?: 'IncidentHistory';
  action: IncidentAction;
  actor: User;
  changes?: Maybe<Array<Maybe<IncidentChange>>>;
  id: Scalars['ID']['output'];
  incident: Incident;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type IncidentHistoryConnection = {
  __typename?: 'IncidentHistoryConnection';
  edges?: Maybe<Array<Maybe<IncidentHistoryEdge>>>;
  pageInfo: PageInfo;
};

export type IncidentHistoryEdge = {
  __typename?: 'IncidentHistoryEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<IncidentHistory>;
};

export type IncidentMessage = {
  __typename?: 'IncidentMessage';
  creator: User;
  entities?: Maybe<Array<Maybe<MessageEntity>>>;
  file?: Maybe<File>;
  id: Scalars['ID']['output'];
  incident: Incident;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  reactions?: Maybe<Array<Maybe<Reaction>>>;
  text: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type IncidentMessageAttributes = {
  entities?: InputMaybe<Array<InputMaybe<EntityAttributes>>>;
  file?: InputMaybe<FileAttributes>;
  text: Scalars['String']['input'];
};

export type IncidentMessageConnection = {
  __typename?: 'IncidentMessageConnection';
  edges?: Maybe<Array<Maybe<IncidentMessageEdge>>>;
  pageInfo: PageInfo;
};

export type IncidentMessageDelta = {
  __typename?: 'IncidentMessageDelta';
  delta?: Maybe<Delta>;
  payload?: Maybe<IncidentMessage>;
};

export type IncidentMessageEdge = {
  __typename?: 'IncidentMessageEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<IncidentMessage>;
};

export enum IncidentSort {
  InsertedAt = 'INSERTED_AT',
  Severity = 'SEVERITY',
  Status = 'STATUS',
  Title = 'TITLE'
}

export enum IncidentStatus {
  Complete = 'COMPLETE',
  InProgress = 'IN_PROGRESS',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

/** An installation of an application. */
export type Installation = {
  __typename?: 'Installation';
  acmeKeyId?: Maybe<Scalars['String']['output']>;
  acmeSecret?: Maybe<Scalars['String']['output']>;
  /** Whether the application should auto upgrade. */
  autoUpgrade?: Maybe<Scalars['Boolean']['output']>;
  /** A YAML object of context. */
  context?: Maybe<Scalars['Map']['output']>;
  /** The installation's ID. */
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  license?: Maybe<Scalars['String']['output']>;
  /** The license key for the application. */
  licenseKey?: Maybe<Scalars['String']['output']>;
  locked?: Maybe<Scalars['Boolean']['output']>;
  /** The OIDC provider for the application. */
  oidcProvider?: Maybe<OidcProvider>;
  /** The last ping time of an installed application. */
  pingedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The application that was installed. */
  repository?: Maybe<Repository>;
  /** The subscription for the application. */
  subscription?: Maybe<RepositorySubscription>;
  synced?: Maybe<Scalars['Boolean']['output']>;
  /** The tag to track for auto upgrades. */
  trackTag: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user that installed the application. */
  user?: Maybe<User>;
};

/** Input for creating or updating the tag attributes of an application installation. */
export type InstallationAttributes = {
  /** Whether the application should auto upgrade. */
  autoUpgrade?: InputMaybe<Scalars['Boolean']['input']>;
  /** A YAML object of context. */
  context?: InputMaybe<Scalars['Yaml']['input']>;
  /** The tag to track for auto upgrades. */
  trackTag?: InputMaybe<Scalars['String']['input']>;
};

export type InstallationConnection = {
  __typename?: 'InstallationConnection';
  edges?: Maybe<Array<Maybe<InstallationEdge>>>;
  pageInfo: PageInfo;
};

export type InstallationEdge = {
  __typename?: 'InstallationEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Installation>;
};

export type Integration = {
  __typename?: 'Integration';
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  publisher?: Maybe<Publisher>;
  repository?: Maybe<Repository>;
  sourceUrl?: Maybe<Scalars['String']['output']>;
  spec?: Maybe<Scalars['Map']['output']>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type IntegrationAttributes = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  name: Scalars['String']['input'];
  sourceUrl?: InputMaybe<Scalars['String']['input']>;
  spec?: InputMaybe<Scalars['Yaml']['input']>;
  tags?: InputMaybe<Array<InputMaybe<TagAttributes>>>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type IntegrationConnection = {
  __typename?: 'IntegrationConnection';
  edges?: Maybe<Array<Maybe<IntegrationEdge>>>;
  pageInfo: PageInfo;
};

export type IntegrationEdge = {
  __typename?: 'IntegrationEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Integration>;
};

export type IntegrationWebhook = {
  __typename?: 'IntegrationWebhook';
  account?: Maybe<Account>;
  actions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  logs?: Maybe<WebhookLogConnection>;
  name: Scalars['String']['output'];
  secret: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url: Scalars['String']['output'];
};


export type IntegrationWebhookLogsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type IntegrationWebhookAttributes = {
  actions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type IntegrationWebhookConnection = {
  __typename?: 'IntegrationWebhookConnection';
  edges?: Maybe<Array<Maybe<IntegrationWebhookEdge>>>;
  pageInfo: PageInfo;
};

export type IntegrationWebhookEdge = {
  __typename?: 'IntegrationWebhookEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<IntegrationWebhook>;
};

export type Invite = {
  __typename?: 'Invite';
  account?: Maybe<Account>;
  admin?: Maybe<Scalars['Boolean']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  existing: Scalars['Boolean']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  groups?: Maybe<Array<Maybe<Group>>>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  secureId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type InviteAttributes = {
  admin?: InputMaybe<Scalars['Boolean']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  inviteGroups?: InputMaybe<Array<InputMaybe<BindingAttributes>>>;
  oidcProviderId?: InputMaybe<Scalars['ID']['input']>;
  serviceAccountId?: InputMaybe<Scalars['ID']['input']>;
};

export type InviteConnection = {
  __typename?: 'InviteConnection';
  edges?: Maybe<Array<Maybe<InviteEdge>>>;
  pageInfo: PageInfo;
};

export type InviteEdge = {
  __typename?: 'InviteEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Invite>;
};

export type Invoice = {
  __typename?: 'Invoice';
  amountDue: Scalars['Int']['output'];
  amountPaid: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currency: Scalars['String']['output'];
  hostedInvoiceUrl?: Maybe<Scalars['String']['output']>;
  lines?: Maybe<Array<Maybe<InvoiceItem>>>;
  number: Scalars['String']['output'];
  paymentIntent?: Maybe<PaymentIntent>;
  status?: Maybe<Scalars['String']['output']>;
};

export type InvoiceConnection = {
  __typename?: 'InvoiceConnection';
  edges?: Maybe<Array<Maybe<InvoiceEdge>>>;
  pageInfo: PageInfo;
};

export type InvoiceEdge = {
  __typename?: 'InvoiceEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Invoice>;
};

export type InvoiceItem = {
  __typename?: 'InvoiceItem';
  amount: Scalars['Int']['output'];
  currency: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
};

export type KeyBackup = {
  __typename?: 'KeyBackup';
  digest: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  repositories?: Maybe<Array<Scalars['String']['output']>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user: User;
  value: Scalars['String']['output'];
};

export type KeyBackupAttributes = {
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
  repositories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type KeyBackupConnection = {
  __typename?: 'KeyBackupConnection';
  edges?: Maybe<Array<Maybe<KeyBackupEdge>>>;
  pageInfo: PageInfo;
};

export type KeyBackupEdge = {
  __typename?: 'KeyBackupEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<KeyBackup>;
};

export type License = {
  __typename?: 'License';
  name?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type Limit = {
  __typename?: 'Limit';
  dimension: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type LimitAttributes = {
  dimension: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
};

export type LineItem = {
  __typename?: 'LineItem';
  cost: Scalars['Int']['output'];
  dimension: Scalars['String']['output'];
  name: Scalars['String']['output'];
  period?: Maybe<Scalars['String']['output']>;
  type?: Maybe<PlanType>;
};

export type LineItemAttributes = {
  cost: Scalars['Int']['input'];
  dimension: Scalars['String']['input'];
  name: Scalars['String']['input'];
  period: Scalars['String']['input'];
  type?: InputMaybe<PlanType>;
};

export enum LineItemDimension {
  Cluster = 'CLUSTER',
  User = 'USER'
}

export type LockAttributes = {
  lock: Scalars['String']['input'];
};

export enum LoginMethod {
  Github = 'GITHUB',
  Google = 'GOOGLE',
  Password = 'PASSWORD',
  Passwordless = 'PASSWORDLESS',
  Sso = 'SSO'
}

export type LoginMethodResponse = {
  __typename?: 'LoginMethodResponse';
  authorizeUrl?: Maybe<Scalars['String']['output']>;
  loginMethod: LoginMethod;
  token?: Maybe<Scalars['String']['output']>;
};

export type LoginRequest = {
  __typename?: 'LoginRequest';
  requestedScope?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  subject?: Maybe<Scalars['String']['output']>;
};

export enum MediaType {
  Audio = 'AUDIO',
  Image = 'IMAGE',
  Other = 'OTHER',
  Pdf = 'PDF',
  Video = 'VIDEO'
}

export type MeetingAttributes = {
  incidentId?: InputMaybe<Scalars['ID']['input']>;
  topic: Scalars['String']['input'];
};

export type MessageEntity = {
  __typename?: 'MessageEntity';
  endIndex?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  startIndex?: Maybe<Scalars['Int']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  type: MessageEntityType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export enum MessageEntityType {
  Emoji = 'EMOJI',
  Mention = 'MENTION'
}

export type Metric = {
  __typename?: 'Metric';
  name: Scalars['String']['output'];
  tags?: Maybe<Array<Maybe<MetricTag>>>;
  values?: Maybe<Array<Maybe<MetricValue>>>;
};

export type MetricTag = {
  __typename?: 'MetricTag';
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type MetricValue = {
  __typename?: 'MetricValue';
  time?: Maybe<Scalars['DateTime']['output']>;
  value?: Maybe<Scalars['Int']['output']>;
};

export type NetworkConfiguration = {
  __typename?: 'NetworkConfiguration';
  pluralDns?: Maybe<Scalars['Boolean']['output']>;
  subdomain?: Maybe<Scalars['String']['output']>;
};

export type NextAction = {
  __typename?: 'NextAction';
  redirectToUrl?: Maybe<RedirectToUrl>;
  type?: Maybe<Scalars['String']['output']>;
};

export type Notification = {
  __typename?: 'Notification';
  actor: User;
  id: Scalars['ID']['output'];
  incident?: Maybe<Incident>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  message?: Maybe<IncidentMessage>;
  msg?: Maybe<Scalars['String']['output']>;
  repository?: Maybe<Repository>;
  type: NotificationType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user: User;
};

export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  edges?: Maybe<Array<Maybe<NotificationEdge>>>;
  pageInfo: PageInfo;
};

export type NotificationEdge = {
  __typename?: 'NotificationEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Notification>;
};

export type NotificationPreferences = {
  __typename?: 'NotificationPreferences';
  incidentUpdate?: Maybe<Scalars['Boolean']['output']>;
  mention?: Maybe<Scalars['Boolean']['output']>;
  message?: Maybe<Scalars['Boolean']['output']>;
};

export type NotificationPreferencesAttributes = {
  incidentUpdate: Scalars['Boolean']['input'];
  mention: Scalars['Boolean']['input'];
  message: Scalars['Boolean']['input'];
};

export enum NotificationType {
  IncidentUpdate = 'INCIDENT_UPDATE',
  Locked = 'LOCKED',
  Mention = 'MENTION',
  Message = 'MESSAGE',
  Pending = 'PENDING'
}

export type OauthAttributes = {
  code?: InputMaybe<Scalars['String']['input']>;
  redirectUri?: InputMaybe<Scalars['String']['input']>;
  service?: InputMaybe<OauthService>;
};

export type OauthInfo = {
  __typename?: 'OauthInfo';
  authorizeUrl: Scalars['String']['output'];
  provider: OauthProvider;
};

export type OauthIntegration = {
  __typename?: 'OauthIntegration';
  account?: Maybe<Account>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  service: OauthService;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum OauthProvider {
  Github = 'GITHUB',
  Gitlab = 'GITLAB',
  Google = 'GOOGLE'
}

export type OauthResponse = {
  __typename?: 'OauthResponse';
  redirectTo: Scalars['String']['output'];
};

export enum OauthService {
  Zoom = 'ZOOM'
}

export type OauthSettings = {
  __typename?: 'OauthSettings';
  authMethod: OidcAuthMethod;
  uriFormat: Scalars['String']['output'];
};

/** Input for the application's OAuth settings. */
export type OauthSettingsAttributes = {
  /** The authentication method for the OAuth provider. */
  authMethod: OidcAuthMethod;
  /** The URI format for the OAuth provider. */
  uriFormat: Scalars['String']['input'];
};

/** Input for creating or updating the OIDC attributes of an application installation. */
export type OidcAttributes = {
  /** The authentication method for the OIDC provider. */
  authMethod: OidcAuthMethod;
  /** The users or groups that can login through the OIDC provider. */
  bindings?: InputMaybe<Array<InputMaybe<BindingAttributes>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** The redirect URIs for the OIDC provider. */
  redirectUris?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Supported OIDC authentication methods. */
export enum OidcAuthMethod {
  Basic = 'BASIC',
  Post = 'POST'
}

export type OidcLogin = {
  __typename?: 'OidcLogin';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<User>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type OidcLoginConnection = {
  __typename?: 'OidcLoginConnection';
  edges?: Maybe<Array<Maybe<OidcLoginEdge>>>;
  pageInfo: PageInfo;
};

export type OidcLoginEdge = {
  __typename?: 'OidcLoginEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<OidcLogin>;
};

export type OidcProvider = {
  __typename?: 'OidcProvider';
  authMethod: OidcAuthMethod;
  bindings?: Maybe<Array<Maybe<OidcProviderBinding>>>;
  clientId: Scalars['String']['output'];
  clientSecret: Scalars['String']['output'];
  configuration?: Maybe<OuathConfiguration>;
  consent?: Maybe<ConsentRequest>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  invites?: Maybe<Array<Maybe<Invite>>>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<User>;
  redirectUris?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type OidcProviderBinding = {
  __typename?: 'OidcProviderBinding';
  group?: Maybe<Group>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type OidcProviderConnection = {
  __typename?: 'OidcProviderConnection';
  edges?: Maybe<Array<Maybe<OidcProviderEdge>>>;
  pageInfo: PageInfo;
};

export type OidcProviderEdge = {
  __typename?: 'OidcProviderEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<OidcProvider>;
};

export type OidcSettings = {
  __typename?: 'OidcSettings';
  authMethod: OidcAuthMethod;
  domainKey?: Maybe<Scalars['String']['output']>;
  subdomain?: Maybe<Scalars['Boolean']['output']>;
  uriFormat?: Maybe<Scalars['String']['output']>;
  uriFormats?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type OidcSettingsAttributes = {
  authMethod: OidcAuthMethod;
  domainKey?: InputMaybe<Scalars['String']['input']>;
  subdomain?: InputMaybe<Scalars['Boolean']['input']>;
  uriFormat?: InputMaybe<Scalars['String']['input']>;
  uriFormats?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type OidcStepResponse = {
  __typename?: 'OidcStepResponse';
  consent?: Maybe<ConsentRequest>;
  login?: Maybe<LoginRequest>;
  repository?: Maybe<Repository>;
};

export type OidcTrustRelationship = {
  __typename?: 'OidcTrustRelationship';
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  issuer: Scalars['String']['output'];
  scopes?: Maybe<Array<Scalars['String']['output']>>;
  trust: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type OnboardingChecklist = {
  __typename?: 'OnboardingChecklist';
  dismissed?: Maybe<Scalars['Boolean']['output']>;
  status?: Maybe<OnboardingChecklistState>;
};

export type OnboardingChecklistAttributes = {
  dismissed?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<OnboardingChecklistState>;
};

export enum OnboardingChecklistState {
  Configured = 'CONFIGURED',
  ConsoleInstalled = 'CONSOLE_INSTALLED',
  Finished = 'FINISHED',
  New = 'NEW'
}

export enum OnboardingState {
  Active = 'ACTIVE',
  Installed = 'INSTALLED',
  New = 'NEW',
  Onboarded = 'ONBOARDED'
}

export enum Operation {
  Eq = 'EQ',
  Gt = 'GT',
  Gte = 'GTE',
  Lt = 'LT',
  Lte = 'LTE',
  Not = 'NOT',
  Prefix = 'PREFIX',
  Suffix = 'SUFFIX'
}

export enum Order {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type OuathConfiguration = {
  __typename?: 'OuathConfiguration';
  authorizationEndpoint?: Maybe<Scalars['String']['output']>;
  issuer?: Maybe<Scalars['String']['output']>;
  jwksUri?: Maybe<Scalars['String']['output']>;
  tokenEndpoint?: Maybe<Scalars['String']['output']>;
  userinfoEndpoint?: Maybe<Scalars['String']['output']>;
};

export type PackageScan = {
  __typename?: 'PackageScan';
  errors?: Maybe<Array<Maybe<ScanError>>>;
  grade?: Maybe<ImageGrade>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  violations?: Maybe<Array<Maybe<ScanViolation>>>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaymentIntent = {
  __typename?: 'PaymentIntent';
  amount?: Maybe<Scalars['Int']['output']>;
  captureMethod?: Maybe<Scalars['String']['output']>;
  clientSecret?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  nextAction?: Maybe<NextAction>;
  status?: Maybe<Scalars['String']['output']>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  card?: Maybe<Card>;
  id?: Maybe<Scalars['String']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type PaymentMethodConnection = {
  __typename?: 'PaymentMethodConnection';
  edges?: Maybe<Array<Maybe<PaymentMethodEdge>>>;
  pageInfo: PageInfo;
};

export type PaymentMethodEdge = {
  __typename?: 'PaymentMethodEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<PaymentMethod>;
};

export enum PaymentPeriod {
  Monthly = 'MONTHLY',
  Yearly = 'YEARLY'
}

export enum Permission {
  Billing = 'BILLING',
  Install = 'INSTALL',
  Integrations = 'INTEGRATIONS',
  Publish = 'PUBLISH',
  Support = 'SUPPORT',
  Users = 'USERS'
}

export type PersistedToken = {
  __typename?: 'PersistedToken';
  audits?: Maybe<PersistedTokenAuditConnection>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  metrics?: Maybe<Array<Maybe<GeoMetric>>>;
  token?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type PersistedTokenAuditsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type PersistedTokenAudit = {
  __typename?: 'PersistedTokenAudit';
  city?: Maybe<Scalars['String']['output']>;
  count?: Maybe<Scalars['Int']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type PersistedTokenAuditConnection = {
  __typename?: 'PersistedTokenAuditConnection';
  edges?: Maybe<Array<Maybe<PersistedTokenAuditEdge>>>;
  pageInfo: PageInfo;
};

export type PersistedTokenAuditEdge = {
  __typename?: 'PersistedTokenAuditEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<PersistedTokenAudit>;
};

export type PersistedTokenConnection = {
  __typename?: 'PersistedTokenConnection';
  edges?: Maybe<Array<Maybe<PersistedTokenEdge>>>;
  pageInfo: PageInfo;
};

export type PersistedTokenEdge = {
  __typename?: 'PersistedTokenEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<PersistedToken>;
};

export type Plan = {
  __typename?: 'Plan';
  cost: Scalars['Int']['output'];
  default?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  lineItems?: Maybe<PlanLineItems>;
  metadata?: Maybe<PlanMetadata>;
  name: Scalars['String']['output'];
  period?: Maybe<Scalars['String']['output']>;
  serviceLevels?: Maybe<Array<Maybe<ServiceLevel>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  visible: Scalars['Boolean']['output'];
};

export type PlanAttributes = {
  cost: Scalars['Int']['input'];
  default?: InputMaybe<Scalars['Boolean']['input']>;
  lineItems?: InputMaybe<PlanLineItemAttributes>;
  metadata?: InputMaybe<PlanMetadataAttributes>;
  name: Scalars['String']['input'];
  period: Scalars['String']['input'];
  serviceLevels?: InputMaybe<Array<InputMaybe<ServiceLevelAttributes>>>;
};

export type PlanFeature = {
  __typename?: 'PlanFeature';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PlanFeatureAttributes = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type PlanFeatures = {
  __typename?: 'PlanFeatures';
  audit?: Maybe<Scalars['Boolean']['output']>;
  cd?: Maybe<Scalars['Boolean']['output']>;
  databaseManagement?: Maybe<Scalars['Boolean']['output']>;
  userManagement?: Maybe<Scalars['Boolean']['output']>;
  vpn?: Maybe<Scalars['Boolean']['output']>;
};

export type PlanLineItemAttributes = {
  included?: InputMaybe<Array<InputMaybe<LimitAttributes>>>;
  items?: InputMaybe<Array<InputMaybe<LineItemAttributes>>>;
};

export type PlanLineItems = {
  __typename?: 'PlanLineItems';
  included?: Maybe<Array<Maybe<Limit>>>;
  items?: Maybe<Array<Maybe<LineItem>>>;
};

export type PlanMetadata = {
  __typename?: 'PlanMetadata';
  features?: Maybe<Array<Maybe<PlanFeature>>>;
  freeform?: Maybe<Scalars['Map']['output']>;
};

export type PlanMetadataAttributes = {
  features?: InputMaybe<Array<InputMaybe<PlanFeatureAttributes>>>;
  freeform?: InputMaybe<Scalars['Yaml']['input']>;
};

export enum PlanType {
  Licensed = 'LICENSED',
  Metered = 'METERED'
}

export type PlatformMetrics = {
  __typename?: 'PlatformMetrics';
  clusters?: Maybe<Scalars['Int']['output']>;
  publishers?: Maybe<Scalars['Int']['output']>;
  repositories?: Maybe<Scalars['Int']['output']>;
  rollouts?: Maybe<Scalars['Int']['output']>;
};

export type PlatformPlan = {
  __typename?: 'PlatformPlan';
  cost: Scalars['Int']['output'];
  enterprise?: Maybe<Scalars['Boolean']['output']>;
  features?: Maybe<PlanFeatures>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  lineItems?: Maybe<Array<Maybe<PlatformPlanItem>>>;
  name: Scalars['String']['output'];
  period: PaymentPeriod;
  trial?: Maybe<Scalars['Boolean']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  visible: Scalars['Boolean']['output'];
};

export type PlatformPlanItem = {
  __typename?: 'PlatformPlanItem';
  cost: Scalars['Int']['output'];
  dimension: LineItemDimension;
  externalId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  period: PaymentPeriod;
};

export type PlatformSubscription = {
  __typename?: 'PlatformSubscription';
  externalId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  latestInvoice?: Maybe<Invoice>;
  lineItems?: Maybe<Array<Maybe<PlatformSubscriptionLineItems>>>;
  plan?: Maybe<PlatformPlan>;
  trialUntil?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type PlatformSubscriptionLineItems = {
  __typename?: 'PlatformSubscriptionLineItems';
  dimension: LineItemDimension;
  externalId?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
};

export type PluralCloudRegions = {
  __typename?: 'PluralCloudRegions';
  dedicated: CloudRegions;
  shared: CloudRegions;
};

export type PluralCloudSettings = {
  __typename?: 'PluralCloudSettings';
  regions?: Maybe<PluralCloudRegions>;
};

export type PluralConfiguration = {
  __typename?: 'PluralConfiguration';
  gitCommit?: Maybe<Scalars['String']['output']>;
  registry?: Maybe<Scalars['String']['output']>;
  stripeConnectId?: Maybe<Scalars['String']['output']>;
  stripePublishableKey?: Maybe<Scalars['String']['output']>;
};

export type PolicyBinding = {
  __typename?: 'PolicyBinding';
  group?: Maybe<Group>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type Postmortem = {
  __typename?: 'Postmortem';
  actionItems?: Maybe<Array<Maybe<ActionItem>>>;
  content: Scalars['String']['output'];
  creator: User;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type PostmortemAttributes = {
  actionItems?: InputMaybe<Array<InputMaybe<ActionItemAttributes>>>;
  content: Scalars['String']['input'];
};

export enum Provider {
  Aws = 'AWS',
  Azure = 'AZURE',
  Custom = 'CUSTOM',
  Equinix = 'EQUINIX',
  Gcp = 'GCP',
  Generic = 'GENERIC',
  Kind = 'KIND',
  Kubernetes = 'KUBERNETES',
  Linode = 'LINODE'
}

export type PublicKey = {
  __typename?: 'PublicKey';
  content: Scalars['String']['output'];
  digest: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user: User;
};

export type PublicKeyAttributes = {
  content: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type PublicKeyConnection = {
  __typename?: 'PublicKeyConnection';
  edges?: Maybe<Array<Maybe<PublicKeyEdge>>>;
  pageInfo: PageInfo;
};

export type PublicKeyEdge = {
  __typename?: 'PublicKeyEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<PublicKey>;
};

export type Publisher = {
  __typename?: 'Publisher';
  address?: Maybe<Address>;
  avatar?: Maybe<Scalars['String']['output']>;
  backgroundColor?: Maybe<Scalars['String']['output']>;
  billingAccountId?: Maybe<Scalars['String']['output']>;
  community?: Maybe<Community>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<User>;
  phone?: Maybe<Scalars['String']['output']>;
  repositories?: Maybe<Array<Maybe<Repository>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type PublisherAttributes = {
  address?: InputMaybe<AddressAttributes>;
  avatar?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  community?: InputMaybe<CommunityAttributes>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type PublisherConnection = {
  __typename?: 'PublisherConnection';
  edges?: Maybe<Array<Maybe<PublisherEdge>>>;
  pageInfo: PageInfo;
};

export type PublisherEdge = {
  __typename?: 'PublisherEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Publisher>;
};

export type Reaction = {
  __typename?: 'Reaction';
  creator: User;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  message: IncidentMessage;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Recipe = {
  __typename?: 'Recipe';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  oidcEnabled?: Maybe<Scalars['Boolean']['output']>;
  oidcSettings?: Maybe<OidcSettings>;
  primary?: Maybe<Scalars['Boolean']['output']>;
  private?: Maybe<Scalars['Boolean']['output']>;
  provider?: Maybe<Provider>;
  recipeDependencies?: Maybe<Array<Maybe<Recipe>>>;
  recipeSections?: Maybe<Array<Maybe<RecipeSection>>>;
  repository?: Maybe<Repository>;
  restricted?: Maybe<Scalars['Boolean']['output']>;
  tests?: Maybe<Array<Maybe<RecipeTest>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RecipeAttributes = {
  dependencies?: InputMaybe<Array<InputMaybe<RecipeReference>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  oidcSettings?: InputMaybe<OidcSettingsAttributes>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
  private?: InputMaybe<Scalars['Boolean']['input']>;
  provider?: InputMaybe<Provider>;
  restricted?: InputMaybe<Scalars['Boolean']['input']>;
  sections?: InputMaybe<Array<InputMaybe<RecipeSectionAttributes>>>;
  tests?: InputMaybe<Array<InputMaybe<RecipeTestAttributes>>>;
};

export type RecipeCondition = {
  __typename?: 'RecipeCondition';
  field: Scalars['String']['output'];
  operation: Operation;
  value?: Maybe<Scalars['String']['output']>;
};

export type RecipeConditionAttributes = {
  field: Scalars['String']['input'];
  operation: Operation;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type RecipeConfiguration = {
  __typename?: 'RecipeConfiguration';
  args?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  condition?: Maybe<RecipeCondition>;
  default?: Maybe<Scalars['String']['output']>;
  documentation?: Maybe<Scalars['String']['output']>;
  functionName?: Maybe<Scalars['String']['output']>;
  longform?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  optional?: Maybe<Scalars['Boolean']['output']>;
  placeholder?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Datatype>;
  validation?: Maybe<RecipeValidation>;
};

export type RecipeConfigurationAttributes = {
  condition?: InputMaybe<RecipeConditionAttributes>;
  default?: InputMaybe<Scalars['String']['input']>;
  documentation?: InputMaybe<Scalars['String']['input']>;
  functionName?: InputMaybe<Scalars['String']['input']>;
  longform?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  optional?: InputMaybe<Scalars['Boolean']['input']>;
  placeholder?: InputMaybe<Scalars['String']['input']>;
  type: Datatype;
  validation?: InputMaybe<RecipeValidationAttributes>;
};

export type RecipeConnection = {
  __typename?: 'RecipeConnection';
  edges?: Maybe<Array<Maybe<RecipeEdge>>>;
  pageInfo: PageInfo;
};

export type RecipeEdge = {
  __typename?: 'RecipeEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Recipe>;
};

export type RecipeItem = {
  __typename?: 'RecipeItem';
  chart?: Maybe<Chart>;
  configuration?: Maybe<Array<Maybe<RecipeConfiguration>>>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  recipeSection?: Maybe<RecipeSection>;
  terraform?: Maybe<Terraform>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RecipeItemAttributes = {
  configuration?: InputMaybe<Array<InputMaybe<RecipeConfigurationAttributes>>>;
  name: Scalars['String']['input'];
  type: RecipeItemType;
};

export enum RecipeItemType {
  Helm = 'HELM',
  Terraform = 'TERRAFORM'
}

export type RecipeReference = {
  name: Scalars['String']['input'];
  repo: Scalars['String']['input'];
};

export type RecipeSection = {
  __typename?: 'RecipeSection';
  configuration?: Maybe<Array<Maybe<RecipeConfiguration>>>;
  id?: Maybe<Scalars['ID']['output']>;
  index?: Maybe<Scalars['Int']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  recipe?: Maybe<Recipe>;
  recipeItems?: Maybe<Array<Maybe<RecipeItem>>>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RecipeSectionAttributes = {
  configuration?: InputMaybe<Array<InputMaybe<RecipeConfigurationAttributes>>>;
  items?: InputMaybe<Array<InputMaybe<RecipeItemAttributes>>>;
  name: Scalars['String']['input'];
};

export type RecipeTest = {
  __typename?: 'RecipeTest';
  args?: Maybe<Array<Maybe<TestArgument>>>;
  message?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: TestType;
};

export type RecipeTestAttributes = {
  args?: InputMaybe<Array<InputMaybe<TestArgumentAttributes>>>;
  message?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: TestType;
};

export type RecipeValidation = {
  __typename?: 'RecipeValidation';
  message: Scalars['String']['output'];
  regex?: Maybe<Scalars['String']['output']>;
  type: ValidationType;
};

export type RecipeValidationAttributes = {
  message: Scalars['String']['input'];
  regex?: InputMaybe<Scalars['String']['input']>;
  type: ValidationType;
};

export type RedirectToUrl = {
  __typename?: 'RedirectToUrl';
  returnUrl?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** The release status of a repository, defaults to ALPHA, GA if it is ready for general consumption */
export enum ReleaseStatus {
  Alpha = 'ALPHA',
  Beta = 'BETA',
  Ga = 'GA'
}

/** Container for all resources to create an application. */
export type Repository = {
  __typename?: 'Repository';
  /** The artifacts of the application. */
  artifacts?: Maybe<Array<Maybe<Artifact>>>;
  /** The category of the application. */
  category?: Maybe<Category>;
  /** The community links of the application. */
  community?: Maybe<Community>;
  /** The external contributors to this repository */
  contributors?: Maybe<Array<Maybe<Contributor>>>;
  darkIcon?: Maybe<Scalars['String']['output']>;
  /** The default tag to deploy. */
  defaultTag?: Maybe<Scalars['String']['output']>;
  /** The description of the application. */
  description?: Maybe<Scalars['String']['output']>;
  /** The documentation of the application. */
  docs?: Maybe<Array<Maybe<FileContent>>>;
  /** The documentation of the application. */
  documentation?: Maybe<Scalars['String']['output']>;
  /** If the application can be edited by the current user. */
  editable?: Maybe<Scalars['Boolean']['output']>;
  /** The git URL of the application. */
  gitUrl?: Maybe<Scalars['String']['output']>;
  /** The homepage of the application. */
  homepage?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  /** The application's ID. */
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The installation of the application by a user. */
  installation?: Maybe<Installation>;
  /** The license of the application. */
  license?: Maybe<License>;
  /** The main branch of the application. */
  mainBranch?: Maybe<Scalars['String']['output']>;
  /** The name of the application. */
  name: Scalars['String']['output'];
  /** Notes about the application rendered after deploying and displayed to the user. */
  notes?: Maybe<Scalars['String']['output']>;
  /** The OAuth settings for the application. */
  oauthSettings?: Maybe<OauthSettings>;
  /** The available plans for the application. */
  plans?: Maybe<Array<Maybe<Plan>>>;
  /** Whether the application is private. */
  private?: Maybe<Scalars['Boolean']['output']>;
  /** The application's public key. */
  publicKey?: Maybe<Scalars['String']['output']>;
  /** The application publisher. */
  publisher?: Maybe<Publisher>;
  /** The README of the application. */
  readme?: Maybe<Scalars['String']['output']>;
  /** The recipes used to install the application. */
  recipes?: Maybe<Array<Maybe<Recipe>>>;
  /** release status of the repository */
  releaseStatus?: Maybe<ReleaseStatus>;
  /** A map of secrets of the application. */
  secrets?: Maybe<Scalars['Map']['output']>;
  /** The tags of the application. */
  tags?: Maybe<Array<Maybe<Tag>>>;
  /** Whether the application is trending. */
  trending?: Maybe<Scalars['Boolean']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** version tags that can be followed to control upgrade flow */
  upgradeChannels?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Whether the application is verified. */
  verified?: Maybe<Scalars['Boolean']['output']>;
};

/** Input for creating or updating an application's attributes. */
export type RepositoryAttributes = {
  /** The category of the application. */
  category?: InputMaybe<Category>;
  /** The application's community links. */
  community?: InputMaybe<CommunityAttributes>;
  /** List of emails of external users contributing to this repository and who will be granted access */
  contributors?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** The application's dark icon. */
  darkIcon?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  /** The default tag to use when deploying the application. */
  defaultTag?: InputMaybe<Scalars['String']['input']>;
  /** A short description of the application. */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The application's documentation. */
  docs?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  /** A link to the application's documentation. */
  documentation?: InputMaybe<Scalars['String']['input']>;
  /** The application's git URL. */
  gitUrl?: InputMaybe<Scalars['String']['input']>;
  /** The application's homepage. */
  homepage?: InputMaybe<Scalars['String']['input']>;
  /** The application's icon. */
  icon?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  /** The application's integration resource definition. */
  integrationResourceDefinition?: InputMaybe<ResourceDefinitionAttributes>;
  /** The name of the application. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Notes about the application rendered after deploying and displayed to the user. */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** The application's OAuth settings. */
  oauthSettings?: InputMaybe<OauthSettingsAttributes>;
  /** Whether the application is private. */
  private?: InputMaybe<Scalars['Boolean']['input']>;
  /** The application's README. */
  readme?: InputMaybe<Scalars['String']['input']>;
  /** release status of the repository */
  releaseStatus?: InputMaybe<ReleaseStatus>;
  /** A YAML object of secrets. */
  secrets?: InputMaybe<Scalars['Yaml']['input']>;
  /** The application's tags. */
  tags?: InputMaybe<Array<InputMaybe<TagAttributes>>>;
  /** Whether the application is trending. */
  trending?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the application is verified. */
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};

export type RepositoryConnection = {
  __typename?: 'RepositoryConnection';
  edges?: Maybe<Array<Maybe<RepositoryEdge>>>;
  pageInfo: PageInfo;
};

export type RepositoryEdge = {
  __typename?: 'RepositoryEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Repository>;
};

export type RepositorySubscription = {
  __typename?: 'RepositorySubscription';
  customerId?: Maybe<Scalars['String']['output']>;
  externalId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  installation?: Maybe<Installation>;
  invoices?: Maybe<InvoiceConnection>;
  lineItems?: Maybe<SubscriptionLineItems>;
  plan?: Maybe<Plan>;
};


export type RepositorySubscriptionInvoicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type RepositorySubscriptionConnection = {
  __typename?: 'RepositorySubscriptionConnection';
  edges?: Maybe<Array<Maybe<RepositorySubscriptionEdge>>>;
  pageInfo: PageInfo;
};

export type RepositorySubscriptionEdge = {
  __typename?: 'RepositorySubscriptionEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<RepositorySubscription>;
};

export type ResetToken = {
  __typename?: 'ResetToken';
  email: Scalars['String']['output'];
  externalId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  type: ResetTokenType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user: User;
};

export type ResetTokenAttributes = {
  email?: InputMaybe<Scalars['String']['input']>;
  type: ResetTokenType;
};

export type ResetTokenRealization = {
  password?: InputMaybe<Scalars['String']['input']>;
};

export enum ResetTokenType {
  Email = 'EMAIL',
  Password = 'PASSWORD'
}

export type ResourceDefinitionAttributes = {
  name: Scalars['String']['input'];
  spec?: InputMaybe<Array<InputMaybe<SpecificationAttributes>>>;
};

export type Role = {
  __typename?: 'Role';
  account?: Maybe<Account>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  permissions?: Maybe<Array<Maybe<Permission>>>;
  repositories?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  roleBindings?: Maybe<Array<Maybe<RoleBinding>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RoleAttributes = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Array<InputMaybe<Permission>>>;
  repositories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  roleBindings?: InputMaybe<Array<InputMaybe<BindingAttributes>>>;
};

export type RoleBinding = {
  __typename?: 'RoleBinding';
  group?: Maybe<Group>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type RoleConnection = {
  __typename?: 'RoleConnection';
  edges?: Maybe<Array<Maybe<RoleEdge>>>;
  pageInfo: PageInfo;
};

export type RoleEdge = {
  __typename?: 'RoleEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Role>;
};

export type Roles = {
  __typename?: 'Roles';
  admin?: Maybe<Scalars['Boolean']['output']>;
};

export type RolesAttributes = {
  admin?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Rollout = {
  __typename?: 'Rollout';
  count?: Maybe<Scalars['Int']['output']>;
  cursor?: Maybe<Scalars['ID']['output']>;
  event?: Maybe<Scalars['String']['output']>;
  heartbeat?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  repository?: Maybe<Repository>;
  status: RolloutStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RolloutConnection = {
  __typename?: 'RolloutConnection';
  edges?: Maybe<Array<Maybe<RolloutEdge>>>;
  pageInfo: PageInfo;
};

export type RolloutDelta = {
  __typename?: 'RolloutDelta';
  delta?: Maybe<Delta>;
  payload?: Maybe<Rollout>;
};

export type RolloutEdge = {
  __typename?: 'RolloutEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Rollout>;
};

export enum RolloutStatus {
  Finished = 'FINISHED',
  Queued = 'QUEUED',
  Running = 'RUNNING'
}

export type RootMutationType = {
  __typename?: 'RootMutationType';
  acceptIncident?: Maybe<Incident>;
  acceptLogin?: Maybe<OauthResponse>;
  acquireLock?: Maybe<ApplyLock>;
  beginTrial?: Maybe<PlatformSubscription>;
  cancelPlatformSubscription?: Maybe<PlatformSubscription>;
  completeIncident?: Maybe<Incident>;
  createArtifact?: Maybe<Artifact>;
  createCard?: Maybe<Account>;
  /** Create a new cluster. */
  createCluster?: Maybe<Cluster>;
  /** adds a dependency for this cluster to gate future upgrades */
  createClusterDependency?: Maybe<ClusterDependency>;
  createConsoleInstance?: Maybe<ConsoleInstance>;
  createCrd?: Maybe<Crd>;
  createDemoProject?: Maybe<DemoProject>;
  createDnsRecord?: Maybe<DnsRecord>;
  createDomain?: Maybe<DnsDomain>;
  createGroup?: Maybe<Group>;
  createGroupMember?: Maybe<GroupMember>;
  createIncident?: Maybe<Incident>;
  createInstallation?: Maybe<Installation>;
  createIntegration?: Maybe<Integration>;
  createIntegrationWebhook?: Maybe<IntegrationWebhook>;
  createInvite?: Maybe<Invite>;
  createKeyBackup?: Maybe<KeyBackup>;
  createMessage?: Maybe<IncidentMessage>;
  createOauthIntegration?: Maybe<OauthIntegration>;
  createOidcProvider?: Maybe<OidcProvider>;
  createPlan?: Maybe<Plan>;
  createPlatformSubscription?: Maybe<PlatformSubscription>;
  createPublicKey?: Maybe<PublicKey>;
  createPublisher?: Maybe<Publisher>;
  createQueue?: Maybe<UpgradeQueue>;
  createReaction?: Maybe<IncidentMessage>;
  createRecipe?: Maybe<Recipe>;
  createRepository?: Maybe<Repository>;
  createResetToken?: Maybe<Scalars['Boolean']['output']>;
  createRole?: Maybe<Role>;
  createServiceAccount?: Maybe<User>;
  createShell?: Maybe<CloudShell>;
  createStack?: Maybe<Stack>;
  createSubscription?: Maybe<RepositorySubscription>;
  createTerraform?: Maybe<Terraform>;
  createTest?: Maybe<Test>;
  createToken?: Maybe<PersistedToken>;
  createTrustRelationship?: Maybe<OidcTrustRelationship>;
  createUpgrade?: Maybe<Upgrade>;
  createUserEvent?: Maybe<Scalars['Boolean']['output']>;
  createWebhook?: Maybe<Webhook>;
  createZoom?: Maybe<ZoomMeeting>;
  defaultPaymentMethod?: Maybe<Scalars['Boolean']['output']>;
  deleteCard?: Maybe<Account>;
  deleteChartInstallation?: Maybe<ChartInstallation>;
  /** Delete a cluster. */
  deleteCluster?: Maybe<Cluster>;
  /** deletes a dependency for this cluster and potentially disables promotions entirely */
  deleteClusterDependency?: Maybe<ClusterDependency>;
  deleteConsoleInstance?: Maybe<ConsoleInstance>;
  deleteDemoProject?: Maybe<DemoProject>;
  deleteDnsRecord?: Maybe<DnsRecord>;
  deleteDomain?: Maybe<DnsDomain>;
  deleteEabKey?: Maybe<EabCredential>;
  deleteGroup?: Maybe<Group>;
  deleteGroupMember?: Maybe<GroupMember>;
  deleteIncident?: Maybe<Incident>;
  deleteInstallation?: Maybe<Installation>;
  deleteIntegrationWebhook?: Maybe<IntegrationWebhook>;
  deleteInvite?: Maybe<Invite>;
  deleteKeyBackup?: Maybe<KeyBackup>;
  deleteMessage?: Maybe<IncidentMessage>;
  deleteOidcProvider?: Maybe<OidcProvider>;
  deletePaymentMethod?: Maybe<PaymentMethod>;
  deletePlatformSubscription?: Maybe<Account>;
  deletePublicKey?: Maybe<PublicKey>;
  deleteReaction?: Maybe<IncidentMessage>;
  deleteRecipe?: Maybe<Recipe>;
  deleteRepository?: Maybe<Repository>;
  deleteRole?: Maybe<Role>;
  deleteShell?: Maybe<CloudShell>;
  deleteStack?: Maybe<Stack>;
  deleteTerraform?: Maybe<Terraform>;
  deleteToken?: Maybe<PersistedToken>;
  deleteTrustRelationship?: Maybe<OidcTrustRelationship>;
  deleteUser?: Maybe<User>;
  destroyCluster?: Maybe<Scalars['Boolean']['output']>;
  deviceLogin?: Maybe<DeviceLogin>;
  externalToken?: Maybe<Scalars['String']['output']>;
  finalizeCheckout?: Maybe<PlatformSubscription>;
  followIncident?: Maybe<Follower>;
  impersonateServiceAccount?: Maybe<User>;
  initiateCheckout?: Maybe<CheckoutSession>;
  installBundle?: Maybe<Array<Maybe<Installation>>>;
  installChart?: Maybe<ChartInstallation>;
  installRecipe?: Maybe<Array<Maybe<Installation>>>;
  installStack?: Maybe<Array<Maybe<Recipe>>>;
  installStackShell?: Maybe<Array<Maybe<Recipe>>>;
  installTerraform?: Maybe<TerraformInstallation>;
  installVersion?: Maybe<Scalars['Boolean']['output']>;
  linkPublisher?: Maybe<Publisher>;
  login?: Maybe<User>;
  loginToken?: Maybe<User>;
  oauthCallback?: Maybe<User>;
  oauthConsent?: Maybe<OauthResponse>;
  passwordlessLogin?: Maybe<User>;
  pingCluster?: Maybe<Cluster>;
  pingWebhook?: Maybe<WebhookResponse>;
  /** moves up the upgrade waterline for a user */
  promote?: Maybe<User>;
  provisionDomain?: Maybe<DnsDomain>;
  publishLogs?: Maybe<TestStep>;
  quickStack?: Maybe<Stack>;
  readNotifications?: Maybe<Scalars['Int']['output']>;
  realizeInvite?: Maybe<User>;
  realizeResetToken?: Maybe<Scalars['Boolean']['output']>;
  rebootShell?: Maybe<CloudShell>;
  release?: Maybe<Scalars['Boolean']['output']>;
  releaseLock?: Maybe<ApplyLock>;
  resetInstallations?: Maybe<Scalars['Int']['output']>;
  restartShell?: Maybe<Scalars['Boolean']['output']>;
  setupIntent?: Maybe<SetupIntent>;
  setupShell?: Maybe<CloudShell>;
  signup?: Maybe<User>;
  ssoCallback?: Maybe<User>;
  stopShell?: Maybe<Scalars['Boolean']['output']>;
  synced?: Maybe<Scalars['Boolean']['output']>;
  transferDemoProject?: Maybe<DemoProject>;
  /** transfers ownership of a cluster to a service account */
  transferOwnership?: Maybe<Cluster>;
  unfollowIncident?: Maybe<Follower>;
  uninstallTerraform?: Maybe<TerraformInstallation>;
  unlockRepository?: Maybe<Scalars['Int']['output']>;
  updateAccount?: Maybe<Account>;
  updateChart?: Maybe<Chart>;
  updateChartInstallation?: Maybe<ChartInstallation>;
  updateConsoleInstance?: Maybe<ConsoleInstance>;
  updateDockerRepository?: Maybe<DockerRepository>;
  updateDomain?: Maybe<DnsDomain>;
  updateGroup?: Maybe<Group>;
  updateIncident?: Maybe<Incident>;
  updateInstallation?: Maybe<Installation>;
  updateIntegrationWebhook?: Maybe<IntegrationWebhook>;
  updateLineItem?: Maybe<RepositorySubscription>;
  updateMessage?: Maybe<IncidentMessage>;
  updateOidcProvider?: Maybe<OidcProvider>;
  updatePlan?: Maybe<RepositorySubscription>;
  updatePlanAttributes?: Maybe<Plan>;
  updatePlatformPlan?: Maybe<PlatformSubscription>;
  updatePublisher?: Maybe<Publisher>;
  updateRepository?: Maybe<Repository>;
  updateRole?: Maybe<Role>;
  updateServiceAccount?: Maybe<User>;
  updateShell?: Maybe<CloudShell>;
  updateShellConfiguration?: Maybe<Scalars['Boolean']['output']>;
  updateStep?: Maybe<TestStep>;
  updateTerraform?: Maybe<Terraform>;
  updateTest?: Maybe<Test>;
  updateUser?: Maybe<User>;
  updateVersion?: Maybe<Version>;
  uploadTerraform?: Maybe<Terraform>;
  upsertOidcProvider?: Maybe<OidcProvider>;
  upsertRepository?: Maybe<Repository>;
};


export type RootMutationTypeAcceptIncidentArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeAcceptLoginArgs = {
  challenge: Scalars['String']['input'];
};


export type RootMutationTypeAcquireLockArgs = {
  repository: Scalars['String']['input'];
};


export type RootMutationTypeCompleteIncidentArgs = {
  id: Scalars['ID']['input'];
  postmortem: PostmortemAttributes;
};


export type RootMutationTypeCreateArtifactArgs = {
  attributes: ArtifactAttributes;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
  repositoryName?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeCreateCardArgs = {
  address?: InputMaybe<AddressAttributes>;
  source: Scalars['String']['input'];
};


export type RootMutationTypeCreateClusterArgs = {
  attributes: ClusterAttributes;
};


export type RootMutationTypeCreateClusterDependencyArgs = {
  destId: Scalars['ID']['input'];
  sourceId: Scalars['ID']['input'];
};


export type RootMutationTypeCreateConsoleInstanceArgs = {
  attributes: ConsoleInstanceAttributes;
};


export type RootMutationTypeCreateCrdArgs = {
  attributes: CrdAttributes;
  chartId?: InputMaybe<Scalars['ID']['input']>;
  chartName?: InputMaybe<ChartName>;
};


export type RootMutationTypeCreateDnsRecordArgs = {
  attributes: DnsRecordAttributes;
  cluster: Scalars['String']['input'];
  provider: Provider;
};


export type RootMutationTypeCreateDomainArgs = {
  attributes: DnsDomainAttributes;
};


export type RootMutationTypeCreateGroupArgs = {
  attributes: GroupAttributes;
};


export type RootMutationTypeCreateGroupMemberArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type RootMutationTypeCreateIncidentArgs = {
  attributes: IncidentAttributes;
  repository?: InputMaybe<Scalars['String']['input']>;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeCreateInstallationArgs = {
  repositoryId: Scalars['ID']['input'];
};


export type RootMutationTypeCreateIntegrationArgs = {
  attributes: IntegrationAttributes;
  repositoryName: Scalars['String']['input'];
};


export type RootMutationTypeCreateIntegrationWebhookArgs = {
  attributes: IntegrationWebhookAttributes;
};


export type RootMutationTypeCreateInviteArgs = {
  attributes: InviteAttributes;
};


export type RootMutationTypeCreateKeyBackupArgs = {
  attributes: KeyBackupAttributes;
};


export type RootMutationTypeCreateMessageArgs = {
  attributes: IncidentMessageAttributes;
  incidentId: Scalars['ID']['input'];
};


export type RootMutationTypeCreateOauthIntegrationArgs = {
  attributes: OauthAttributes;
};


export type RootMutationTypeCreateOidcProviderArgs = {
  attributes: OidcAttributes;
  installationId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeCreatePlanArgs = {
  attributes: PlanAttributes;
  repositoryId: Scalars['ID']['input'];
};


export type RootMutationTypeCreatePlatformSubscriptionArgs = {
  billingAddress?: InputMaybe<AddressAttributes>;
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['ID']['input'];
};


export type RootMutationTypeCreatePublicKeyArgs = {
  attributes: PublicKeyAttributes;
};


export type RootMutationTypeCreatePublisherArgs = {
  attributes: PublisherAttributes;
};


export type RootMutationTypeCreateQueueArgs = {
  attributes: UpgradeQueueAttributes;
};


export type RootMutationTypeCreateReactionArgs = {
  messageId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type RootMutationTypeCreateRecipeArgs = {
  attributes: RecipeAttributes;
  repositoryId?: InputMaybe<Scalars['String']['input']>;
  repositoryName?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeCreateRepositoryArgs = {
  attributes: RepositoryAttributes;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeCreateResetTokenArgs = {
  attributes: ResetTokenAttributes;
};


export type RootMutationTypeCreateRoleArgs = {
  attributes: RoleAttributes;
};


export type RootMutationTypeCreateServiceAccountArgs = {
  attributes: ServiceAccountAttributes;
};


export type RootMutationTypeCreateShellArgs = {
  attributes: CloudShellAttributes;
};


export type RootMutationTypeCreateStackArgs = {
  attributes: StackAttributes;
};


export type RootMutationTypeCreateSubscriptionArgs = {
  attributes?: InputMaybe<SubscriptionAttributes>;
  installationId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
};


export type RootMutationTypeCreateTerraformArgs = {
  attributes: TerraformAttributes;
  repositoryId: Scalars['ID']['input'];
};


export type RootMutationTypeCreateTestArgs = {
  attributes: TestAttributes;
  name?: InputMaybe<Scalars['String']['input']>;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeCreateTrustRelationshipArgs = {
  attributes: TrustRelationshipAttributes;
};


export type RootMutationTypeCreateUpgradeArgs = {
  attributes: UpgradeAttributes;
  queue: Scalars['String']['input'];
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
  repositoryName?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeCreateUserEventArgs = {
  attributes: UserEventAttributes;
};


export type RootMutationTypeCreateWebhookArgs = {
  attributes: WebhookAttributes;
};


export type RootMutationTypeCreateZoomArgs = {
  attributes: MeetingAttributes;
};


export type RootMutationTypeDefaultPaymentMethodArgs = {
  id: Scalars['String']['input'];
};


export type RootMutationTypeDeleteCardArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteChartInstallationArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteClusterArgs = {
  name: Scalars['String']['input'];
  provider: Provider;
};


export type RootMutationTypeDeleteClusterDependencyArgs = {
  destId: Scalars['ID']['input'];
  sourceId: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteConsoleInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteDnsRecordArgs = {
  name: Scalars['String']['input'];
  type: DnsRecordType;
};


export type RootMutationTypeDeleteDomainArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteEabKeyArgs = {
  cluster?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  provider?: InputMaybe<Provider>;
};


export type RootMutationTypeDeleteGroupArgs = {
  groupId: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteGroupMemberArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteIncidentArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteInstallationArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteIntegrationWebhookArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteInviteArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  secureId?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeDeleteKeyBackupArgs = {
  name: Scalars['String']['input'];
};


export type RootMutationTypeDeleteMessageArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteOidcProviderArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeletePaymentMethodArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeletePublicKeyArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteReactionArgs = {
  messageId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type RootMutationTypeDeleteRecipeArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteRepositoryArgs = {
  repositoryId: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteRoleArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteStackArgs = {
  name: Scalars['String']['input'];
};


export type RootMutationTypeDeleteTerraformArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteTokenArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteTrustRelationshipArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDestroyClusterArgs = {
  domain: Scalars['String']['input'];
  name: Scalars['String']['input'];
  provider: Provider;
};


export type RootMutationTypeFinalizeCheckoutArgs = {
  sessionId: Scalars['String']['input'];
};


export type RootMutationTypeFollowIncidentArgs = {
  attributes: FollowerAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeImpersonateServiceAccountArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeInstallBundleArgs = {
  context: ContextAttributes;
  name: Scalars['String']['input'];
  oidc: Scalars['Boolean']['input'];
  repo: Scalars['String']['input'];
};


export type RootMutationTypeInstallChartArgs = {
  attributes: ChartInstallationAttributes;
  installationId: Scalars['ID']['input'];
};


export type RootMutationTypeInstallRecipeArgs = {
  context: Scalars['Map']['input'];
  recipeId: Scalars['ID']['input'];
};


export type RootMutationTypeInstallStackArgs = {
  name: Scalars['String']['input'];
  provider: Provider;
};


export type RootMutationTypeInstallStackShellArgs = {
  context: ContextAttributes;
  name: Scalars['String']['input'];
  oidc: Scalars['Boolean']['input'];
};


export type RootMutationTypeInstallTerraformArgs = {
  attributes: TerraformInstallationAttributes;
  installationId: Scalars['ID']['input'];
};


export type RootMutationTypeInstallVersionArgs = {
  package: Scalars['String']['input'];
  repository: Scalars['String']['input'];
  type: DependencyType;
  vsn: Scalars['String']['input'];
};


export type RootMutationTypeLinkPublisherArgs = {
  token: Scalars['String']['input'];
};


export type RootMutationTypeLoginArgs = {
  captcha: Scalars['String']['input'];
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type RootMutationTypeLoginTokenArgs = {
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
};


export type RootMutationTypeOauthCallbackArgs = {
  code: Scalars['String']['input'];
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  host?: InputMaybe<Scalars['String']['input']>;
  provider: OauthProvider;
};


export type RootMutationTypeOauthConsentArgs = {
  challenge: Scalars['String']['input'];
  scopes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RootMutationTypePasswordlessLoginArgs = {
  token: Scalars['String']['input'];
};


export type RootMutationTypePingClusterArgs = {
  attributes: ClusterPingAttributes;
};


export type RootMutationTypePingWebhookArgs = {
  id: Scalars['ID']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  repo: Scalars['String']['input'];
};


export type RootMutationTypeProvisionDomainArgs = {
  name: Scalars['String']['input'];
};


export type RootMutationTypePublishLogsArgs = {
  id: Scalars['ID']['input'];
  logs: Scalars['String']['input'];
};


export type RootMutationTypeQuickStackArgs = {
  provider: Provider;
  repositoryIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type RootMutationTypeReadNotificationsArgs = {
  incidentId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeRealizeInviteArgs = {
  id: Scalars['String']['input'];
};


export type RootMutationTypeRealizeResetTokenArgs = {
  attributes: ResetTokenRealization;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeReleaseArgs = {
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
  repositoryName?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RootMutationTypeReleaseLockArgs = {
  attributes: LockAttributes;
  repository: Scalars['String']['input'];
};


export type RootMutationTypeSetupIntentArgs = {
  address?: InputMaybe<AddressAttributes>;
};


export type RootMutationTypeSignupArgs = {
  account?: InputMaybe<AccountAttributes>;
  attributes: UserAttributes;
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  inviteId?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeSsoCallbackArgs = {
  code: Scalars['String']['input'];
  deviceToken?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeSyncedArgs = {
  repository: Scalars['String']['input'];
};


export type RootMutationTypeTransferDemoProjectArgs = {
  organizationId: Scalars['String']['input'];
};


export type RootMutationTypeTransferOwnershipArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type RootMutationTypeUnfollowIncidentArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUninstallTerraformArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUnlockRepositoryArgs = {
  name: Scalars['String']['input'];
};


export type RootMutationTypeUpdateAccountArgs = {
  attributes: AccountAttributes;
};


export type RootMutationTypeUpdateChartArgs = {
  attributes: ChartAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateChartInstallationArgs = {
  attributes: ChartInstallationAttributes;
  chartInstallationId: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateConsoleInstanceArgs = {
  attributes: ConsoleInstanceUpdateAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateDockerRepositoryArgs = {
  attributes: DockerRepositoryAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateDomainArgs = {
  attributes: DnsDomainAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateGroupArgs = {
  attributes: GroupAttributes;
  groupId: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateIncidentArgs = {
  attributes: IncidentAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateInstallationArgs = {
  attributes: InstallationAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateIntegrationWebhookArgs = {
  attributes: IntegrationWebhookAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateLineItemArgs = {
  attributes: LimitAttributes;
  subscriptionId: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateMessageArgs = {
  attributes: IncidentMessageAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateOidcProviderArgs = {
  attributes: OidcAttributes;
  id?: InputMaybe<Scalars['ID']['input']>;
  installationId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeUpdatePlanArgs = {
  planId: Scalars['ID']['input'];
  subscriptionId: Scalars['ID']['input'];
};


export type RootMutationTypeUpdatePlanAttributesArgs = {
  attributes: UpdatablePlanAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdatePlatformPlanArgs = {
  planId: Scalars['ID']['input'];
};


export type RootMutationTypeUpdatePublisherArgs = {
  attributes: PublisherAttributes;
};


export type RootMutationTypeUpdateRepositoryArgs = {
  attributes: RepositoryAttributes;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
  repositoryName?: InputMaybe<Scalars['String']['input']>;
};


export type RootMutationTypeUpdateRoleArgs = {
  attributes: RoleAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateServiceAccountArgs = {
  attributes: ServiceAccountAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateShellArgs = {
  attributes: CloudShellAttributes;
};


export type RootMutationTypeUpdateShellConfigurationArgs = {
  context: Scalars['Map']['input'];
};


export type RootMutationTypeUpdateStepArgs = {
  attributes: TestStepAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateTerraformArgs = {
  attributes: TerraformAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateTestArgs = {
  attributes: TestAttributes;
  id: Scalars['ID']['input'];
};


export type RootMutationTypeUpdateUserArgs = {
  attributes: UserAttributes;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type RootMutationTypeUpdateVersionArgs = {
  attributes: VersionAttributes;
  id?: InputMaybe<Scalars['ID']['input']>;
  spec?: InputMaybe<VersionSpec>;
};


export type RootMutationTypeUploadTerraformArgs = {
  attributes: TerraformAttributes;
  name: Scalars['String']['input'];
  repositoryName: Scalars['String']['input'];
};


export type RootMutationTypeUpsertOidcProviderArgs = {
  attributes: OidcAttributes;
  installationId: Scalars['ID']['input'];
};


export type RootMutationTypeUpsertRepositoryArgs = {
  attributes: RepositoryAttributes;
  name: Scalars['String']['input'];
  publisher: Scalars['String']['input'];
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  account?: Maybe<Account>;
  auditMetrics?: Maybe<Array<Maybe<GeoMetric>>>;
  audits?: Maybe<AuditConnection>;
  categories?: Maybe<Array<Maybe<CategoryInfo>>>;
  category?: Maybe<CategoryInfo>;
  chart?: Maybe<Chart>;
  chartInstallations?: Maybe<ChartInstallationConnection>;
  charts?: Maybe<ChartConnection>;
  chat?: Maybe<ChatMessage>;
  closure?: Maybe<Array<Maybe<ClosureItem>>>;
  cloudSettings?: Maybe<PluralCloudSettings>;
  /** Get a cluster by its ID. */
  cluster?: Maybe<Cluster>;
  /** Get a list of clusters owned by the current account. */
  clusters?: Maybe<ClusterConnection>;
  configuration?: Maybe<PluralConfiguration>;
  consoleInstance?: Maybe<ConsoleInstance>;
  consoleInstances?: Maybe<ConsoleInstanceConnection>;
  deferredUpdates?: Maybe<DeferredUpdateConnection>;
  demoProject?: Maybe<DemoProject>;
  dnsDomain?: Maybe<DnsDomain>;
  dnsDomains?: Maybe<DnsDomainConnection>;
  dnsRecords?: Maybe<DnsRecordConnection>;
  dockerImage?: Maybe<DockerImage>;
  dockerImages?: Maybe<DockerImageConnection>;
  dockerRepositories?: Maybe<DockerRepositoryConnection>;
  eabCredential?: Maybe<EabCredential>;
  eabCredentials?: Maybe<Array<Maybe<EabCredential>>>;
  groupMembers?: Maybe<GroupMemberConnection>;
  groups?: Maybe<GroupConnection>;
  helpQuestion?: Maybe<Scalars['String']['output']>;
  incident?: Maybe<Incident>;
  incidents?: Maybe<IncidentConnection>;
  installation?: Maybe<Installation>;
  installations?: Maybe<InstallationConnection>;
  integrationWebhook?: Maybe<IntegrationWebhook>;
  integrationWebhooks?: Maybe<IntegrationWebhookConnection>;
  integrations?: Maybe<IntegrationConnection>;
  invite?: Maybe<Invite>;
  invites?: Maybe<InviteConnection>;
  invoices?: Maybe<InvoiceConnection>;
  keyBackup?: Maybe<KeyBackup>;
  keyBackups?: Maybe<KeyBackupConnection>;
  licenseKey?: Maybe<Scalars['String']['output']>;
  loginMethod?: Maybe<LoginMethodResponse>;
  loginMetrics?: Maybe<Array<Maybe<GeoMetric>>>;
  me?: Maybe<User>;
  notifications?: Maybe<NotificationConnection>;
  oauthConsent?: Maybe<Repository>;
  oauthIntegrations?: Maybe<Array<Maybe<OauthIntegration>>>;
  oauthLogin?: Maybe<Repository>;
  oauthUrls?: Maybe<Array<Maybe<OauthInfo>>>;
  oidcConsent?: Maybe<OidcStepResponse>;
  oidcLogin?: Maybe<OidcStepResponse>;
  oidcLogins?: Maybe<OidcLoginConnection>;
  oidcProviders?: Maybe<OidcProviderConnection>;
  oidcToken?: Maybe<Scalars['String']['output']>;
  platformMetrics?: Maybe<PlatformMetrics>;
  platformPlans?: Maybe<Array<Maybe<PlatformPlan>>>;
  platformSubscription?: Maybe<PlatformSubscription>;
  publicKeys?: Maybe<PublicKeyConnection>;
  publisher?: Maybe<Publisher>;
  publishers?: Maybe<PublisherConnection>;
  recipe?: Maybe<Recipe>;
  recipes?: Maybe<RecipeConnection>;
  repositories?: Maybe<RepositoryConnection>;
  /** Get an application by its ID or name. */
  repository?: Maybe<Repository>;
  repositorySubscription?: Maybe<RepositorySubscription>;
  resetToken?: Maybe<ResetToken>;
  role?: Maybe<Role>;
  roles?: Maybe<RoleConnection>;
  rollouts?: Maybe<RolloutConnection>;
  scaffold?: Maybe<Array<Maybe<ScaffoldFile>>>;
  scmAuthorization?: Maybe<Array<Maybe<AuthorizationUrl>>>;
  scmToken?: Maybe<Scalars['String']['output']>;
  searchRepositories?: Maybe<RepositoryConnection>;
  searchUsers?: Maybe<UserConnection>;
  shell?: Maybe<CloudShell>;
  shellApplications?: Maybe<Array<Maybe<ApplicationInformation>>>;
  shellConfiguration?: Maybe<ShellConfiguration>;
  stack?: Maybe<Stack>;
  stacks?: Maybe<StackConnection>;
  subscriptions?: Maybe<RepositorySubscriptionConnection>;
  tags?: Maybe<GroupedTagConnection>;
  terraform?: Maybe<TerraformConnection>;
  terraformInstallations?: Maybe<TerraformInstallationConnection>;
  terraformModule?: Maybe<Terraform>;
  terraformProvider?: Maybe<TerraformProvider>;
  terraformProviders?: Maybe<Array<Maybe<Provider>>>;
  test?: Maybe<Test>;
  testLogs?: Maybe<Scalars['String']['output']>;
  tests?: Maybe<TestConnection>;
  token?: Maybe<PersistedToken>;
  tokens?: Maybe<PersistedTokenConnection>;
  upgradeQueue?: Maybe<UpgradeQueue>;
  upgradeQueues?: Maybe<Array<Maybe<UpgradeQueue>>>;
  user?: Maybe<User>;
  users?: Maybe<UserConnection>;
  versions?: Maybe<VersionConnection>;
  webhooks?: Maybe<WebhookConnection>;
};


export type RootQueryTypeAuditsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeCategoryArgs = {
  name: Category;
};


export type RootQueryTypeChartArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeChartInstallationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repositoryId: Scalars['ID']['input'];
};


export type RootQueryTypeChartsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repositoryId: Scalars['ID']['input'];
};


export type RootQueryTypeChatArgs = {
  history?: InputMaybe<Array<InputMaybe<ChatMessageAttributes>>>;
};


export type RootQueryTypeClosureArgs = {
  id: Scalars['ID']['input'];
  type: DependencyType;
};


export type RootQueryTypeClusterArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeClustersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeConsoleInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeConsoleInstancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeDeferredUpdatesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  chartInstallationId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  terraformInstallationId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootQueryTypeDemoProjectArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type RootQueryTypeDnsDomainArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeDnsDomainsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeDnsRecordsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cluster?: InputMaybe<Scalars['String']['input']>;
  domainId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  provider?: InputMaybe<Provider>;
};


export type RootQueryTypeDockerImageArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeDockerImagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  dockerRepositoryId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeDockerRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repositoryId: Scalars['ID']['input'];
};


export type RootQueryTypeEabCredentialArgs = {
  cluster: Scalars['String']['input'];
  provider: Provider;
};


export type RootQueryTypeGroupMembersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  groupId: Scalars['ID']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeGroupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeHelpQuestionArgs = {
  prompt: Scalars['String']['input'];
};


export type RootQueryTypeIncidentArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeIncidentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<InputMaybe<IncidentFilter>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Order>;
  q?: InputMaybe<Scalars['String']['input']>;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
  sort?: InputMaybe<IncidentSort>;
  supports?: InputMaybe<Scalars['Boolean']['input']>;
};


export type RootQueryTypeInstallationArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeInstallationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeIntegrationWebhookArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeIntegrationWebhooksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeIntegrationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
  repositoryName?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeInviteArgs = {
  id: Scalars['String']['input'];
};


export type RootQueryTypeInvitesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeInvoicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeKeyBackupArgs = {
  name: Scalars['String']['input'];
};


export type RootQueryTypeKeyBackupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeLoginMethodArgs = {
  email: Scalars['String']['input'];
  host?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeNotificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cli?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  incidentId?: InputMaybe<Scalars['ID']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeOauthConsentArgs = {
  challenge: Scalars['String']['input'];
};


export type RootQueryTypeOauthLoginArgs = {
  challenge: Scalars['String']['input'];
};


export type RootQueryTypeOauthUrlsArgs = {
  host?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeOidcConsentArgs = {
  challenge: Scalars['String']['input'];
};


export type RootQueryTypeOidcLoginArgs = {
  challenge: Scalars['String']['input'];
};


export type RootQueryTypeOidcLoginsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeOidcProvidersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeOidcTokenArgs = {
  email: Scalars['String']['input'];
  idToken: Scalars['String']['input'];
  provider: ExternalOidcProvider;
};


export type RootQueryTypePublicKeysArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypePublisherArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type RootQueryTypePublishersArgs = {
  accountId?: InputMaybe<Scalars['ID']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  publishable?: InputMaybe<Scalars['Boolean']['input']>;
};


export type RootQueryTypeRecipeArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  repo?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeRecipesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  provider?: InputMaybe<Provider>;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
  repositoryName?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Array<InputMaybe<Category>>>;
  category?: InputMaybe<Category>;
  first?: InputMaybe<Scalars['Int']['input']>;
  installed?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  provider?: InputMaybe<Provider>;
  publisherId?: InputMaybe<Scalars['ID']['input']>;
  publishers?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  q?: InputMaybe<Scalars['String']['input']>;
  supports?: InputMaybe<Scalars['Boolean']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RootQueryTypeRepositoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeRepositorySubscriptionArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeResetTokenArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeRoleArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeRolesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootQueryTypeRolloutsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repositoryId: Scalars['ID']['input'];
};


export type RootQueryTypeScaffoldArgs = {
  application: Scalars['String']['input'];
  category: Category;
  ingress?: InputMaybe<Scalars['Boolean']['input']>;
  postgres?: InputMaybe<Scalars['Boolean']['input']>;
  publisher: Scalars['String']['input'];
};


export type RootQueryTypeScmTokenArgs = {
  code: Scalars['String']['input'];
  provider: ScmProvider;
};


export type RootQueryTypeSearchRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type RootQueryTypeSearchUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  incidentId: Scalars['ID']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
  q: Scalars['String']['input'];
};


export type RootQueryTypeStackArgs = {
  name: Scalars['String']['input'];
  provider: Provider;
};


export type RootQueryTypeStacksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeSubscriptionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  type: TagGroup;
};


export type RootQueryTypeTerraformArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repositoryId: Scalars['ID']['input'];
};


export type RootQueryTypeTerraformInstallationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repositoryId: Scalars['ID']['input'];
};


export type RootQueryTypeTerraformModuleArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeTerraformProviderArgs = {
  name: Provider;
  vsn?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypeTestArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeTestLogsArgs = {
  id: Scalars['ID']['input'];
  step: Scalars['ID']['input'];
};


export type RootQueryTypeTestsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
  versionId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootQueryTypeTokenArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeTokensArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeUpgradeQueueArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type RootQueryTypeUserArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  all?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  serviceAccount?: InputMaybe<Scalars['Boolean']['input']>;
};


export type RootQueryTypeVersionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  chartId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  terraformId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootQueryTypeWebhooksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type RootSubscriptionType = {
  __typename?: 'RootSubscriptionType';
  incidentDelta?: Maybe<IncidentDelta>;
  incidentMessageDelta?: Maybe<IncidentMessageDelta>;
  notification?: Maybe<Notification>;
  rolloutDelta?: Maybe<RolloutDelta>;
  testDelta?: Maybe<TestDelta>;
  testLogs?: Maybe<StepLogs>;
  upgrade?: Maybe<Upgrade>;
  upgradeQueueDelta?: Maybe<UpgradeQueueDelta>;
};


export type RootSubscriptionTypeIncidentDeltaArgs = {
  incidentId?: InputMaybe<Scalars['ID']['input']>;
  repositoryId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootSubscriptionTypeIncidentMessageDeltaArgs = {
  incidentId?: InputMaybe<Scalars['ID']['input']>;
};


export type RootSubscriptionTypeRolloutDeltaArgs = {
  repositoryId: Scalars['ID']['input'];
};


export type RootSubscriptionTypeTestDeltaArgs = {
  repositoryId: Scalars['ID']['input'];
};


export type RootSubscriptionTypeTestLogsArgs = {
  testId: Scalars['ID']['input'];
};


export type RootSubscriptionTypeUpgradeArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type ScaffoldFile = {
  __typename?: 'ScaffoldFile';
  content?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
};

export type ScanError = {
  __typename?: 'ScanError';
  message?: Maybe<Scalars['String']['output']>;
};

export type ScanViolation = {
  __typename?: 'ScanViolation';
  category?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  file?: Maybe<Scalars['String']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  line?: Maybe<Scalars['Int']['output']>;
  resourceName?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  ruleId?: Maybe<Scalars['String']['output']>;
  ruleName?: Maybe<Scalars['String']['output']>;
  severity?: Maybe<VulnGrade>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ScmAttributes = {
  gitUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  org?: InputMaybe<Scalars['String']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<ScmProvider>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
};

export enum ScmProvider {
  Demo = 'DEMO',
  Github = 'GITHUB',
  Gitlab = 'GITLAB',
  Manual = 'MANUAL'
}

export type ServiceAccountAttributes = {
  email?: InputMaybe<Scalars['String']['input']>;
  impersonationPolicy?: InputMaybe<ImpersonationPolicyAttributes>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ServiceLevel = {
  __typename?: 'ServiceLevel';
  maxSeverity?: Maybe<Scalars['Int']['output']>;
  minSeverity?: Maybe<Scalars['Int']['output']>;
  responseTime?: Maybe<Scalars['Int']['output']>;
};

export type ServiceLevelAttributes = {
  maxSeverity?: InputMaybe<Scalars['Int']['input']>;
  minSeverity?: InputMaybe<Scalars['Int']['input']>;
  responseTime?: InputMaybe<Scalars['Int']['input']>;
};

export type SetupIntent = {
  __typename?: 'SetupIntent';
  clientSecret?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  nextAction?: Maybe<NextAction>;
  paymentMethodTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  status?: Maybe<Scalars['String']['output']>;
};

export type ShellConfiguration = {
  __typename?: 'ShellConfiguration';
  buckets?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  contextConfiguration?: Maybe<Scalars['Map']['output']>;
  domains?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  git?: Maybe<GitConfiguration>;
  workspace?: Maybe<ShellWorkspace>;
};

export type ShellCredentialsAttributes = {
  aws?: InputMaybe<AwsShellCredentialsAttributes>;
  azure?: InputMaybe<AzureShellCredentialsAttributes>;
  gcp?: InputMaybe<GcpShellCredentialsAttributes>;
};

export type ShellStatus = {
  __typename?: 'ShellStatus';
  containersReady?: Maybe<Scalars['Boolean']['output']>;
  initialized?: Maybe<Scalars['Boolean']['output']>;
  podScheduled?: Maybe<Scalars['Boolean']['output']>;
  ready?: Maybe<Scalars['Boolean']['output']>;
};

export type ShellWorkspace = {
  __typename?: 'ShellWorkspace';
  bucketPrefix?: Maybe<Scalars['String']['output']>;
  cluster?: Maybe<Scalars['String']['output']>;
  network?: Maybe<NetworkConfiguration>;
  region?: Maybe<Scalars['String']['output']>;
};

export type SlimSubscription = {
  __typename?: 'SlimSubscription';
  id: Scalars['ID']['output'];
  lineItems?: Maybe<SubscriptionLineItems>;
  plan?: Maybe<Plan>;
};

/** Possible cluster sources. */
export enum Source {
  Default = 'DEFAULT',
  Demo = 'DEMO',
  Shell = 'SHELL'
}

export enum SpecDatatype {
  Bool = 'BOOL',
  Float = 'FLOAT',
  Int = 'INT',
  List = 'LIST',
  Object = 'OBJECT',
  String = 'STRING'
}

export type SpecificationAttributes = {
  inner?: InputMaybe<SpecDatatype>;
  name: Scalars['String']['input'];
  required?: InputMaybe<Scalars['Boolean']['input']>;
  spec?: InputMaybe<Array<InputMaybe<SpecificationAttributes>>>;
  type: SpecDatatype;
};

export type Stack = {
  __typename?: 'Stack';
  bundles?: Maybe<Array<Maybe<Recipe>>>;
  collections?: Maybe<Array<Maybe<StackCollection>>>;
  community?: Maybe<Community>;
  creator?: Maybe<User>;
  description?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  featured?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  sections?: Maybe<Array<Maybe<RecipeSection>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type StackAttributes = {
  collections?: InputMaybe<Array<InputMaybe<StackCollectionAttributes>>>;
  community?: InputMaybe<CommunityAttributes>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type StackCollection = {
  __typename?: 'StackCollection';
  bundles?: Maybe<Array<Maybe<StackRecipe>>>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  provider: Provider;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type StackCollectionAttributes = {
  bundles?: InputMaybe<Array<InputMaybe<RecipeReference>>>;
  provider: Provider;
};

export type StackConnection = {
  __typename?: 'StackConnection';
  edges?: Maybe<Array<Maybe<StackEdge>>>;
  pageInfo: PageInfo;
};

export type StackEdge = {
  __typename?: 'StackEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Stack>;
};

export type StackRecipe = {
  __typename?: 'StackRecipe';
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  recipe: Recipe;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type StepLogs = {
  __typename?: 'StepLogs';
  logs?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  step?: Maybe<TestStep>;
};

export type SubscriptionAttributes = {
  lineItems?: InputMaybe<SubscriptionLineItemAttributes>;
};

export type SubscriptionLineItemAttributes = {
  items?: InputMaybe<Array<InputMaybe<LimitAttributes>>>;
};

export type SubscriptionLineItems = {
  __typename?: 'SubscriptionLineItems';
  items?: Maybe<Array<Maybe<Limit>>>;
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID']['output'];
  tag: Scalars['String']['output'];
};

export type TagAttributes = {
  tag: Scalars['String']['input'];
};

export enum TagGroup {
  Integrations = 'INTEGRATIONS',
  Repositories = 'REPOSITORIES'
}

/** Template engines that can be used at build time. */
export enum TemplateType {
  Gotemplate = 'GOTEMPLATE',
  Javascript = 'JAVASCRIPT',
  Lua = 'LUA'
}

export type Terraform = {
  __typename?: 'Terraform';
  dependencies?: Maybe<Dependencies>;
  description?: Maybe<Scalars['String']['output']>;
  editable?: Maybe<Scalars['Boolean']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  installation?: Maybe<TerraformInstallation>;
  latestVersion?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  package?: Maybe<Scalars['String']['output']>;
  readme?: Maybe<Scalars['String']['output']>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  valuesTemplate?: Maybe<Scalars['String']['output']>;
};

export type TerraformAttributes = {
  dependencies?: InputMaybe<Scalars['Yaml']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  package?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type TerraformConnection = {
  __typename?: 'TerraformConnection';
  edges?: Maybe<Array<Maybe<TerraformEdge>>>;
  pageInfo: PageInfo;
};

export type TerraformEdge = {
  __typename?: 'TerraformEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Terraform>;
};

export type TerraformInstallation = {
  __typename?: 'TerraformInstallation';
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  installation?: Maybe<Installation>;
  terraform?: Maybe<Terraform>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  version?: Maybe<Version>;
};

export type TerraformInstallationAttributes = {
  terraformId?: InputMaybe<Scalars['ID']['input']>;
  versionId?: InputMaybe<Scalars['ID']['input']>;
};

export type TerraformInstallationConnection = {
  __typename?: 'TerraformInstallationConnection';
  edges?: Maybe<Array<Maybe<TerraformInstallationEdge>>>;
  pageInfo: PageInfo;
};

export type TerraformInstallationEdge = {
  __typename?: 'TerraformInstallationEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<TerraformInstallation>;
};

export type TerraformProvider = {
  __typename?: 'TerraformProvider';
  content?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Provider>;
};

export type Test = {
  __typename?: 'Test';
  creator?: Maybe<User>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  promoteTag: Scalars['String']['output'];
  repository?: Maybe<Repository>;
  sourceTag: Scalars['String']['output'];
  status: TestStatus;
  steps?: Maybe<Array<Maybe<TestStep>>>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type TestArgument = {
  __typename?: 'TestArgument';
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  repo: Scalars['String']['output'];
};

export type TestArgumentAttributes = {
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
  repo: Scalars['String']['input'];
};

export type TestAttributes = {
  name?: InputMaybe<Scalars['String']['input']>;
  promoteTag?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TestStatus>;
  steps?: InputMaybe<Array<InputMaybe<TestStepAttributes>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type TestConnection = {
  __typename?: 'TestConnection';
  edges?: Maybe<Array<Maybe<TestEdge>>>;
  pageInfo: PageInfo;
};

export type TestDelta = {
  __typename?: 'TestDelta';
  delta?: Maybe<Delta>;
  payload?: Maybe<Test>;
};

export type TestEdge = {
  __typename?: 'TestEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Test>;
};

export enum TestStatus {
  Failed = 'FAILED',
  Queued = 'QUEUED',
  Running = 'RUNNING',
  Succeeded = 'SUCCEEDED'
}

export type TestStep = {
  __typename?: 'TestStep';
  description: Scalars['String']['output'];
  hasLogs?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  status: TestStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type TestStepAttributes = {
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  logs?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TestStatus>;
};

export enum TestType {
  Git = 'GIT'
}

export type TrustRelationshipAttributes = {
  issuer: Scalars['String']['input'];
  scopes?: InputMaybe<Array<Scalars['String']['input']>>;
  trust: Scalars['String']['input'];
};

export type UpdatablePlanAttributes = {
  default?: InputMaybe<Scalars['Boolean']['input']>;
  serviceLevels?: InputMaybe<Array<InputMaybe<ServiceLevelAttributes>>>;
};

export type Upgrade = {
  __typename?: 'Upgrade';
  config?: Maybe<UpgradeConfig>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  repository?: Maybe<Repository>;
  type?: Maybe<UpgradeType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** The information for this upgrade */
export type UpgradeAttributes = {
  /** information for a config upgrade */
  config?: InputMaybe<UpgradeConfigAttributes>;
  /** a simple message to explain this upgrade */
  message: Scalars['String']['input'];
  /** the type of upgrade */
  type: UpgradeType;
};

export type UpgradeConfig = {
  __typename?: 'UpgradeConfig';
  paths?: Maybe<Array<Maybe<UpgradePath>>>;
};

/** the attributes of the config upgrade */
export type UpgradeConfigAttributes = {
  /** paths for a configuration change */
  paths?: InputMaybe<Array<InputMaybe<UpgradePathAttributes>>>;
};

export type UpgradeConnection = {
  __typename?: 'UpgradeConnection';
  edges?: Maybe<Array<Maybe<UpgradeEdge>>>;
  pageInfo: PageInfo;
};

export type UpgradeEdge = {
  __typename?: 'UpgradeEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Upgrade>;
};

/** The pending upgrades for a repository */
export type UpgradeInfo = {
  __typename?: 'UpgradeInfo';
  count?: Maybe<Scalars['Int']['output']>;
  installation?: Maybe<Installation>;
};

export type UpgradePath = {
  __typename?: 'UpgradePath';
  path: Scalars['String']['output'];
  type: ValueType;
  value: Scalars['String']['output'];
};

/** attributes of a path update */
export type UpgradePathAttributes = {
  /** path the upgrade will occur on, formatted like .some.key[0].here */
  path: Scalars['String']['input'];
  /** the ultimate type of the value */
  type: ValueType;
  /** the stringified value that will be applied on this path */
  value: Scalars['String']['input'];
};

export type UpgradeQueue = {
  __typename?: 'UpgradeQueue';
  acked?: Maybe<Scalars['ID']['output']>;
  domain?: Maybe<Scalars['String']['output']>;
  git?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pingedAt?: Maybe<Scalars['DateTime']['output']>;
  provider?: Maybe<Provider>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  upgrades?: Maybe<UpgradeConnection>;
  user: User;
};


export type UpgradeQueueUpgradesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type UpgradeQueueAttributes = {
  domain?: InputMaybe<Scalars['String']['input']>;
  git?: InputMaybe<Scalars['String']['input']>;
  legacy?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  provider?: InputMaybe<Provider>;
};

export type UpgradeQueueDelta = {
  __typename?: 'UpgradeQueueDelta';
  delta?: Maybe<Delta>;
  payload?: Maybe<UpgradeQueue>;
};

export enum UpgradeType {
  Approval = 'APPROVAL',
  Bounce = 'BOUNCE',
  Config = 'CONFIG',
  Dedicated = 'DEDICATED',
  Deploy = 'DEPLOY'
}

export type User = {
  __typename?: 'User';
  account: Account;
  address?: Maybe<Address>;
  avatar?: Maybe<Scalars['String']['output']>;
  backgroundColor?: Maybe<Scalars['String']['output']>;
  /** the roles attached to this user, only fetch this when querying an individual user */
  boundRoles?: Maybe<Array<Maybe<Role>>>;
  cards?: Maybe<CardConnection>;
  defaultQueueId?: Maybe<Scalars['ID']['output']>;
  /** If a user has reached the demo project usage limit. */
  demoed?: Maybe<Scalars['Boolean']['output']>;
  demoing?: Maybe<Scalars['Boolean']['output']>;
  email: Scalars['String']['output'];
  emailConfirmBy?: Maybe<Scalars['DateTime']['output']>;
  emailConfirmed?: Maybe<Scalars['Boolean']['output']>;
  /** the groups attached to this user, only fetch this when querying an individual user */
  groups?: Maybe<Array<Maybe<Group>>>;
  hasInstallations?: Maybe<Scalars['Boolean']['output']>;
  hasShell?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  impersonationPolicy?: Maybe<ImpersonationPolicy>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  intercomId?: Maybe<Scalars['String']['output']>;
  invites?: Maybe<Array<Maybe<Invite>>>;
  jwt?: Maybe<Scalars['String']['output']>;
  loginMethod?: Maybe<LoginMethod>;
  name: Scalars['String']['output'];
  onboarding?: Maybe<OnboardingState>;
  onboardingChecklist?: Maybe<OnboardingChecklist>;
  phone?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Provider>;
  publisher?: Maybe<Publisher>;
  roles?: Maybe<Roles>;
  serviceAccount?: Maybe<Scalars['Boolean']['output']>;
  trustRelationships?: Maybe<Array<Maybe<OidcTrustRelationship>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type UserCardsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type UserAttributes = {
  avatar?: InputMaybe<Scalars['UploadOrUrl']['input']>;
  confirm?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  loginMethod?: InputMaybe<LoginMethod>;
  name?: InputMaybe<Scalars['String']['input']>;
  onboarding?: InputMaybe<OnboardingState>;
  onboardingChecklist?: InputMaybe<OnboardingChecklistAttributes>;
  password?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<RolesAttributes>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  pageInfo: PageInfo;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<User>;
};

export type UserEventAttributes = {
  data?: InputMaybe<Scalars['String']['input']>;
  event: Scalars['String']['input'];
  status?: InputMaybe<UserEventStatus>;
};

export enum UserEventStatus {
  Error = 'ERROR',
  Ok = 'OK'
}

export enum ValidationType {
  Regex = 'REGEX'
}

export enum ValueType {
  Float = 'FLOAT',
  Int = 'INT',
  String = 'STRING'
}

/** The version of a package. */
export type Version = {
  __typename?: 'Version';
  chart?: Maybe<Chart>;
  crds?: Maybe<Array<Maybe<Crd>>>;
  dependencies?: Maybe<Dependencies>;
  helm?: Maybe<Scalars['Map']['output']>;
  id: Scalars['ID']['output'];
  imageDependencies?: Maybe<Array<Maybe<ImageDependency>>>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  package?: Maybe<Scalars['String']['output']>;
  readme?: Maybe<Scalars['String']['output']>;
  scan?: Maybe<PackageScan>;
  tags?: Maybe<Array<Maybe<VersionTag>>>;
  /** The template engine used to render the valuesTemplate. */
  templateType?: Maybe<TemplateType>;
  terraform?: Maybe<Terraform>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  valuesTemplate?: Maybe<Scalars['String']['output']>;
  version: Scalars['String']['output'];
};

export type VersionAttributes = {
  tags?: InputMaybe<Array<InputMaybe<VersionTagAttributes>>>;
};

export type VersionConnection = {
  __typename?: 'VersionConnection';
  edges?: Maybe<Array<Maybe<VersionEdge>>>;
  pageInfo: PageInfo;
};

export type VersionEdge = {
  __typename?: 'VersionEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Version>;
};

export type VersionSpec = {
  chart?: InputMaybe<Scalars['String']['input']>;
  repository?: InputMaybe<Scalars['String']['input']>;
  terraform?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type VersionTag = {
  __typename?: 'VersionTag';
  chart?: Maybe<Chart>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  tag: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  version?: Maybe<Version>;
};

export type VersionTagAttributes = {
  tag: Scalars['String']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
};

export enum VulnGrade {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM',
  None = 'NONE'
}

export enum VulnRequirement {
  None = 'NONE',
  Required = 'REQUIRED'
}

export enum VulnVector {
  Adjacent = 'ADJACENT',
  Local = 'LOCAL',
  Network = 'NETWORK',
  Physical = 'PHYSICAL'
}

export type Vulnerability = {
  __typename?: 'Vulnerability';
  cvss?: Maybe<Cvss>;
  description?: Maybe<Scalars['String']['output']>;
  fixedVersion?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  installedVersion?: Maybe<Scalars['String']['output']>;
  layer?: Maybe<ImageLayer>;
  package?: Maybe<Scalars['String']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  severity?: Maybe<VulnGrade>;
  source?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  vulnerabilityId?: Maybe<Scalars['String']['output']>;
};

export type Webhook = {
  __typename?: 'Webhook';
  id?: Maybe<Scalars['ID']['output']>;
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  secret?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type WebhookAttributes = {
  url: Scalars['String']['input'];
};

export type WebhookConnection = {
  __typename?: 'WebhookConnection';
  edges?: Maybe<Array<Maybe<WebhookEdge>>>;
  pageInfo: PageInfo;
};

export type WebhookEdge = {
  __typename?: 'WebhookEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Webhook>;
};

export type WebhookLog = {
  __typename?: 'WebhookLog';
  id: Scalars['ID']['output'];
  insertedAt?: Maybe<Scalars['DateTime']['output']>;
  payload?: Maybe<Scalars['Map']['output']>;
  response?: Maybe<Scalars['String']['output']>;
  state: WebhookLogState;
  status?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  webhook?: Maybe<IntegrationWebhook>;
};

export type WebhookLogConnection = {
  __typename?: 'WebhookLogConnection';
  edges?: Maybe<Array<Maybe<WebhookLogEdge>>>;
  pageInfo: PageInfo;
};

export type WebhookLogEdge = {
  __typename?: 'WebhookLogEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<WebhookLog>;
};

export enum WebhookLogState {
  Delivered = 'DELIVERED',
  Failed = 'FAILED',
  Sending = 'SENDING'
}

export type WebhookResponse = {
  __typename?: 'WebhookResponse';
  body?: Maybe<Scalars['String']['output']>;
  headers?: Maybe<Scalars['Map']['output']>;
  statusCode: Scalars['Int']['output'];
};

export type Wirings = {
  __typename?: 'Wirings';
  helm?: Maybe<Scalars['Map']['output']>;
  terraform?: Maybe<Scalars['Map']['output']>;
};

export type WorkspaceAttributes = {
  bucketPrefix: Scalars['String']['input'];
  cluster: Scalars['String']['input'];
  project?: InputMaybe<Scalars['String']['input']>;
  region: Scalars['String']['input'];
  subdomain: Scalars['String']['input'];
};

export type ZoomMeeting = {
  __typename?: 'ZoomMeeting';
  joinUrl: Scalars['String']['output'];
  password?: Maybe<Scalars['String']['output']>;
};

export type PolicyBindingFragment = { __typename?: 'PolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null };

export type DnsDomainFragment = { __typename?: 'DnsDomain', id: string, name: string, insertedAt?: Date | null, creator?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, accessPolicy?: { __typename?: 'DnsAccessPolicy', id: string, bindings?: Array<{ __typename?: 'PolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null };

export type OidcLoginFragment = { __typename?: 'OidcLogin', ip?: string | null, country?: string | null, city?: string | null, latitude?: string | null, longitude?: string | null, insertedAt?: Date | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null };

export type GenerateLicenseKeyQueryVariables = Exact<{ [key: string]: never; }>;


export type GenerateLicenseKeyQuery = { __typename?: 'RootQueryType', licenseKey?: string | null };

export type ConsumerEmailDomainsQueryVariables = Exact<{ [key: string]: never; }>;


export type ConsumerEmailDomainsQuery = { __typename?: 'RootQueryType', account?: { __typename?: 'Account', consumerEmailDomains?: Array<string | null> | null } | null };

export type UpdateAccountMutationVariables = Exact<{
  attributes: AccountAttributes;
}>;


export type UpdateAccountMutation = { __typename?: 'RootMutationType', updateAccount?: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null, domainMappings?: Array<{ __typename?: 'DomainMapping', id: string, domain: string, enableSso?: boolean | null } | null> | null } | null };

export type BeginTrialMutationVariables = Exact<{ [key: string]: never; }>;


export type BeginTrialMutation = { __typename?: 'RootMutationType', beginTrial?: { __typename?: 'PlatformSubscription', id: string, trialUntil?: Date | null, plan?: { __typename?: 'PlatformPlan', id: string, name: string, cost: number, period: PaymentPeriod, enterprise?: boolean | null, trial?: boolean | null, features?: { __typename?: 'PlanFeatures', vpn?: boolean | null, userManagement?: boolean | null, audit?: boolean | null } | null, lineItems?: Array<{ __typename?: 'PlatformPlanItem', name: string, dimension: LineItemDimension, cost: number, period: PaymentPeriod } | null> | null } | null } | null };

export type ArtifactFragment = { __typename?: 'Artifact', id?: string | null, name?: string | null, blob?: string | null, type?: ArtifactType | null, platform?: ArtifactPlatform | null, arch?: string | null, filesize?: number | null, sha?: string | null, readme?: string | null, insertedAt?: Date | null, updatedAt?: Date | null };

export type ListArtifactsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ListArtifactsQuery = { __typename?: 'RootQueryType', repository?: { __typename?: 'Repository', artifacts?: Array<{ __typename?: 'Artifact', id?: string | null, name?: string | null, blob?: string | null, type?: ArtifactType | null, platform?: ArtifactPlatform | null, arch?: string | null, filesize?: number | null, sha?: string | null, readme?: string | null, insertedAt?: Date | null, updatedAt?: Date | null } | null> | null } | null };

export type CreateArtifactMutationVariables = Exact<{
  repoName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  readme: Scalars['String']['input'];
  artifactType: Scalars['String']['input'];
  platform: Scalars['String']['input'];
  blob: Scalars['UploadOrUrl']['input'];
  arch?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateArtifactMutation = { __typename?: 'RootMutationType', createArtifact?: { __typename?: 'Artifact', id?: string | null, name?: string | null, blob?: string | null, type?: ArtifactType | null, platform?: ArtifactPlatform | null, arch?: string | null, filesize?: number | null, sha?: string | null, readme?: string | null, insertedAt?: Date | null, updatedAt?: Date | null } | null };

export type AuditFragment = { __typename?: 'Audit', id: string, action: string, ip?: string | null, country?: string | null, city?: string | null, latitude?: string | null, longitude?: string | null, insertedAt?: Date | null, actor?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null, integrationWebhook?: { __typename?: 'IntegrationWebhook', id: string, name: string, url: string, secret: string, actions?: Array<string | null> | null } | null, role?: { __typename?: 'Role', id: string, name: string, description?: string | null, repositories?: Array<string | null> | null, permissions?: Array<Permission | null> | null, roleBindings?: Array<{ __typename?: 'RoleBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null } | null, version?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, image?: { __typename?: 'DockerImage', id: string, tag?: string | null, dockerRepository?: { __typename?: 'DockerRepository', name: string } | null } | null };

export type AuditsQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type AuditsQuery = { __typename?: 'RootQueryType', audits?: { __typename?: 'AuditConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'AuditEdge', node?: { __typename?: 'Audit', id: string, action: string, ip?: string | null, country?: string | null, city?: string | null, latitude?: string | null, longitude?: string | null, insertedAt?: Date | null, actor?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null, integrationWebhook?: { __typename?: 'IntegrationWebhook', id: string, name: string, url: string, secret: string, actions?: Array<string | null> | null } | null, role?: { __typename?: 'Role', id: string, name: string, description?: string | null, repositories?: Array<string | null> | null, permissions?: Array<Permission | null> | null, roleBindings?: Array<{ __typename?: 'RoleBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null } | null, version?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, image?: { __typename?: 'DockerImage', id: string, tag?: string | null, dockerRepository?: { __typename?: 'DockerRepository', name: string } | null } | null } | null } | null> | null } | null };

export type LoginsQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type LoginsQuery = { __typename?: 'RootQueryType', oidcLogins?: { __typename?: 'OidcLoginConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'OidcLoginEdge', node?: { __typename?: 'OidcLogin', ip?: string | null, country?: string | null, city?: string | null, latitude?: string | null, longitude?: string | null, insertedAt?: Date | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null } | null } | null> | null } | null };

export type AuditMetricsQueryVariables = Exact<{ [key: string]: never; }>;


export type AuditMetricsQuery = { __typename?: 'RootQueryType', auditMetrics?: Array<{ __typename?: 'GeoMetric', country?: string | null, count?: number | null } | null> | null };

export type LoginMetricsQueryVariables = Exact<{ [key: string]: never; }>;


export type LoginMetricsQuery = { __typename?: 'RootQueryType', loginMetrics?: Array<{ __typename?: 'GeoMetric', country?: string | null, count?: number | null } | null> | null };

export type ChartFragment = { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null };

export type CrdFragment = { __typename?: 'Crd', id: string, name: string, blob?: string | null };

export type ChartInstallationFragment = { __typename?: 'ChartInstallation', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, version?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null };

export type ScanViolationFragment = { __typename?: 'ScanViolation', ruleName?: string | null, description?: string | null, ruleId?: string | null, severity?: VulnGrade | null, category?: string | null, resourceName?: string | null, resourceType?: string | null, file?: string | null, line?: number | null };

export type ScanErrorFragment = { __typename?: 'ScanError', message?: string | null };

export type PackageScanFragment = { __typename?: 'PackageScan', id: string, grade?: ImageGrade | null, violations?: Array<{ __typename?: 'ScanViolation', ruleName?: string | null, description?: string | null, ruleId?: string | null, severity?: VulnGrade | null, category?: string | null, resourceName?: string | null, resourceType?: string | null, file?: string | null, line?: number | null } | null> | null, errors?: Array<{ __typename?: 'ScanError', message?: string | null } | null> | null };

export type GetChartsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetChartsQuery = { __typename?: 'RootQueryType', charts?: { __typename?: 'ChartConnection', edges?: Array<{ __typename?: 'ChartEdge', node?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null } | null> | null } | null };

export type GetVersionsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetVersionsQuery = { __typename?: 'RootQueryType', versions?: { __typename?: 'VersionConnection', edges?: Array<{ __typename?: 'VersionEdge', node?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null } | null> | null } | null };

export type GetChartInstallationsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetChartInstallationsQuery = { __typename?: 'RootQueryType', chartInstallations?: { __typename?: 'ChartInstallationConnection', edges?: Array<{ __typename?: 'ChartInstallationEdge', node?: { __typename?: 'ChartInstallation', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, version?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null } | null } | null> | null } | null };

export type GetPackageInstallationsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPackageInstallationsQuery = { __typename?: 'RootQueryType', chartInstallations?: { __typename?: 'ChartInstallationConnection', edges?: Array<{ __typename?: 'ChartInstallationEdge', node?: { __typename?: 'ChartInstallation', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, version?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null } | null } | null> | null } | null, terraformInstallations?: { __typename?: 'TerraformInstallationConnection', edges?: Array<{ __typename?: 'TerraformInstallationEdge', node?: { __typename?: 'TerraformInstallation', id?: string | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, version?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null } | null } | null> | null } | null };

export type CreateCrdMutationVariables = Exact<{
  chartName: ChartName;
  name: Scalars['String']['input'];
  blob: Scalars['UploadOrUrl']['input'];
}>;


export type CreateCrdMutation = { __typename?: 'RootMutationType', createCrd?: { __typename?: 'Crd', id: string } | null };

export type UninstallChartMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UninstallChartMutation = { __typename?: 'RootMutationType', deleteChartInstallation?: { __typename?: 'ChartInstallation', id?: string | null } | null };

export type ClusterFragment = { __typename?: 'Cluster', id: string, name: string, provider: Provider, source?: Source | null, pingedAt?: Date | null, gitUrl?: string | null, consoleUrl?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null, queue?: { __typename?: 'UpgradeQueue', id: string, acked?: string | null, upgrades?: { __typename?: 'UpgradeConnection', edges?: Array<{ __typename?: 'UpgradeEdge', node?: { __typename?: 'Upgrade', id: string } | null } | null> | null } | null } | null, upgradeInfo?: Array<{ __typename?: 'UpgradeInfo', count?: number | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null } | null> | null, dependency?: { __typename?: 'ClusterDependency', dependency?: { __typename?: 'Cluster', id: string, name: string, provider: Provider } | null } | null };

export type UpgradeInfoFragment = { __typename?: 'UpgradeInfo', count?: number | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null };

export type ClustersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ClustersQuery = { __typename?: 'RootQueryType', clusters?: { __typename?: 'ClusterConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'ClusterEdge', node?: { __typename?: 'Cluster', id: string, name: string, provider: Provider, source?: Source | null, pingedAt?: Date | null, gitUrl?: string | null, consoleUrl?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null, queue?: { __typename?: 'UpgradeQueue', id: string, acked?: string | null, upgrades?: { __typename?: 'UpgradeConnection', edges?: Array<{ __typename?: 'UpgradeEdge', node?: { __typename?: 'Upgrade', id: string } | null } | null> | null } | null } | null, upgradeInfo?: Array<{ __typename?: 'UpgradeInfo', count?: number | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null } | null> | null, dependency?: { __typename?: 'ClusterDependency', dependency?: { __typename?: 'Cluster', id: string, name: string, provider: Provider } | null } | null } | null } | null> | null } | null };

export type DnsRecordFragment = { __typename?: 'DnsRecord', id: string, name: string, type: DnsRecordType, records?: Array<string | null> | null, cluster: string, provider: Provider, insertedAt?: Date | null, creator?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null };

export type DnsRecordsQueryVariables = Exact<{
  cluster: Scalars['String']['input'];
  provider: Provider;
}>;


export type DnsRecordsQuery = { __typename?: 'RootQueryType', dnsRecords?: { __typename?: 'DnsRecordConnection', edges?: Array<{ __typename?: 'DnsRecordEdge', node?: { __typename?: 'DnsRecord', id: string, name: string, type: DnsRecordType, records?: Array<string | null> | null, cluster: string, provider: Provider, insertedAt?: Date | null, creator?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null } | null> | null } | null };

export type CreateDnsRecordMutationVariables = Exact<{
  cluster: Scalars['String']['input'];
  provider: Provider;
  attributes: DnsRecordAttributes;
}>;


export type CreateDnsRecordMutation = { __typename?: 'RootMutationType', createDnsRecord?: { __typename?: 'DnsRecord', id: string, name: string, type: DnsRecordType, records?: Array<string | null> | null, cluster: string, provider: Provider, insertedAt?: Date | null, creator?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null };

export type DeleteDnsRecordMutationVariables = Exact<{
  name: Scalars['String']['input'];
  type: DnsRecordType;
}>;


export type DeleteDnsRecordMutation = { __typename?: 'RootMutationType', deleteDnsRecord?: { __typename?: 'DnsRecord', id: string, name: string, type: DnsRecordType, records?: Array<string | null> | null, cluster: string, provider: Provider, insertedAt?: Date | null, creator?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null };

export type UpdateDomainMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  attributes: DnsDomainAttributes;
}>;


export type UpdateDomainMutation = { __typename?: 'RootMutationType', updateDomain?: { __typename?: 'DnsDomain', id: string, name: string, insertedAt?: Date | null, creator?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, accessPolicy?: { __typename?: 'DnsAccessPolicy', id: string, bindings?: Array<{ __typename?: 'PolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null };

export type DeleteDomainMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteDomainMutation = { __typename?: 'RootMutationType', deleteDomain?: { __typename?: 'DnsDomain', id: string, name: string, insertedAt?: Date | null, creator?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, accessPolicy?: { __typename?: 'DnsAccessPolicy', id: string, bindings?: Array<{ __typename?: 'PolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null };

export type DockerRepoFragment = { __typename?: 'DockerRepository', id: string, name: string, public?: boolean | null, insertedAt?: Date | null, updatedAt?: Date | null, repository?: { __typename?: 'Repository', id: string, name: string } | null };

export type DockerRepositoryFragment = { __typename?: 'DockerRepository', id: string, name: string, public?: boolean | null, insertedAt?: Date | null, updatedAt?: Date | null, repository?: { __typename?: 'Repository', id: string, name: string, editable?: boolean | null } | null };

export type DockerImageFragment = { __typename?: 'DockerImage', id: string, tag?: string | null, digest: string, scannedAt?: Date | null, grade?: ImageGrade | null, insertedAt?: Date | null, updatedAt?: Date | null };

export type VulnerabilityFragment = { __typename?: 'Vulnerability', id: string, title?: string | null, description?: string | null, vulnerabilityId?: string | null, package?: string | null, installedVersion?: string | null, fixedVersion?: string | null, source?: string | null, url?: string | null, severity?: VulnGrade | null, score?: number | null, cvss?: { __typename?: 'Cvss', attackVector?: VulnVector | null, attackComplexity?: VulnGrade | null, privilegesRequired?: VulnGrade | null, userInteraction?: VulnRequirement | null, confidentiality?: VulnGrade | null, integrity?: VulnGrade | null, availability?: VulnGrade | null } | null, layer?: { __typename?: 'ImageLayer', digest?: string | null, diffId?: string | null } | null };

export type CreateDomainMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateDomainMutation = { __typename?: 'RootMutationType', provisionDomain?: { __typename?: 'DnsDomain', id: string, name: string, insertedAt?: Date | null, creator?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, accessPolicy?: { __typename?: 'DnsAccessPolicy', id: string, bindings?: Array<{ __typename?: 'PolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null };

export type GroupMembersQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
}>;


export type GroupMembersQuery = { __typename?: 'RootQueryType', groupMembers?: { __typename?: 'GroupMemberConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'GroupMemberEdge', node?: { __typename?: 'GroupMember', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null } | null> | null } | null };

export type CreateGroupMemberMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type CreateGroupMemberMutation = { __typename?: 'RootMutationType', createGroupMember?: { __typename?: 'GroupMember', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null };

export type DeleteGroupMemberMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type DeleteGroupMemberMutation = { __typename?: 'RootMutationType', deleteGroupMember?: { __typename?: 'GroupMember', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null };

export type CreateGroupMutationVariables = Exact<{
  attributes: GroupAttributes;
}>;


export type CreateGroupMutation = { __typename?: 'RootMutationType', createGroup?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null };

export type UpdateGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  attributes: GroupAttributes;
}>;


export type UpdateGroupMutation = { __typename?: 'RootMutationType', updateGroup?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null };

export type DeleteGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGroupMutation = { __typename?: 'RootMutationType', deleteGroup?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null };

export type GroupsQueryVariables = Exact<{
  q?: InputMaybe<Scalars['String']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type GroupsQuery = { __typename?: 'RootQueryType', groups?: { __typename?: 'GroupConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'GroupEdge', node?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null } | null };

export type PostmortemFragment = { __typename?: 'Postmortem', id: string, content: string, actionItems?: Array<{ __typename?: 'ActionItem', type: ActionItemType, link: string } | null> | null };

export type FollowerFragment = { __typename?: 'Follower', id: string, incident?: { __typename?: 'Incident', id: string } | null, user: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null }, preferences?: { __typename?: 'NotificationPreferences', message?: boolean | null, incidentUpdate?: boolean | null, mention?: boolean | null } | null };

export type SlimSubscriptionFragment = { __typename?: 'SlimSubscription', id: string, lineItems?: { __typename?: 'SubscriptionLineItems', items?: Array<{ __typename?: 'Limit', dimension: string, quantity: number } | null> | null } | null, plan?: { __typename?: 'Plan', id: string, name: string, cost: number, period?: string | null, serviceLevels?: Array<{ __typename?: 'ServiceLevel', minSeverity?: number | null, maxSeverity?: number | null, responseTime?: number | null } | null> | null, lineItems?: { __typename?: 'PlanLineItems', included?: Array<{ __typename?: 'Limit', dimension: string, quantity: number } | null> | null, items?: Array<{ __typename?: 'LineItem', name: string, dimension: string, cost: number, period?: string | null, type?: PlanType | null } | null> | null } | null, metadata?: { __typename?: 'PlanMetadata', features?: Array<{ __typename?: 'PlanFeature', name: string, description: string } | null> | null } | null } | null };

export type ClusterInformationFragment = { __typename?: 'ClusterInformation', version?: string | null, gitCommit?: string | null, platform?: string | null };

export type IncidentFragment = { __typename?: 'Incident', id: string, title: string, description?: string | null, severity: number, status: IncidentStatus, notificationCount?: number | null, nextResponseAt?: Date | null, insertedAt?: Date | null, creator: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null }, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, repository: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null }, subscription?: { __typename?: 'SlimSubscription', id: string, lineItems?: { __typename?: 'SubscriptionLineItems', items?: Array<{ __typename?: 'Limit', dimension: string, quantity: number } | null> | null } | null, plan?: { __typename?: 'Plan', id: string, name: string, cost: number, period?: string | null, serviceLevels?: Array<{ __typename?: 'ServiceLevel', minSeverity?: number | null, maxSeverity?: number | null, responseTime?: number | null } | null> | null, lineItems?: { __typename?: 'PlanLineItems', included?: Array<{ __typename?: 'Limit', dimension: string, quantity: number } | null> | null, items?: Array<{ __typename?: 'LineItem', name: string, dimension: string, cost: number, period?: string | null, type?: PlanType | null } | null> | null } | null, metadata?: { __typename?: 'PlanMetadata', features?: Array<{ __typename?: 'PlanFeature', name: string, description: string } | null> | null } | null } | null } | null, clusterInformation?: { __typename?: 'ClusterInformation', version?: string | null, gitCommit?: string | null, platform?: string | null } | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null };

export type IncidentHistoryFragment = { __typename?: 'IncidentHistory', id: string, action: IncidentAction, insertedAt?: Date | null, changes?: Array<{ __typename?: 'IncidentChange', key: string, prev?: string | null, next?: string | null } | null> | null, actor: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } };

export type FileFragment = { __typename?: 'File', id: string, blob: string, mediaType?: MediaType | null, contentType?: string | null, filesize?: number | null, filename?: string | null };

export type IncidentMessageFragment = { __typename?: 'IncidentMessage', id: string, text: string, insertedAt?: Date | null, creator: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null }, reactions?: Array<{ __typename?: 'Reaction', name: string, creator: { __typename?: 'User', id: string, email: string } } | null> | null, file?: { __typename?: 'File', id: string, blob: string, mediaType?: MediaType | null, contentType?: string | null, filesize?: number | null, filename?: string | null } | null, entities?: Array<{ __typename?: 'MessageEntity', type: MessageEntityType, text?: string | null, startIndex?: number | null, endIndex?: number | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null> | null };

export type NotificationFragment = { __typename?: 'Notification', id: string, type: NotificationType, msg?: string | null, insertedAt?: Date | null, actor: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null }, incident?: { __typename?: 'Incident', id: string, title: string, repository: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null } } | null, message?: { __typename?: 'IncidentMessage', text: string } | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null } | null };

export type InstallationRepoFragment = { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null };

export type InstallationFragment = { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null };

export type IntegrationWebhookFragment = { __typename?: 'IntegrationWebhook', id: string, name: string, url: string, secret: string, actions?: Array<string | null> | null };

export type WebhookLogFragment = { __typename?: 'WebhookLog', id: string, state: WebhookLogState, status?: number | null, payload?: Map<string, unknown> | null, response?: string | null, insertedAt?: Date | null };

export type OauthIntegrationFragment = { __typename?: 'OauthIntegration', id: string, service: OauthService, insertedAt?: Date | null };

export type ZoomMeetingFragment = { __typename?: 'ZoomMeeting', joinUrl: string, password?: string | null };

export type OauthIntegrationsQueryVariables = Exact<{ [key: string]: never; }>;


export type OauthIntegrationsQuery = { __typename?: 'RootQueryType', oauthIntegrations?: Array<{ __typename?: 'OauthIntegration', id: string, service: OauthService, insertedAt?: Date | null } | null> | null };

export type CreateOauthIntegrationMutationVariables = Exact<{
  attributes: OauthAttributes;
}>;


export type CreateOauthIntegrationMutation = { __typename?: 'RootMutationType', createOauthIntegration?: { __typename?: 'OauthIntegration', id: string, service: OauthService, insertedAt?: Date | null } | null };

export type InviteFragment = { __typename?: 'Invite', id: string, secureId?: string | null, email?: string | null, existing: boolean, insertedAt?: Date | null, account?: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, account: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null }, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null };

export type InviteQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type InviteQuery = { __typename?: 'RootQueryType', invite?: { __typename?: 'Invite', id: string, secureId?: string | null, email?: string | null, existing: boolean, insertedAt?: Date | null, account?: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, account: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null }, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null };

export type CreateInviteMutationVariables = Exact<{
  attributes: InviteAttributes;
}>;


export type CreateInviteMutation = { __typename?: 'RootMutationType', createInvite?: { __typename?: 'Invite', id: string, secureId?: string | null, email?: string | null, existing: boolean, insertedAt?: Date | null, account?: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, account: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null }, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null };

export type SignupInviteMutationVariables = Exact<{
  attributes: UserAttributes;
  inviteId: Scalars['String']['input'];
}>;


export type SignupInviteMutation = { __typename?: 'RootMutationType', signup?: { __typename?: 'User', jwt?: string | null } | null };

export type RealizeInviteMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type RealizeInviteMutation = { __typename?: 'RootMutationType', realizeInvite?: { __typename?: 'User', jwt?: string | null } | null };

export type DeleteInviteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteInviteMutation = { __typename?: 'RootMutationType', deleteInvite?: { __typename?: 'Invite', id: string, secureId?: string | null, email?: string | null, existing: boolean, insertedAt?: Date | null, account?: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, account: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null }, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null };

export type KeyBackupUserFragment = { __typename?: 'User', email: string };

export type KeyBackupFragment = { __typename?: 'KeyBackup', digest: string, id: string, insertedAt?: Date | null, name: string, repositories?: Array<string> | null, updatedAt?: Date | null, value: string, user: { __typename?: 'User', email: string } };

export type KeyBackupsQueryVariables = Exact<{ [key: string]: never; }>;


export type KeyBackupsQuery = { __typename?: 'RootQueryType', keyBackups?: { __typename?: 'KeyBackupConnection', edges?: Array<{ __typename?: 'KeyBackupEdge', node?: { __typename?: 'KeyBackup', digest: string, id: string, insertedAt?: Date | null, name: string, repositories?: Array<string> | null, updatedAt?: Date | null, value: string, user: { __typename?: 'User', email: string } } | null } | null> | null } | null };

export type KeyBackupQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type KeyBackupQuery = { __typename?: 'RootQueryType', keyBackup?: { __typename?: 'KeyBackup', digest: string, id: string, insertedAt?: Date | null, name: string, repositories?: Array<string> | null, updatedAt?: Date | null, value: string, user: { __typename?: 'User', email: string } } | null };

export type DeleteKeyBackupMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type DeleteKeyBackupMutation = { __typename?: 'RootMutationType', deleteKeyBackup?: { __typename?: 'KeyBackup', digest: string, id: string, insertedAt?: Date | null, name: string, repositories?: Array<string> | null, updatedAt?: Date | null, value: string, user: { __typename?: 'User', email: string } } | null };

export type CreateKeyBackupMutationVariables = Exact<{
  attributes: KeyBackupAttributes;
}>;


export type CreateKeyBackupMutation = { __typename?: 'RootMutationType', createKeyBackup?: { __typename?: 'KeyBackup', digest: string, id: string, insertedAt?: Date | null, name: string, repositories?: Array<string> | null, updatedAt?: Date | null, value: string, user: { __typename?: 'User', email: string } } | null };

export type CategoryInfoFragment = { __typename?: 'CategoryInfo', category?: Category | null, count?: number | null };

export type GroupedTagFragment = { __typename?: 'GroupedTag', tag: string, count: number };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { __typename?: 'RootQueryType', categories?: Array<{ __typename?: 'CategoryInfo', category?: Category | null, count?: number | null } | null> | null };

export type TagsQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type TagsQuery = { __typename?: 'RootQueryType', tags?: { __typename?: 'GroupedTagConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'GroupedTagEdge', node?: { __typename?: 'GroupedTag', tag: string, count: number } | null } | null> | null } | null };

export type MetricFragment = { __typename?: 'Metric', name: string, tags?: Array<{ __typename?: 'MetricTag', name: string, value: string } | null> | null, values?: Array<{ __typename?: 'MetricValue', time?: Date | null, value?: number | null } | null> | null };

export type PageInfoFragment = { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean };

export type NotificationFragmentFragment = { __typename?: 'Notification', id: string, type: NotificationType, msg?: string | null, insertedAt?: Date | null, actor: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null }, incident?: { __typename?: 'Incident', id: string, title: string, repository: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null } } | null, message?: { __typename?: 'IncidentMessage', text: string } | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null } | null };

export type NotificationsQueryVariables = Exact<{
  incidentId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type NotificationsQuery = { __typename?: 'RootQueryType', notifications?: { __typename?: 'NotificationConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'NotificationEdge', node?: { __typename?: 'Notification', id: string, type: NotificationType, msg?: string | null, insertedAt?: Date | null, actor: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null }, incident?: { __typename?: 'Incident', id: string, title: string, repository: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null } } | null, message?: { __typename?: 'IncidentMessage', text: string } | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null } | null } | null } | null> | null } | null };

export type OidcProviderFragment = { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null };

export type OidcProviderBindingFragment = { __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null };

export type OAuthInfoFragment = { __typename?: 'OauthInfo', provider: OauthProvider, authorizeUrl: string };

export type OidcConsentQueryVariables = Exact<{
  challenge: Scalars['String']['input'];
}>;


export type OidcConsentQuery = { __typename?: 'RootQueryType', oidcConsent?: { __typename?: 'OidcStepResponse', repository?: { __typename?: 'Repository', name: string, icon?: string | null, darkIcon?: string | null } | null, consent?: { __typename?: 'ConsentRequest', requestedScope?: Array<string | null> | null, skip?: boolean | null } | null } | null };

export type ConsentMutationVariables = Exact<{
  challenge: Scalars['String']['input'];
  scopes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type ConsentMutation = { __typename?: 'RootMutationType', oauthConsent?: { __typename?: 'OauthResponse', redirectTo: string } | null };

export type OidcProvidersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
}>;


export type OidcProvidersQuery = { __typename?: 'RootQueryType', oidcProviders?: { __typename?: 'OidcProviderConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'OidcProviderEdge', node?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null> | null } | null };

export type CreateProviderMutationVariables = Exact<{
  installationId?: InputMaybe<Scalars['ID']['input']>;
  attributes: OidcAttributes;
}>;


export type CreateProviderMutation = { __typename?: 'RootMutationType', createOidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null };

export type UpdateProviderMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  installationId?: InputMaybe<Scalars['ID']['input']>;
  attributes: OidcAttributes;
}>;


export type UpdateProviderMutation = { __typename?: 'RootMutationType', updateOidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null };

export type DeleteProviderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteProviderMutation = { __typename?: 'RootMutationType', deleteOidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null };

export type LimitFragment = { __typename?: 'Limit', dimension: string, quantity: number };

export type LineItemFragment = { __typename?: 'LineItem', name: string, dimension: string, cost: number, period?: string | null, type?: PlanType | null };

export type ServiceLevelFragment = { __typename?: 'ServiceLevel', minSeverity?: number | null, maxSeverity?: number | null, responseTime?: number | null };

export type PlanFragment = { __typename?: 'Plan', id: string, name: string, cost: number, period?: string | null, serviceLevels?: Array<{ __typename?: 'ServiceLevel', minSeverity?: number | null, maxSeverity?: number | null, responseTime?: number | null } | null> | null, lineItems?: { __typename?: 'PlanLineItems', included?: Array<{ __typename?: 'Limit', dimension: string, quantity: number } | null> | null, items?: Array<{ __typename?: 'LineItem', name: string, dimension: string, cost: number, period?: string | null, type?: PlanType | null } | null> | null } | null, metadata?: { __typename?: 'PlanMetadata', features?: Array<{ __typename?: 'PlanFeature', name: string, description: string } | null> | null } | null };

export type SubscriptionFragment = { __typename?: 'RepositorySubscription', id: string, plan?: { __typename?: 'Plan', id: string, name: string, cost: number, period?: string | null, serviceLevels?: Array<{ __typename?: 'ServiceLevel', minSeverity?: number | null, maxSeverity?: number | null, responseTime?: number | null } | null> | null, lineItems?: { __typename?: 'PlanLineItems', included?: Array<{ __typename?: 'Limit', dimension: string, quantity: number } | null> | null, items?: Array<{ __typename?: 'LineItem', name: string, dimension: string, cost: number, period?: string | null, type?: PlanType | null } | null> | null } | null, metadata?: { __typename?: 'PlanMetadata', features?: Array<{ __typename?: 'PlanFeature', name: string, description: string } | null> | null } | null } | null, lineItems?: { __typename?: 'SubscriptionLineItems', items?: Array<{ __typename?: 'Limit', dimension: string, quantity: number } | null> | null } | null };

export type InvoiceItemFragment = { __typename?: 'InvoiceItem', amount: number, currency: string, description?: string | null };

export type PaymentIntentFragment = { __typename?: 'PaymentIntent', id?: string | null, description?: string | null, clientSecret?: string | null, amount?: number | null, captureMethod?: string | null, currency?: string | null, status?: string | null, nextAction?: { __typename?: 'NextAction', type?: string | null, redirectToUrl?: { __typename?: 'RedirectToUrl', url?: string | null, returnUrl?: string | null } | null } | null };

export type NextActionFragment = { __typename?: 'NextAction', type?: string | null, redirectToUrl?: { __typename?: 'RedirectToUrl', url?: string | null, returnUrl?: string | null } | null };

export type InvoiceFragment = { __typename?: 'Invoice', number: string, amountDue: number, amountPaid: number, currency: string, status?: string | null, createdAt?: Date | null, hostedInvoiceUrl?: string | null, lines?: Array<{ __typename?: 'InvoiceItem', amount: number, currency: string, description?: string | null } | null> | null };

export type CardFragment = { __typename?: 'Card', last4: string, expMonth: number, expYear: number, name?: string | null, brand: string };

export type PlatformPlanFragment = { __typename?: 'PlatformPlan', id: string, name: string, cost: number, period: PaymentPeriod, enterprise?: boolean | null, trial?: boolean | null, features?: { __typename?: 'PlanFeatures', vpn?: boolean | null, userManagement?: boolean | null, audit?: boolean | null } | null, lineItems?: Array<{ __typename?: 'PlatformPlanItem', name: string, dimension: LineItemDimension, cost: number, period: PaymentPeriod } | null> | null };

export type SubscriptionAccountFragment = { __typename?: 'Account', id: string, billingCustomerId?: string | null, grandfatheredUntil?: Date | null, delinquentAt?: Date | null, userCount?: string | null, clusterCount?: string | null, trialed?: boolean | null, availableFeatures?: { __typename?: 'PlanFeatures', userManagement?: boolean | null, audit?: boolean | null } | null, subscription?: { __typename?: 'PlatformSubscription', id: string, trialUntil?: Date | null, plan?: { __typename?: 'PlatformPlan', id: string, name: string, cost: number, period: PaymentPeriod, enterprise?: boolean | null, trial?: boolean | null, features?: { __typename?: 'PlanFeatures', vpn?: boolean | null, userManagement?: boolean | null, audit?: boolean | null } | null, lineItems?: Array<{ __typename?: 'PlatformPlanItem', name: string, dimension: LineItemDimension, cost: number, period: PaymentPeriod } | null> | null } | null } | null, billingAddress?: { __typename?: 'Address', name?: string | null, line1?: string | null, line2?: string | null, zip?: string | null, state?: string | null, city?: string | null, country?: string | null } | null, paymentMethods?: { __typename?: 'PaymentMethodConnection', edges?: Array<{ __typename?: 'PaymentMethodEdge', node?: { __typename?: 'PaymentMethod', id?: string | null, type?: string | null, isDefault?: boolean | null, card?: { __typename?: 'Card', last4: string, expMonth: number, expYear: number, name?: string | null, brand: string } | null } | null } | null> | null } | null };

export type SubscriptionQueryVariables = Exact<{ [key: string]: never; }>;


export type SubscriptionQuery = { __typename?: 'RootQueryType', account?: { __typename?: 'Account', id: string, billingCustomerId?: string | null, grandfatheredUntil?: Date | null, delinquentAt?: Date | null, userCount?: string | null, clusterCount?: string | null, trialed?: boolean | null, availableFeatures?: { __typename?: 'PlanFeatures', userManagement?: boolean | null, audit?: boolean | null } | null, subscription?: { __typename?: 'PlatformSubscription', id: string, trialUntil?: Date | null, plan?: { __typename?: 'PlatformPlan', id: string, name: string, cost: number, period: PaymentPeriod, enterprise?: boolean | null, trial?: boolean | null, features?: { __typename?: 'PlanFeatures', vpn?: boolean | null, userManagement?: boolean | null, audit?: boolean | null } | null, lineItems?: Array<{ __typename?: 'PlatformPlanItem', name: string, dimension: LineItemDimension, cost: number, period: PaymentPeriod } | null> | null } | null } | null, billingAddress?: { __typename?: 'Address', name?: string | null, line1?: string | null, line2?: string | null, zip?: string | null, state?: string | null, city?: string | null, country?: string | null } | null, paymentMethods?: { __typename?: 'PaymentMethodConnection', edges?: Array<{ __typename?: 'PaymentMethodEdge', node?: { __typename?: 'PaymentMethod', id?: string | null, type?: string | null, isDefault?: boolean | null, card?: { __typename?: 'Card', last4: string, expMonth: number, expYear: number, name?: string | null, brand: string } | null } | null } | null> | null } | null } | null };

export type UpdateAccountBillingMutationVariables = Exact<{
  attributes: AccountAttributes;
}>;


export type UpdateAccountBillingMutation = { __typename?: 'RootMutationType', updateAccount?: { __typename?: 'Account', id: string } | null };

export type DowngradeToFreePlanMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type DowngradeToFreePlanMutationMutation = { __typename?: 'RootMutationType', deletePlatformSubscription?: { __typename?: 'Account', id: string } | null };

export type CardsQueryVariables = Exact<{ [key: string]: never; }>;


export type CardsQuery = { __typename?: 'RootQueryType', me?: { __typename?: 'User', id: string, cards?: { __typename?: 'CardConnection', edges?: Array<{ __typename?: 'CardEdge', node?: { __typename?: 'Card', last4: string, expMonth: number, expYear: number, name?: string | null, brand: string } | null } | null> | null } | null } | null };

export type SetupIntentFragment = { __typename?: 'SetupIntent', id?: string | null, status?: string | null, clientSecret?: string | null, paymentMethodTypes?: Array<string | null> | null, nextAction?: { __typename?: 'NextAction', type?: string | null, redirectToUrl?: { __typename?: 'RedirectToUrl', url?: string | null, returnUrl?: string | null } | null } | null };

export type SetupIntentMutationVariables = Exact<{
  address: AddressAttributes;
}>;


export type SetupIntentMutation = { __typename?: 'RootMutationType', setupIntent?: { __typename?: 'SetupIntent', id?: string | null, status?: string | null, clientSecret?: string | null, paymentMethodTypes?: Array<string | null> | null, nextAction?: { __typename?: 'NextAction', type?: string | null, redirectToUrl?: { __typename?: 'RedirectToUrl', url?: string | null, returnUrl?: string | null } | null } | null } | null };

export type PaymentMethodFragment = { __typename?: 'PaymentMethod', id?: string | null, type?: string | null, isDefault?: boolean | null, card?: { __typename?: 'Card', last4: string, expMonth: number, expYear: number, name?: string | null, brand: string } | null };

export type InitiateCheckoutMutationVariables = Exact<{ [key: string]: never; }>;


export type InitiateCheckoutMutation = { __typename?: 'RootMutationType', initiateCheckout?: { __typename?: 'CheckoutSession', url?: string | null } | null };

export type FinalizeCheckoutMutationVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;


export type FinalizeCheckoutMutation = { __typename?: 'RootMutationType', finalizeCheckout?: { __typename?: 'PlatformSubscription', id: string } | null };

export type DefaultPaymentMethodMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DefaultPaymentMethodMutation = { __typename?: 'RootMutationType', defaultPaymentMethod?: boolean | null };

export type DeletePaymentMethodMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeletePaymentMethodMutation = { __typename?: 'RootMutationType', deletePaymentMethod?: { __typename?: 'PaymentMethod', id?: string | null, type?: string | null, isDefault?: boolean | null, card?: { __typename?: 'Card', last4: string, expMonth: number, expYear: number, name?: string | null, brand: string } | null } | null };

export type InvoicesQueryVariables = Exact<{ [key: string]: never; }>;


export type InvoicesQuery = { __typename?: 'RootQueryType', invoices?: { __typename?: 'InvoiceConnection', edges?: Array<{ __typename?: 'InvoiceEdge', node?: { __typename?: 'Invoice', number: string, amountDue: number, amountPaid: number, currency: string, status?: string | null, createdAt?: Date | null, hostedInvoiceUrl?: string | null, lines?: Array<{ __typename?: 'InvoiceItem', amount: number, currency: string, description?: string | null } | null> | null } | null } | null> | null } | null };

export type ConsoleInstanceFragment = { __typename?: 'ConsoleInstance', id: string, name: string, subdomain: string, url: string, cloud: CloudProvider, size: ConsoleSize, region: string, status: ConsoleInstanceStatus, type: ConsoleInstanceType, deletedAt?: Date | null, insertedAt?: Date | null, updatedAt?: Date | null, console?: { __typename?: 'Cluster', id: string, pingedAt?: Date | null, consoleUrl?: string | null } | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null, oidc?: { __typename?: 'ConsoleInstanceOidc', clientId?: string | null, clientSecret?: string | null, issuer?: string | null } | null, network?: { __typename?: 'ConsoleInstanceNetwork', allowedCidrs?: Array<string | null> | null } | null };

export type ConsoleInstanceOidcFragment = { __typename?: 'ConsoleInstanceOidc', clientId?: string | null, clientSecret?: string | null, issuer?: string | null };

export type ConsoleInstanceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ConsoleInstanceQuery = { __typename?: 'RootQueryType', consoleInstance?: { __typename?: 'ConsoleInstance', id: string, name: string, subdomain: string, url: string, cloud: CloudProvider, size: ConsoleSize, region: string, status: ConsoleInstanceStatus, type: ConsoleInstanceType, deletedAt?: Date | null, insertedAt?: Date | null, updatedAt?: Date | null, console?: { __typename?: 'Cluster', id: string, pingedAt?: Date | null, consoleUrl?: string | null } | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null, oidc?: { __typename?: 'ConsoleInstanceOidc', clientId?: string | null, clientSecret?: string | null, issuer?: string | null } | null, network?: { __typename?: 'ConsoleInstanceNetwork', allowedCidrs?: Array<string | null> | null } | null } | null };

export type ConsoleInstancesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ConsoleInstancesQuery = { __typename?: 'RootQueryType', consoleInstances?: { __typename?: 'ConsoleInstanceConnection', edges?: Array<{ __typename?: 'ConsoleInstanceEdge', node?: { __typename?: 'ConsoleInstance', id: string, name: string, subdomain: string, url: string, cloud: CloudProvider, size: ConsoleSize, region: string, status: ConsoleInstanceStatus, type: ConsoleInstanceType, deletedAt?: Date | null, insertedAt?: Date | null, updatedAt?: Date | null, console?: { __typename?: 'Cluster', id: string, pingedAt?: Date | null, consoleUrl?: string | null } | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null, oidc?: { __typename?: 'ConsoleInstanceOidc', clientId?: string | null, clientSecret?: string | null, issuer?: string | null } | null, network?: { __typename?: 'ConsoleInstanceNetwork', allowedCidrs?: Array<string | null> | null } | null } | null } | null> | null, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } | null };

export type CreateConsoleInstanceMutationVariables = Exact<{
  attributes: ConsoleInstanceAttributes;
}>;


export type CreateConsoleInstanceMutation = { __typename?: 'RootMutationType', createConsoleInstance?: { __typename?: 'ConsoleInstance', id: string, name: string, subdomain: string, url: string, cloud: CloudProvider, size: ConsoleSize, region: string, status: ConsoleInstanceStatus, type: ConsoleInstanceType, deletedAt?: Date | null, insertedAt?: Date | null, updatedAt?: Date | null, console?: { __typename?: 'Cluster', id: string, pingedAt?: Date | null, consoleUrl?: string | null } | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null, oidc?: { __typename?: 'ConsoleInstanceOidc', clientId?: string | null, clientSecret?: string | null, issuer?: string | null } | null, network?: { __typename?: 'ConsoleInstanceNetwork', allowedCidrs?: Array<string | null> | null } | null } | null };

export type UpdateConsoleInstanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  attributes: ConsoleInstanceUpdateAttributes;
}>;


export type UpdateConsoleInstanceMutation = { __typename?: 'RootMutationType', updateConsoleInstance?: { __typename?: 'ConsoleInstance', id: string, name: string, subdomain: string, url: string, cloud: CloudProvider, size: ConsoleSize, region: string, status: ConsoleInstanceStatus, type: ConsoleInstanceType, deletedAt?: Date | null, insertedAt?: Date | null, updatedAt?: Date | null, console?: { __typename?: 'Cluster', id: string, pingedAt?: Date | null, consoleUrl?: string | null } | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null, oidc?: { __typename?: 'ConsoleInstanceOidc', clientId?: string | null, clientSecret?: string | null, issuer?: string | null } | null, network?: { __typename?: 'ConsoleInstanceNetwork', allowedCidrs?: Array<string | null> | null } | null } | null };

export type DeleteConsoleInstanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteConsoleInstanceMutation = { __typename?: 'RootMutationType', deleteConsoleInstance?: { __typename?: 'ConsoleInstance', id: string, name: string, subdomain: string, url: string, cloud: CloudProvider, size: ConsoleSize, region: string, status: ConsoleInstanceStatus, type: ConsoleInstanceType, deletedAt?: Date | null, insertedAt?: Date | null, updatedAt?: Date | null, console?: { __typename?: 'Cluster', id: string, pingedAt?: Date | null, consoleUrl?: string | null } | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null, oidc?: { __typename?: 'ConsoleInstanceOidc', clientId?: string | null, clientSecret?: string | null, issuer?: string | null } | null, network?: { __typename?: 'ConsoleInstanceNetwork', allowedCidrs?: Array<string | null> | null } | null } | null };

export type UpdateOidcProviderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  attributes: OidcAttributes;
}>;


export type UpdateOidcProviderMutation = { __typename?: 'RootMutationType', updateOidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null };

export type RecipeFragment = { __typename?: 'Recipe', id: string, name: string, description?: string | null, restricted?: boolean | null, provider?: Provider | null, tests?: Array<{ __typename?: 'RecipeTest', type: TestType, name: string, message?: string | null, args?: Array<{ __typename?: 'TestArgument', name: string, repo: string, key: string } | null> | null } | null> | null, repository?: { __typename?: 'Repository', id: string, name: string } | null, oidcSettings?: { __typename?: 'OidcSettings', uriFormat?: string | null, uriFormats?: Array<string | null> | null, authMethod: OidcAuthMethod, domainKey?: string | null, subdomain?: boolean | null } | null, recipeSections?: Array<{ __typename?: 'RecipeSection', index?: number | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null, recipeItems?: Array<{ __typename?: 'RecipeItem', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null };

export type RecipeItemFragment = { __typename?: 'RecipeItem', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null };

export type RecipeSectionFragment = { __typename?: 'RecipeSection', index?: number | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null, recipeItems?: Array<{ __typename?: 'RecipeItem', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null };

export type RecipeConfigurationFragment = { __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null };

export type StackFragment = { __typename?: 'Stack', id: string, name: string, displayName?: string | null, description?: string | null, featured?: boolean | null, creator?: { __typename?: 'User', id: string, name: string } | null, collections?: Array<{ __typename?: 'StackCollection', id: string, provider: Provider, bundles?: Array<{ __typename?: 'StackRecipe', recipe: { __typename?: 'Recipe', repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null } } | null> | null } | null> | null };

export type StackCollectionFragment = { __typename?: 'StackCollection', id: string, provider: Provider, bundles?: Array<{ __typename?: 'StackRecipe', recipe: { __typename?: 'Recipe', repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null } } | null> | null };

export type GetRecipeQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetRecipeQuery = { __typename?: 'RootQueryType', recipe?: { __typename?: 'Recipe', id: string, name: string, description?: string | null, restricted?: boolean | null, provider?: Provider | null, recipeDependencies?: Array<{ __typename?: 'Recipe', id: string, name: string, description?: string | null, restricted?: boolean | null, provider?: Provider | null, tests?: Array<{ __typename?: 'RecipeTest', type: TestType, name: string, message?: string | null, args?: Array<{ __typename?: 'TestArgument', name: string, repo: string, key: string } | null> | null } | null> | null, repository?: { __typename?: 'Repository', id: string, name: string } | null, oidcSettings?: { __typename?: 'OidcSettings', uriFormat?: string | null, uriFormats?: Array<string | null> | null, authMethod: OidcAuthMethod, domainKey?: string | null, subdomain?: boolean | null } | null, recipeSections?: Array<{ __typename?: 'RecipeSection', index?: number | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null, recipeItems?: Array<{ __typename?: 'RecipeItem', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null } | null> | null, tests?: Array<{ __typename?: 'RecipeTest', type: TestType, name: string, message?: string | null, args?: Array<{ __typename?: 'TestArgument', name: string, repo: string, key: string } | null> | null } | null> | null, repository?: { __typename?: 'Repository', id: string, name: string } | null, oidcSettings?: { __typename?: 'OidcSettings', uriFormat?: string | null, uriFormats?: Array<string | null> | null, authMethod: OidcAuthMethod, domainKey?: string | null, subdomain?: boolean | null } | null, recipeSections?: Array<{ __typename?: 'RecipeSection', index?: number | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null, recipeItems?: Array<{ __typename?: 'RecipeItem', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null } | null };

export type ListRecipesQueryVariables = Exact<{
  repositoryName?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Provider>;
}>;


export type ListRecipesQuery = { __typename?: 'RootQueryType', recipes?: { __typename?: 'RecipeConnection', edges?: Array<{ __typename?: 'RecipeEdge', node?: { __typename?: 'Recipe', id: string, name: string, description?: string | null, restricted?: boolean | null, provider?: Provider | null, tests?: Array<{ __typename?: 'RecipeTest', type: TestType, name: string, message?: string | null, args?: Array<{ __typename?: 'TestArgument', name: string, repo: string, key: string } | null> | null } | null> | null, repository?: { __typename?: 'Repository', id: string, name: string } | null, oidcSettings?: { __typename?: 'OidcSettings', uriFormat?: string | null, uriFormats?: Array<string | null> | null, authMethod: OidcAuthMethod, domainKey?: string | null, subdomain?: boolean | null } | null, recipeSections?: Array<{ __typename?: 'RecipeSection', index?: number | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null } | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null, recipeItems?: Array<{ __typename?: 'RecipeItem', id?: string | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null, configuration?: Array<{ __typename?: 'RecipeConfiguration', name?: string | null, type?: Datatype | null, default?: string | null, documentation?: string | null, optional?: boolean | null, placeholder?: string | null, functionName?: string | null, condition?: { __typename?: 'RecipeCondition', field: string, operation: Operation, value?: string | null } | null, validation?: { __typename?: 'RecipeValidation', type: ValidationType, regex?: string | null, message: string } | null } | null> | null } | null> | null } | null } | null> | null } | null };

export type CreateRecipeMutationVariables = Exact<{
  name: Scalars['String']['input'];
  attributes: RecipeAttributes;
}>;


export type CreateRecipeMutation = { __typename?: 'RootMutationType', createRecipe?: { __typename?: 'Recipe', id: string } | null };

export type InstallRecipeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type InstallRecipeMutation = { __typename?: 'RootMutationType', installRecipe?: Array<{ __typename?: 'Installation', id: string } | null> | null };

export type CreateStackMutationVariables = Exact<{
  attributes: StackAttributes;
}>;


export type CreateStackMutation = { __typename?: 'RootMutationType', createStack?: { __typename?: 'Stack', id: string } | null };

export type GetStackQueryVariables = Exact<{
  name: Scalars['String']['input'];
  provider: Provider;
}>;


export type GetStackQuery = { __typename?: 'RootQueryType', stack?: { __typename?: 'Stack', id: string, name: string, displayName?: string | null, description?: string | null, featured?: boolean | null, creator?: { __typename?: 'User', id: string, name: string } | null, collections?: Array<{ __typename?: 'StackCollection', id: string, provider: Provider, bundles?: Array<{ __typename?: 'StackRecipe', recipe: { __typename?: 'Recipe', repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null } } | null> | null } | null> | null } | null };

export type ListStacksQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type ListStacksQuery = { __typename?: 'RootQueryType', stacks?: { __typename?: 'StackConnection', edges?: Array<{ __typename?: 'StackEdge', node?: { __typename?: 'Stack', id: string, name: string, displayName?: string | null, description?: string | null, featured?: boolean | null, creator?: { __typename?: 'User', id: string, name: string } | null, collections?: Array<{ __typename?: 'StackCollection', id: string, provider: Provider, bundles?: Array<{ __typename?: 'StackRecipe', recipe: { __typename?: 'Recipe', repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null } } | null> | null } | null> | null } | null } | null> | null } | null };

export type ApplyLockFragment = { __typename?: 'ApplyLock', id: string, lock?: string | null };

export type CategoryFragment = { __typename?: 'CategoryInfo', category?: Category | null, count?: number | null };

export type FileContentFragment = { __typename?: 'FileContent', content: string, path: string };

export type RepoFragment = { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null };

export type RepositoryFragment = { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, installation?: { __typename?: 'Installation', pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null } | null };

export type MarketplaceRepositoryFragment = { __typename?: 'Repository', id: string, name: string, description?: string | null, releaseStatus?: ReleaseStatus | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, installation?: { __typename?: 'Installation', id: string } | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null };

export type DependenciesFragment = { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null };

export type IntegrationFragment = { __typename?: 'Integration', id: string, name: string, icon?: string | null, sourceUrl?: string | null, description?: string | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null };

export type RepositoryQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type RepositoryQuery = { __typename?: 'RootQueryType', repository?: { __typename?: 'Repository', editable?: boolean | null, publicKey?: string | null, secrets?: Map<string, unknown> | null, upgradeChannels?: Array<string | null> | null, readme?: string | null, mainBranch?: string | null, gitUrl?: string | null, homepage?: string | null, documentation?: string | null, id: string, name: string, notes?: string | null, description?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, artifacts?: Array<{ __typename?: 'Artifact', id?: string | null, name?: string | null, blob?: string | null, type?: ArtifactType | null, platform?: ArtifactPlatform | null, arch?: string | null, filesize?: number | null, sha?: string | null, readme?: string | null, insertedAt?: Date | null, updatedAt?: Date | null } | null> | null, installation?: { __typename?: 'Installation', id: string, context?: Map<string, unknown> | null, license?: string | null, licenseKey?: string | null, acmeKeyId?: string | null, acmeSecret?: string | null, autoUpgrade?: boolean | null, trackTag: string, pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null, oidcProvider?: { __typename?: 'OidcProvider', id: string, name?: string | null, description?: string | null, clientId: string, authMethod: OidcAuthMethod, clientSecret: string, redirectUris?: Array<string | null> | null, bindings?: Array<{ __typename?: 'OidcProviderBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null, configuration?: { __typename?: 'OuathConfiguration', issuer?: string | null, authorizationEndpoint?: string | null, tokenEndpoint?: string | null, jwksUri?: string | null, userinfoEndpoint?: string | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null } | null, repository?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null } | null, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null } | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null, license?: { __typename?: 'License', name?: string | null, url?: string | null } | null, community?: { __typename?: 'Community', discord?: string | null, slack?: string | null, homepage?: string | null, gitUrl?: string | null, twitter?: string | null } | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null };

export type CreateResourceDefinitionMutationVariables = Exact<{
  name: Scalars['String']['input'];
  input: ResourceDefinitionAttributes;
}>;


export type CreateResourceDefinitionMutation = { __typename?: 'RootMutationType', updateRepository?: { __typename?: 'Repository', id: string } | null };

export type CreateIntegrationMutationVariables = Exact<{
  name: Scalars['String']['input'];
  attrs: IntegrationAttributes;
}>;


export type CreateIntegrationMutation = { __typename?: 'RootMutationType', createIntegration?: { __typename?: 'Integration', id: string } | null };

export type UpdateRepositoryMutationVariables = Exact<{
  name: Scalars['String']['input'];
  attrs: RepositoryAttributes;
}>;


export type UpdateRepositoryMutation = { __typename?: 'RootMutationType', updateRepository?: { __typename?: 'Repository', id: string } | null };

export type CreateRepositoryMutationVariables = Exact<{
  name: Scalars['String']['input'];
  publisher: Scalars['String']['input'];
  attributes: RepositoryAttributes;
}>;


export type CreateRepositoryMutation = { __typename?: 'RootMutationType', upsertRepository?: { __typename?: 'Repository', id: string } | null };

export type AcquireLockMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AcquireLockMutation = { __typename?: 'RootMutationType', acquireLock?: { __typename?: 'ApplyLock', id: string, lock?: string | null } | null };

export type ReleaseLockMutationVariables = Exact<{
  name: Scalars['String']['input'];
  attrs: LockAttributes;
}>;


export type ReleaseLockMutation = { __typename?: 'RootMutationType', releaseLock?: { __typename?: 'ApplyLock', id: string, lock?: string | null } | null };

export type UnlockRepositoryMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type UnlockRepositoryMutation = { __typename?: 'RootMutationType', unlockRepository?: number | null };

export type RepositoriesQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
  installed?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type RepositoriesQuery = { __typename?: 'RootQueryType', repositories?: { __typename?: 'RepositoryConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'RepositoryEdge', node?: { __typename?: 'Repository', id: string, name: string, icon?: string | null, darkIcon?: string | null, installation?: { __typename?: 'Installation', pingedAt?: Date | null, synced?: boolean | null, locked?: boolean | null } | null } | null } | null> | null } | null };

export type MarketplaceRepositoriesQueryVariables = Exact<{
  publisherId?: InputMaybe<Scalars['ID']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type MarketplaceRepositoriesQuery = { __typename?: 'RootQueryType', repositories?: { __typename?: 'RepositoryConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'RepositoryEdge', node?: { __typename?: 'Repository', id: string, name: string, description?: string | null, releaseStatus?: ReleaseStatus | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, installation?: { __typename?: 'Installation', id: string } | null, tags?: Array<{ __typename?: 'Tag', tag: string } | null> | null } | null } | null> | null } | null };

export type ScaffoldsQueryVariables = Exact<{
  app: Scalars['String']['input'];
  pub: Scalars['String']['input'];
  cat: Category;
  ing?: InputMaybe<Scalars['Boolean']['input']>;
  pg?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type ScaffoldsQuery = { __typename?: 'RootQueryType', scaffold?: Array<{ __typename?: 'ScaffoldFile', path?: string | null, content?: string | null } | null> | null };

export type DeleteRepositoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteRepositoryMutation = { __typename?: 'RootMutationType', deleteRepository?: { __typename?: 'Repository', id: string } | null };

export type ReleaseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type ReleaseMutation = { __typename?: 'RootMutationType', release?: boolean | null };

export type RoleFragment = { __typename?: 'Role', id: string, name: string, description?: string | null, repositories?: Array<string | null> | null, permissions?: Array<Permission | null> | null, roleBindings?: Array<{ __typename?: 'RoleBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null };

export type RoleBindingFragment = { __typename?: 'RoleBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null };

export type CreateRoleMutationVariables = Exact<{
  attributes: RoleAttributes;
}>;


export type CreateRoleMutation = { __typename?: 'RootMutationType', createRole?: { __typename?: 'Role', id: string, name: string, description?: string | null, repositories?: Array<string | null> | null, permissions?: Array<Permission | null> | null, roleBindings?: Array<{ __typename?: 'RoleBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null } | null };

export type UpdateRoleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  attributes: RoleAttributes;
}>;


export type UpdateRoleMutation = { __typename?: 'RootMutationType', updateRole?: { __typename?: 'Role', id: string, name: string, description?: string | null, repositories?: Array<string | null> | null, permissions?: Array<Permission | null> | null, roleBindings?: Array<{ __typename?: 'RoleBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null } | null };

export type DeleteRoleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteRoleMutation = { __typename?: 'RootMutationType', deleteRole?: { __typename?: 'Role', id: string, name: string, description?: string | null, repositories?: Array<string | null> | null, permissions?: Array<Permission | null> | null, roleBindings?: Array<{ __typename?: 'RoleBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null } | null };

export type GetTfProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTfProvidersQuery = { __typename?: 'RootQueryType', terraformProviders?: Array<Provider | null> | null };

export type GetTfProviderScaffoldQueryVariables = Exact<{
  name: Provider;
  vsn?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTfProviderScaffoldQuery = { __typename?: 'RootQueryType', terraformProvider?: { __typename?: 'TerraformProvider', name?: Provider | null, content?: string | null } | null };

export type CloudShellFragment = { __typename?: 'CloudShell', id: string, aesKey: string, gitUrl: string, alive: boolean, provider: Provider, subdomain: string, cluster: string, status?: { __typename?: 'ShellStatus', ready?: boolean | null, initialized?: boolean | null, containersReady?: boolean | null, podScheduled?: boolean | null } | null };

export type DemoProjectFragment = { __typename?: 'DemoProject', id: string, projectId: string, credentials?: string | null, ready?: boolean | null, state?: DemoProjectState | null };

export type GetShellQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShellQuery = { __typename?: 'RootQueryType', shell?: { __typename?: 'CloudShell', id: string, aesKey: string, gitUrl: string, alive: boolean, provider: Provider, subdomain: string, cluster: string, status?: { __typename?: 'ShellStatus', ready?: boolean | null, initialized?: boolean | null, containersReady?: boolean | null, podScheduled?: boolean | null } | null } | null };

export type DeleteShellMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteShellMutation = { __typename?: 'RootMutationType', deleteShell?: { __typename?: 'CloudShell', id: string, aesKey: string, gitUrl: string, alive: boolean, provider: Provider, subdomain: string, cluster: string, status?: { __typename?: 'ShellStatus', ready?: boolean | null, initialized?: boolean | null, containersReady?: boolean | null, podScheduled?: boolean | null } | null } | null };

export type TerraformFragment = { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null };

export type TerraformInstallationFragment = { __typename?: 'TerraformInstallation', id?: string | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, version?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null };

export type GetTerraformQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTerraformQuery = { __typename?: 'RootQueryType', terraform?: { __typename?: 'TerraformConnection', edges?: Array<{ __typename?: 'TerraformEdge', node?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null } | null> | null } | null };

export type GetTerraformInstallationsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTerraformInstallationsQuery = { __typename?: 'RootQueryType', terraformInstallations?: { __typename?: 'TerraformInstallationConnection', edges?: Array<{ __typename?: 'TerraformInstallationEdge', node?: { __typename?: 'TerraformInstallation', id?: string | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, version?: { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null } | null } | null> | null } | null };

export type UploadTerraformMutationVariables = Exact<{
  repoName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  uploadOrUrl: Scalars['UploadOrUrl']['input'];
}>;


export type UploadTerraformMutation = { __typename?: 'RootMutationType', uploadTerraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null, readme?: string | null, package?: string | null, description?: string | null, latestVersion?: string | null, valuesTemplate?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null };

export type UninstallTerraformMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UninstallTerraformMutation = { __typename?: 'RootMutationType', uninstallTerraform?: { __typename?: 'TerraformInstallation', id?: string | null } | null };

export type StepFragment = { __typename?: 'TestStep', id: string, name: string, status: TestStatus, hasLogs?: boolean | null, description: string, insertedAt?: Date | null, updatedAt?: Date | null };

export type TestFragment = { __typename?: 'Test', id: string, name?: string | null, promoteTag: string, status: TestStatus, insertedAt?: Date | null, updatedAt?: Date | null, steps?: Array<{ __typename?: 'TestStep', id: string, name: string, status: TestStatus, hasLogs?: boolean | null, description: string, insertedAt?: Date | null, updatedAt?: Date | null } | null> | null };

export type CreateTestMutationVariables = Exact<{
  name: Scalars['String']['input'];
  attrs: TestAttributes;
}>;


export type CreateTestMutation = { __typename?: 'RootMutationType', createTest?: { __typename?: 'Test', id: string, name?: string | null, promoteTag: string, status: TestStatus, insertedAt?: Date | null, updatedAt?: Date | null, steps?: Array<{ __typename?: 'TestStep', id: string, name: string, status: TestStatus, hasLogs?: boolean | null, description: string, insertedAt?: Date | null, updatedAt?: Date | null } | null> | null } | null };

export type UpdateTestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  attrs: TestAttributes;
}>;


export type UpdateTestMutation = { __typename?: 'RootMutationType', updateTest?: { __typename?: 'Test', id: string, name?: string | null, promoteTag: string, status: TestStatus, insertedAt?: Date | null, updatedAt?: Date | null, steps?: Array<{ __typename?: 'TestStep', id: string, name: string, status: TestStatus, hasLogs?: boolean | null, description: string, insertedAt?: Date | null, updatedAt?: Date | null } | null> | null } | null };

export type UpdateStepMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  logs: Scalars['UploadOrUrl']['input'];
}>;


export type UpdateStepMutation = { __typename?: 'RootMutationType', updateStep?: { __typename?: 'TestStep', id: string } | null };

export type PublishLogsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  logs: Scalars['String']['input'];
}>;


export type PublishLogsMutation = { __typename?: 'RootMutationType', publishLogs?: { __typename?: 'TestStep', id: string } | null };

export type UpgradeQueueFragment = { __typename?: 'UpgradeQueue', id: string, acked?: string | null, name?: string | null, domain?: string | null, git?: string | null, pingedAt?: Date | null, provider?: Provider | null };

export type RolloutFragment = { __typename?: 'Rollout', id: string, event?: string | null, cursor?: string | null, count?: number | null, status: RolloutStatus, heartbeat?: Date | null };

export type UpgradeFragment = { __typename?: 'Upgrade', id: string, message?: string | null, insertedAt?: Date | null, repository?: { __typename?: 'Repository', id: string, name: string, notes?: string | null, description?: string | null, documentation?: string | null, icon?: string | null, darkIcon?: string | null, private?: boolean | null, trending?: boolean | null, verified?: boolean | null, category?: Category | null, docs?: Array<{ __typename?: 'FileContent', content: string, path: string } | null> | null, oauthSettings?: { __typename?: 'OauthSettings', uriFormat: string, authMethod: OidcAuthMethod } | null, publisher?: { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, recipes?: Array<{ __typename?: 'Recipe', name: string, provider?: Provider | null, description?: string | null } | null> | null } | null };

export type DeferredUpdateFragment = { __typename?: 'DeferredUpdate', id: string, dequeueAt?: Date | null, attempts?: number | null, insertedAt?: Date | null, version?: { __typename?: 'Version', version: string } | null };

export type AccountFragment = { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null };

export type GroupFragment = { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null };

export type UserFragment = { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null };

export type ImpersonationPolicyFragment = { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null };

export type ImpersonationPolicyBindingFragment = { __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null };

export type GroupMemberFragment = { __typename?: 'GroupMember', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null };

export type DomainMappingFragment = { __typename?: 'DomainMapping', id: string, domain: string, enableSso?: boolean | null };

export type TokenFragment = { __typename?: 'PersistedToken', id?: string | null, token?: string | null, insertedAt?: Date | null };

export type TokenAuditFragment = { __typename?: 'PersistedTokenAudit', ip?: string | null, timestamp?: Date | null, count?: number | null, country?: string | null, city?: string | null, latitude?: string | null, longitude?: string | null };

export type AddressFragment = { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null };

export type PublisherFragment = { __typename?: 'Publisher', id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null };

export type WebhookFragment = { __typename?: 'Webhook', id?: string | null, url?: string | null, secret?: string | null, insertedAt?: Date | null };

export type PublicKeyFragment = { __typename?: 'PublicKey', id: string, name: string, digest: string, insertedAt?: Date | null, content: string, user: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } };

export type EabCredentialFragment = { __typename?: 'EabCredential', id: string, keyId: string, hmacKey: string, cluster: string, provider: Provider, insertedAt?: Date | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'RootQueryType', me?: { __typename?: 'User', demoing?: boolean | null, loginMethod?: LoginMethod | null, hasInstallations?: boolean | null, hasShell?: boolean | null, id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, account: { __typename?: 'Account', id: string, name?: string | null, billingCustomerId?: string | null, backgroundColor?: string | null, userCount?: string | null, trialed?: boolean | null, rootUser?: { __typename?: 'User', id: string, name: string, email: string } | null, domainMappings?: Array<{ __typename?: 'DomainMapping', id: string, domain: string, enableSso?: boolean | null } | null> | null }, publisher?: { __typename?: 'Publisher', billingAccountId?: string | null, id?: string | null, name: string, phone?: string | null, avatar?: string | null, description?: string | null, backgroundColor?: string | null, owner?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, address?: { __typename?: 'Address', line1?: string | null, line2?: string | null, city?: string | null, country?: string | null, state?: string | null, zip?: string | null } | null } | null, boundRoles?: Array<{ __typename?: 'Role', id: string, name: string, description?: string | null, repositories?: Array<string | null> | null, permissions?: Array<Permission | null> | null, roleBindings?: Array<{ __typename?: 'RoleBinding', id: string, user?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, group?: { __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null } | null> | null } | null> | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null, configuration?: { __typename?: 'PluralConfiguration', stripeConnectId?: string | null, stripePublishableKey?: string | null, registry?: string | null, gitCommit?: string | null } | null };

export type GetLoginMethodQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type GetLoginMethodQuery = { __typename?: 'RootQueryType', loginMethod?: { __typename?: 'LoginMethodResponse', loginMethod: LoginMethod, token?: string | null } | null };

export type ListTokensQueryVariables = Exact<{ [key: string]: never; }>;


export type ListTokensQuery = { __typename?: 'RootQueryType', tokens?: { __typename?: 'PersistedTokenConnection', edges?: Array<{ __typename?: 'PersistedTokenEdge', node?: { __typename?: 'PersistedToken', token?: string | null } | null } | null> | null } | null };

export type ListKeysQueryVariables = Exact<{
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type ListKeysQuery = { __typename?: 'RootQueryType', publicKeys?: { __typename?: 'PublicKeyConnection', edges?: Array<{ __typename?: 'PublicKeyEdge', node?: { __typename?: 'PublicKey', id: string, name: string, digest: string, insertedAt?: Date | null, content: string, user: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } } | null } | null> | null } | null };

export type GetEabCredentialQueryVariables = Exact<{
  cluster: Scalars['String']['input'];
  provider: Provider;
}>;


export type GetEabCredentialQuery = { __typename?: 'RootQueryType', eabCredential?: { __typename?: 'EabCredential', id: string, keyId: string, hmacKey: string, cluster: string, provider: Provider, insertedAt?: Date | null } | null };

export type DevLoginMutationVariables = Exact<{ [key: string]: never; }>;


export type DevLoginMutation = { __typename?: 'RootMutationType', deviceLogin?: { __typename?: 'DeviceLogin', loginUrl: string, deviceToken: string } | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  captcha: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'RootMutationType', login?: { __typename?: 'User', jwt?: string | null } | null };

export type CreateServiceAccountMutationVariables = Exact<{
  attributes: ServiceAccountAttributes;
}>;


export type CreateServiceAccountMutation = { __typename?: 'RootMutationType', createServiceAccount?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null };

export type ImpersonateServiceAccountMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
}>;


export type ImpersonateServiceAccountMutation = { __typename?: 'RootMutationType', impersonateServiceAccount?: { __typename?: 'User', jwt?: string | null, email: string } | null };

export type CreateAccessTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateAccessTokenMutation = { __typename?: 'RootMutationType', createToken?: { __typename?: 'PersistedToken', token?: string | null } | null };

export type CreateKeyMutationVariables = Exact<{
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type CreateKeyMutation = { __typename?: 'RootMutationType', createPublicKey?: { __typename?: 'PublicKey', id: string } | null };

export type DeleteEabCredentialMutationVariables = Exact<{
  cluster: Scalars['String']['input'];
  provider: Provider;
}>;


export type DeleteEabCredentialMutation = { __typename?: 'RootMutationType', deleteEabKey?: { __typename?: 'EabCredential', id: string } | null };

export type CreateEventMutationVariables = Exact<{
  attrs: UserEventAttributes;
}>;


export type CreateEventMutation = { __typename?: 'RootMutationType', createUserEvent?: boolean | null };

export type LoginMethodQueryVariables = Exact<{
  email: Scalars['String']['input'];
  host?: InputMaybe<Scalars['String']['input']>;
}>;


export type LoginMethodQuery = { __typename?: 'RootQueryType', loginMethod?: { __typename?: 'LoginMethodResponse', loginMethod: LoginMethod, token?: string | null, authorizeUrl?: string | null } | null };

export type SignupMutationVariables = Exact<{
  attributes: UserAttributes;
  account?: InputMaybe<AccountAttributes>;
  deviceToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type SignupMutation = { __typename?: 'RootMutationType', signup?: { __typename?: 'User', jwt?: string | null, onboarding?: OnboardingState | null } | null };

export type PasswordlessLoginMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type PasswordlessLoginMutation = { __typename?: 'RootMutationType', passwordlessLogin?: { __typename?: 'User', jwt?: string | null } | null };

export type PollLoginTokenMutationVariables = Exact<{
  token: Scalars['String']['input'];
  deviceToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type PollLoginTokenMutation = { __typename?: 'RootMutationType', loginToken?: { __typename?: 'User', jwt?: string | null } | null };

export type OauthUrlsQueryVariables = Exact<{
  host?: InputMaybe<Scalars['String']['input']>;
}>;


export type OauthUrlsQuery = { __typename?: 'RootQueryType', oauthUrls?: Array<{ __typename?: 'OauthInfo', provider: OauthProvider, authorizeUrl: string } | null> | null };

export type AcceptLoginMutationVariables = Exact<{
  challenge: Scalars['String']['input'];
}>;


export type AcceptLoginMutation = { __typename?: 'RootMutationType', acceptLogin?: { __typename?: 'OauthResponse', redirectTo: string } | null };

export type CreateResetTokenMutationVariables = Exact<{
  attributes: ResetTokenAttributes;
}>;


export type CreateResetTokenMutation = { __typename?: 'RootMutationType', createResetToken?: boolean | null };

export type RealizeResetTokenMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  attributes: ResetTokenRealization;
}>;


export type RealizeResetTokenMutation = { __typename?: 'RootMutationType', realizeResetToken?: boolean | null };

export type ResetTokenQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ResetTokenQuery = { __typename?: 'RootQueryType', resetToken?: { __typename?: 'ResetToken', type: ResetTokenType, user: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } } | null };

export type UsersQueryVariables = Exact<{
  q?: InputMaybe<Scalars['String']['input']>;
  serviceAccount?: InputMaybe<Scalars['Boolean']['input']>;
  all?: InputMaybe<Scalars['Boolean']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UsersQuery = { __typename?: 'RootQueryType', users?: { __typename?: 'UserConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, edges?: Array<{ __typename?: 'UserEdge', node?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null } | null } | null> | null } | null };

export type ReadNotificationsMutationVariables = Exact<{
  incidentId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type ReadNotificationsMutation = { __typename?: 'RootMutationType', readNotifications?: number | null };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'RootMutationType', deleteUser?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null };

export type UpdateUserMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  attributes: UserAttributes;
}>;


export type UpdateUserMutation = { __typename?: 'RootMutationType', updateUser?: { __typename?: 'User', id: string, name: string, email: string, avatar?: string | null, provider?: Provider | null, demoed?: boolean | null, onboarding?: OnboardingState | null, emailConfirmed?: boolean | null, emailConfirmBy?: Date | null, backgroundColor?: string | null, serviceAccount?: boolean | null, hasInstallations?: boolean | null, hasShell?: boolean | null, onboardingChecklist?: { __typename?: 'OnboardingChecklist', dismissed?: boolean | null, status?: OnboardingChecklistState | null } | null, invites?: Array<{ __typename?: 'Invite', id: string, email?: string | null } | null> | null, roles?: { __typename?: 'Roles', admin?: boolean | null } | null, groups?: Array<{ __typename?: 'Group', id: string, name: string, global?: boolean | null, description?: string | null } | null> | null, impersonationPolicy?: { __typename?: 'ImpersonationPolicy', id: string, bindings?: Array<{ __typename?: 'ImpersonationPolicyBinding', id: string, group?: { __typename?: 'Group', id: string, name: string } | null, user?: { __typename?: 'User', id: string, name: string, email: string } | null } | null> | null } | null } | null };

export type VersionTagFragment = { __typename?: 'VersionTag', id: string, tag: string, version?: { __typename?: 'Version', id: string } | null };

export type VersionFragment = { __typename?: 'Version', id: string, helm?: Map<string, unknown> | null, readme?: string | null, valuesTemplate?: string | null, version: string, insertedAt?: Date | null, package?: string | null, crds?: Array<{ __typename?: 'Crd', id: string, name: string, blob?: string | null } | null> | null, chart?: { __typename?: 'Chart', id?: string | null, name: string, description?: string | null, latestVersion?: string | null, insertedAt?: Date | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null } | null, terraform?: { __typename?: 'Terraform', id?: string | null, name?: string | null } | null, dependencies?: { __typename?: 'Dependencies', wait?: boolean | null, application?: boolean | null, providers?: Array<Provider | null> | null, secrets?: Array<string | null> | null, providerWirings?: Map<string, unknown> | null, outputs?: Map<string, unknown> | null, dependencies?: Array<{ __typename?: 'Dependency', name?: string | null, repo?: string | null, type?: DependencyType | null, version?: string | null, optional?: boolean | null } | null> | null, wirings?: { __typename?: 'Wirings', terraform?: Map<string, unknown> | null, helm?: Map<string, unknown> | null } | null } | null };

export type UpdateVersionMutationVariables = Exact<{
  spec?: InputMaybe<VersionSpec>;
  attributes: VersionAttributes;
}>;


export type UpdateVersionMutation = { __typename?: 'RootMutationType', updateVersion?: { __typename?: 'Version', id: string } | null };

export const GroupFragmentDoc = gql`
    fragment Group on Group {
  id
  name
  global
  description
}
    `;
export const ImpersonationPolicyBindingFragmentDoc = gql`
    fragment ImpersonationPolicyBinding on ImpersonationPolicyBinding {
  id
  group {
    id
    name
  }
  user {
    id
    name
    email
  }
}
    `;
export const ImpersonationPolicyFragmentDoc = gql`
    fragment ImpersonationPolicy on ImpersonationPolicy {
  id
  bindings {
    ...ImpersonationPolicyBinding
  }
}
    ${ImpersonationPolicyBindingFragmentDoc}`;
export const UserFragmentDoc = gql`
    fragment User on User {
  id
  name
  email
  avatar
  provider
  demoed
  onboarding
  onboardingChecklist {
    dismissed
    status
  }
  emailConfirmed
  emailConfirmBy
  backgroundColor
  serviceAccount
  hasInstallations
  hasShell
  invites {
    id
    email
  }
  roles {
    admin
  }
  groups {
    ...Group
  }
  impersonationPolicy {
    ...ImpersonationPolicy
  }
}
    ${GroupFragmentDoc}
${ImpersonationPolicyFragmentDoc}`;
export const PolicyBindingFragmentDoc = gql`
    fragment PolicyBinding on PolicyBinding {
  id
  group {
    id
    name
  }
  user {
    id
    name
    email
  }
}
    `;
export const DnsDomainFragmentDoc = gql`
    fragment DnsDomain on DnsDomain {
  id
  name
  creator {
    ...User
  }
  accessPolicy {
    id
    bindings {
      ...PolicyBinding
    }
  }
  insertedAt
}
    ${UserFragmentDoc}
${PolicyBindingFragmentDoc}`;
export const FileContentFragmentDoc = gql`
    fragment FileContent on FileContent {
  content
  path
}
    `;
export const AddressFragmentDoc = gql`
    fragment Address on Address {
  line1
  line2
  city
  country
  state
  zip
}
    `;
export const PublisherFragmentDoc = gql`
    fragment Publisher on Publisher {
  id
  name
  phone
  avatar
  description
  backgroundColor
  owner {
    ...User
  }
  address {
    ...Address
  }
}
    ${UserFragmentDoc}
${AddressFragmentDoc}`;
export const RepoFragmentDoc = gql`
    fragment Repo on Repository {
  id
  name
  notes
  description
  documentation
  icon
  darkIcon
  private
  trending
  verified
  category
  docs {
    ...FileContent
  }
  oauthSettings {
    uriFormat
    authMethod
  }
  publisher {
    ...Publisher
  }
  recipes {
    name
    provider
    description
  }
}
    ${FileContentFragmentDoc}
${PublisherFragmentDoc}`;
export const OidcLoginFragmentDoc = gql`
    fragment OidcLogin on OidcLogin {
  ip
  country
  city
  latitude
  longitude
  user {
    ...User
  }
  owner {
    ...User
  }
  repository {
    ...Repo
  }
  insertedAt
}
    ${UserFragmentDoc}
${RepoFragmentDoc}`;
export const ArtifactFragmentDoc = gql`
    fragment Artifact on Artifact {
  id
  name
  blob
  type
  platform
  arch
  filesize
  sha
  readme
  insertedAt
  updatedAt
}
    `;
export const IntegrationWebhookFragmentDoc = gql`
    fragment IntegrationWebhook on IntegrationWebhook {
  id
  name
  url
  secret
  actions
}
    `;
export const RoleBindingFragmentDoc = gql`
    fragment RoleBinding on RoleBinding {
  id
  user {
    ...User
  }
  group {
    ...Group
  }
}
    ${UserFragmentDoc}
${GroupFragmentDoc}`;
export const RoleFragmentDoc = gql`
    fragment Role on Role {
  id
  name
  description
  repositories
  permissions
  roleBindings {
    ...RoleBinding
  }
}
    ${RoleBindingFragmentDoc}`;
export const CrdFragmentDoc = gql`
    fragment Crd on Crd {
  id
  name
  blob
}
    `;
export const DependenciesFragmentDoc = gql`
    fragment Dependencies on Dependencies {
  dependencies {
    name
    repo
    type
    version
    optional
  }
  wait
  application
  providers
  secrets
  wirings {
    terraform
    helm
  }
  providerWirings
  outputs
}
    `;
export const ChartFragmentDoc = gql`
    fragment Chart on Chart {
  id
  name
  description
  latestVersion
  dependencies {
    ...Dependencies
  }
  insertedAt
}
    ${DependenciesFragmentDoc}`;
export const VersionFragmentDoc = gql`
    fragment Version on Version {
  id
  helm
  readme
  valuesTemplate
  version
  insertedAt
  package
  crds {
    ...Crd
  }
  chart {
    ...Chart
  }
  terraform {
    id
    name
  }
  dependencies {
    ...Dependencies
  }
}
    ${CrdFragmentDoc}
${ChartFragmentDoc}
${DependenciesFragmentDoc}`;
export const AuditFragmentDoc = gql`
    fragment Audit on Audit {
  id
  action
  ip
  country
  city
  latitude
  longitude
  actor {
    ...User
  }
  repository {
    ...Repo
  }
  group {
    ...Group
  }
  integrationWebhook {
    ...IntegrationWebhook
  }
  role {
    ...Role
  }
  version {
    ...Version
  }
  image {
    id
    tag
    dockerRepository {
      name
    }
  }
  insertedAt
}
    ${UserFragmentDoc}
${RepoFragmentDoc}
${GroupFragmentDoc}
${IntegrationWebhookFragmentDoc}
${RoleFragmentDoc}
${VersionFragmentDoc}`;
export const ChartInstallationFragmentDoc = gql`
    fragment ChartInstallation on ChartInstallation {
  id
  chart {
    ...Chart
    dependencies {
      ...Dependencies
    }
  }
  version {
    ...Version
  }
}
    ${ChartFragmentDoc}
${DependenciesFragmentDoc}
${VersionFragmentDoc}`;
export const ScanViolationFragmentDoc = gql`
    fragment ScanViolation on ScanViolation {
  ruleName
  description
  ruleId
  severity
  category
  resourceName
  resourceType
  file
  line
}
    `;
export const ScanErrorFragmentDoc = gql`
    fragment ScanError on ScanError {
  message
}
    `;
export const PackageScanFragmentDoc = gql`
    fragment PackageScan on PackageScan {
  id
  grade
  violations {
    ...ScanViolation
  }
  errors {
    ...ScanError
  }
}
    ${ScanViolationFragmentDoc}
${ScanErrorFragmentDoc}`;
export const InstallationRepoFragmentDoc = gql`
    fragment InstallationRepo on Repository {
  id
  name
  icon
  darkIcon
  private
  trending
  verified
  category
}
    `;
export const OidcProviderBindingFragmentDoc = gql`
    fragment OidcProviderBinding on OidcProviderBinding {
  id
  user {
    ...User
  }
  group {
    ...Group
  }
}
    ${UserFragmentDoc}
${GroupFragmentDoc}`;
export const OidcProviderFragmentDoc = gql`
    fragment OIDCProvider on OidcProvider {
  id
  name
  description
  clientId
  authMethod
  clientSecret
  redirectUris
  bindings {
    ...OidcProviderBinding
  }
  configuration {
    issuer
    authorizationEndpoint
    tokenEndpoint
    jwksUri
    userinfoEndpoint
  }
  invites {
    id
    email
  }
}
    ${OidcProviderBindingFragmentDoc}`;
export const InstallationFragmentDoc = gql`
    fragment Installation on Installation {
  id
  context
  license
  licenseKey
  acmeKeyId
  acmeSecret
  autoUpgrade
  trackTag
  pingedAt
  synced
  locked
  repository {
    ...InstallationRepo
  }
  user {
    ...User
  }
  oidcProvider {
    ...OIDCProvider
  }
}
    ${InstallationRepoFragmentDoc}
${UserFragmentDoc}
${OidcProviderFragmentDoc}`;
export const UpgradeInfoFragmentDoc = gql`
    fragment UpgradeInfo on UpgradeInfo {
  installation {
    ...Installation
  }
  count
}
    ${InstallationFragmentDoc}`;
export const ClusterFragmentDoc = gql`
    fragment Cluster on Cluster {
  id
  name
  provider
  source
  pingedAt
  gitUrl
  consoleUrl
  owner {
    ...User
    impersonationPolicy {
      ...ImpersonationPolicy
    }
  }
  queue {
    id
    acked
    upgrades(first: 3) {
      edges {
        node {
          id
        }
      }
    }
  }
  upgradeInfo {
    ...UpgradeInfo
  }
  dependency {
    dependency {
      id
      name
      provider
    }
  }
}
    ${UserFragmentDoc}
${ImpersonationPolicyFragmentDoc}
${UpgradeInfoFragmentDoc}`;
export const DnsRecordFragmentDoc = gql`
    fragment DnsRecord on DnsRecord {
  id
  name
  type
  records
  cluster
  provider
  creator {
    ...User
  }
  insertedAt
}
    ${UserFragmentDoc}`;
export const DockerRepoFragmentDoc = gql`
    fragment DockerRepo on DockerRepository {
  id
  name
  public
  repository {
    id
    name
  }
  insertedAt
  updatedAt
}
    `;
export const DockerRepositoryFragmentDoc = gql`
    fragment DockerRepository on DockerRepository {
  id
  name
  public
  repository {
    id
    name
    editable
  }
  insertedAt
  updatedAt
}
    `;
export const DockerImageFragmentDoc = gql`
    fragment DockerImage on DockerImage {
  id
  tag
  digest
  scannedAt
  grade
  insertedAt
  updatedAt
}
    `;
export const VulnerabilityFragmentDoc = gql`
    fragment Vulnerability on Vulnerability {
  id
  title
  description
  vulnerabilityId
  package
  installedVersion
  fixedVersion
  source
  url
  severity
  score
  cvss {
    attackVector
    attackComplexity
    privilegesRequired
    userInteraction
    confidentiality
    integrity
    availability
  }
  layer {
    digest
    diffId
  }
}
    `;
export const PostmortemFragmentDoc = gql`
    fragment Postmortem on Postmortem {
  id
  content
  actionItems {
    type
    link
  }
}
    `;
export const FollowerFragmentDoc = gql`
    fragment Follower on Follower {
  id
  incident {
    id
  }
  user {
    ...User
  }
  preferences {
    message
    incidentUpdate
    mention
  }
}
    ${UserFragmentDoc}`;
export const ServiceLevelFragmentDoc = gql`
    fragment ServiceLevel on ServiceLevel {
  minSeverity
  maxSeverity
  responseTime
}
    `;
export const LimitFragmentDoc = gql`
    fragment Limit on Limit {
  dimension
  quantity
}
    `;
export const LineItemFragmentDoc = gql`
    fragment LineItem on LineItem {
  name
  dimension
  cost
  period
  type
}
    `;
export const PlanFragmentDoc = gql`
    fragment Plan on Plan {
  id
  name
  cost
  period
  serviceLevels {
    ...ServiceLevel
  }
  lineItems {
    included {
      ...Limit
    }
    items {
      ...LineItem
    }
  }
  metadata {
    features {
      name
      description
    }
  }
}
    ${ServiceLevelFragmentDoc}
${LimitFragmentDoc}
${LineItemFragmentDoc}`;
export const SlimSubscriptionFragmentDoc = gql`
    fragment SlimSubscription on SlimSubscription {
  id
  lineItems {
    items {
      dimension
      quantity
    }
  }
  plan {
    ...Plan
  }
}
    ${PlanFragmentDoc}`;
export const ClusterInformationFragmentDoc = gql`
    fragment ClusterInformation on ClusterInformation {
  version
  gitCommit
  platform
}
    `;
export const IncidentFragmentDoc = gql`
    fragment Incident on Incident {
  id
  title
  description
  severity
  status
  notificationCount
  nextResponseAt
  creator {
    ...User
  }
  owner {
    ...User
  }
  repository {
    ...Repo
  }
  subscription {
    ...SlimSubscription
  }
  clusterInformation {
    ...ClusterInformation
  }
  tags {
    tag
  }
  insertedAt
}
    ${UserFragmentDoc}
${RepoFragmentDoc}
${SlimSubscriptionFragmentDoc}
${ClusterInformationFragmentDoc}`;
export const IncidentHistoryFragmentDoc = gql`
    fragment IncidentHistory on IncidentHistory {
  id
  action
  changes {
    key
    prev
    next
  }
  actor {
    ...User
  }
  insertedAt
}
    ${UserFragmentDoc}`;
export const FileFragmentDoc = gql`
    fragment File on File {
  id
  blob
  mediaType
  contentType
  filesize
  filename
}
    `;
export const IncidentMessageFragmentDoc = gql`
    fragment IncidentMessage on IncidentMessage {
  id
  text
  creator {
    ...User
  }
  reactions {
    name
    creator {
      id
      email
    }
  }
  file {
    ...File
  }
  entities {
    type
    user {
      ...User
    }
    text
    startIndex
    endIndex
  }
  insertedAt
}
    ${UserFragmentDoc}
${FileFragmentDoc}`;
export const NotificationFragmentDoc = gql`
    fragment Notification on Notification {
  id
  type
  msg
  actor {
    ...User
  }
  incident {
    id
    title
    repository {
      id
      name
      icon
      darkIcon
    }
  }
  message {
    text
  }
  repository {
    id
    name
    icon
    darkIcon
  }
  insertedAt
}
    ${UserFragmentDoc}`;
export const WebhookLogFragmentDoc = gql`
    fragment WebhookLog on WebhookLog {
  id
  state
  status
  payload
  response
  insertedAt
}
    `;
export const OauthIntegrationFragmentDoc = gql`
    fragment OauthIntegration on OauthIntegration {
  id
  service
  insertedAt
}
    `;
export const ZoomMeetingFragmentDoc = gql`
    fragment ZoomMeeting on ZoomMeeting {
  joinUrl
  password
}
    `;
export const AccountFragmentDoc = gql`
    fragment Account on Account {
  id
  name
  billingCustomerId
  backgroundColor
  userCount
  trialed
}
    `;
export const InviteFragmentDoc = gql`
    fragment Invite on Invite {
  id
  secureId
  email
  existing
  insertedAt
  account {
    ...Account
  }
  user {
    ...User
    account {
      ...Account
    }
  }
}
    ${AccountFragmentDoc}
${UserFragmentDoc}`;
export const KeyBackupUserFragmentDoc = gql`
    fragment KeyBackupUser on User {
  email
}
    `;
export const KeyBackupFragmentDoc = gql`
    fragment KeyBackup on KeyBackup {
  digest
  id
  insertedAt
  name
  repositories
  updatedAt
  user {
    ...KeyBackupUser
  }
  value
}
    ${KeyBackupUserFragmentDoc}`;
export const CategoryInfoFragmentDoc = gql`
    fragment CategoryInfo on CategoryInfo {
  category
  count
}
    `;
export const GroupedTagFragmentDoc = gql`
    fragment GroupedTag on GroupedTag {
  tag
  count
}
    `;
export const MetricFragmentDoc = gql`
    fragment Metric on Metric {
  name
  tags {
    name
    value
  }
  values {
    time
    value
  }
}
    `;
export const PageInfoFragmentDoc = gql`
    fragment PageInfo on PageInfo {
  endCursor
  hasNextPage
}
    `;
export const NotificationFragmentFragmentDoc = gql`
    fragment NotificationFragment on Notification {
  id
  type
  msg
  actor {
    ...User
  }
  incident {
    id
    title
    repository {
      id
      name
      icon
      darkIcon
    }
  }
  message {
    text
  }
  repository {
    id
    name
    icon
    darkIcon
  }
  insertedAt
}
    ${UserFragmentDoc}`;
export const OAuthInfoFragmentDoc = gql`
    fragment OAuthInfo on OauthInfo {
  provider
  authorizeUrl
}
    `;
export const SubscriptionFragmentDoc = gql`
    fragment Subscription on RepositorySubscription {
  id
  plan {
    ...Plan
  }
  lineItems {
    items {
      ...Limit
    }
  }
}
    ${PlanFragmentDoc}
${LimitFragmentDoc}`;
export const NextActionFragmentDoc = gql`
    fragment NextAction on NextAction {
  type
  redirectToUrl {
    url
    returnUrl
  }
}
    `;
export const PaymentIntentFragmentDoc = gql`
    fragment PaymentIntent on PaymentIntent {
  id
  description
  clientSecret
  amount
  captureMethod
  currency
  nextAction {
    ...NextAction
  }
  status
}
    ${NextActionFragmentDoc}`;
export const InvoiceItemFragmentDoc = gql`
    fragment InvoiceItem on InvoiceItem {
  amount
  currency
  description
}
    `;
export const InvoiceFragmentDoc = gql`
    fragment Invoice on Invoice {
  number
  amountDue
  amountPaid
  currency
  status
  createdAt
  hostedInvoiceUrl
  lines {
    ...InvoiceItem
  }
}
    ${InvoiceItemFragmentDoc}`;
export const PlatformPlanFragmentDoc = gql`
    fragment PlatformPlan on PlatformPlan {
  id
  name
  cost
  period
  enterprise
  trial
  features {
    vpn
    userManagement
    audit
  }
  lineItems {
    name
    dimension
    cost
    period
  }
}
    `;
export const CardFragmentDoc = gql`
    fragment Card on Card {
  last4
  expMonth
  expYear
  name
  brand
}
    `;
export const PaymentMethodFragmentDoc = gql`
    fragment PaymentMethod on PaymentMethod {
  id
  type
  isDefault
  card {
    ...Card
  }
}
    ${CardFragmentDoc}`;
export const SubscriptionAccountFragmentDoc = gql`
    fragment SubscriptionAccount on Account {
  id
  billingCustomerId
  grandfatheredUntil
  delinquentAt
  userCount
  clusterCount
  trialed
  availableFeatures {
    userManagement
    audit
  }
  subscription {
    id
    trialUntil
    plan {
      ...PlatformPlan
    }
  }
  billingAddress {
    name
    line1
    line2
    zip
    state
    city
    country
  }
  paymentMethods(first: 20) {
    edges {
      node {
        ...PaymentMethod
      }
    }
  }
}
    ${PlatformPlanFragmentDoc}
${PaymentMethodFragmentDoc}`;
export const SetupIntentFragmentDoc = gql`
    fragment SetupIntent on SetupIntent {
  id
  status
  clientSecret
  nextAction {
    ...NextAction
  }
  paymentMethodTypes
}
    ${NextActionFragmentDoc}`;
export const ConsoleInstanceOidcFragmentDoc = gql`
    fragment ConsoleInstanceOidc on ConsoleInstanceOidc {
  clientId
  clientSecret
  issuer
}
    `;
export const ConsoleInstanceFragmentDoc = gql`
    fragment ConsoleInstance on ConsoleInstance {
  id
  name
  subdomain
  url
  cloud
  size
  region
  status
  type
  deletedAt
  console {
    id
    pingedAt
    consoleUrl
  }
  owner {
    ...User
    impersonationPolicy {
      ...ImpersonationPolicy
    }
  }
  oidc {
    ...ConsoleInstanceOidc
  }
  network {
    allowedCidrs
  }
  insertedAt
  updatedAt
}
    ${UserFragmentDoc}
${ImpersonationPolicyFragmentDoc}
${ConsoleInstanceOidcFragmentDoc}`;
export const TerraformFragmentDoc = gql`
    fragment Terraform on Terraform {
  id
  name
  readme
  package
  description
  latestVersion
  dependencies {
    ...Dependencies
  }
  valuesTemplate
  insertedAt
}
    ${DependenciesFragmentDoc}`;
export const RecipeConfigurationFragmentDoc = gql`
    fragment RecipeConfiguration on RecipeConfiguration {
  name
  type
  default
  documentation
  optional
  placeholder
  functionName
  condition {
    field
    operation
    value
  }
  validation {
    type
    regex
    message
  }
}
    `;
export const RecipeItemFragmentDoc = gql`
    fragment RecipeItem on RecipeItem {
  id
  chart {
    ...Chart
  }
  terraform {
    ...Terraform
  }
  configuration {
    ...RecipeConfiguration
  }
}
    ${ChartFragmentDoc}
${TerraformFragmentDoc}
${RecipeConfigurationFragmentDoc}`;
export const RecipeSectionFragmentDoc = gql`
    fragment RecipeSection on RecipeSection {
  index
  repository {
    ...Repo
    installation {
      ...Installation
    }
  }
  recipeItems {
    ...RecipeItem
  }
  configuration {
    ...RecipeConfiguration
  }
}
    ${RepoFragmentDoc}
${InstallationFragmentDoc}
${RecipeItemFragmentDoc}
${RecipeConfigurationFragmentDoc}`;
export const RecipeFragmentDoc = gql`
    fragment Recipe on Recipe {
  id
  name
  description
  restricted
  provider
  tests {
    type
    name
    message
    args {
      name
      repo
      key
    }
  }
  repository {
    id
    name
  }
  oidcSettings {
    uriFormat
    uriFormats
    authMethod
    domainKey
    subdomain
  }
  recipeSections {
    ...RecipeSection
  }
}
    ${RecipeSectionFragmentDoc}`;
export const StackCollectionFragmentDoc = gql`
    fragment StackCollection on StackCollection {
  id
  provider
  bundles {
    recipe {
      repository {
        ...Repo
        tags {
          tag
        }
      }
    }
  }
}
    ${RepoFragmentDoc}`;
export const StackFragmentDoc = gql`
    fragment Stack on Stack {
  id
  name
  displayName
  description
  featured
  creator {
    id
    name
  }
  collections {
    ...StackCollection
  }
}
    ${StackCollectionFragmentDoc}`;
export const ApplyLockFragmentDoc = gql`
    fragment ApplyLock on ApplyLock {
  id
  lock
}
    `;
export const CategoryFragmentDoc = gql`
    fragment Category on CategoryInfo {
  category
  count
}
    `;
export const RepositoryFragmentDoc = gql`
    fragment Repository on Repository {
  id
  name
  icon
  darkIcon
  installation {
    pingedAt
    synced
    locked
  }
}
    `;
export const MarketplaceRepositoryFragmentDoc = gql`
    fragment MarketplaceRepository on Repository {
  id
  name
  description
  releaseStatus
  documentation
  icon
  darkIcon
  private
  trending
  verified
  category
  oauthSettings {
    uriFormat
    authMethod
  }
  publisher {
    ...Publisher
  }
  installation {
    id
  }
  tags {
    tag
  }
}
    ${PublisherFragmentDoc}`;
export const IntegrationFragmentDoc = gql`
    fragment Integration on Integration {
  id
  name
  icon
  sourceUrl
  description
  tags {
    tag
  }
  publisher {
    ...Publisher
  }
}
    ${PublisherFragmentDoc}`;
export const CloudShellFragmentDoc = gql`
    fragment CloudShell on CloudShell {
  id
  aesKey
  gitUrl
  alive
  provider
  subdomain
  cluster
  status {
    ready
    initialized
    containersReady
    podScheduled
  }
}
    `;
export const DemoProjectFragmentDoc = gql`
    fragment DemoProject on DemoProject {
  id
  projectId
  credentials
  ready
  state
}
    `;
export const TerraformInstallationFragmentDoc = gql`
    fragment TerraformInstallation on TerraformInstallation {
  id
  terraform {
    ...Terraform
  }
  version {
    ...Version
  }
}
    ${TerraformFragmentDoc}
${VersionFragmentDoc}`;
export const StepFragmentDoc = gql`
    fragment Step on TestStep {
  id
  name
  status
  hasLogs
  description
  insertedAt
  updatedAt
}
    `;
export const TestFragmentDoc = gql`
    fragment Test on Test {
  id
  name
  promoteTag
  status
  insertedAt
  updatedAt
  steps {
    ...Step
  }
}
    ${StepFragmentDoc}`;
export const UpgradeQueueFragmentDoc = gql`
    fragment UpgradeQueue on UpgradeQueue {
  id
  acked
  name
  domain
  git
  pingedAt
  provider
}
    `;
export const RolloutFragmentDoc = gql`
    fragment Rollout on Rollout {
  id
  event
  cursor
  count
  status
  heartbeat
}
    `;
export const UpgradeFragmentDoc = gql`
    fragment Upgrade on Upgrade {
  id
  message
  repository {
    ...Repo
  }
  insertedAt
}
    ${RepoFragmentDoc}`;
export const DeferredUpdateFragmentDoc = gql`
    fragment DeferredUpdate on DeferredUpdate {
  id
  dequeueAt
  attempts
  version {
    version
  }
  insertedAt
}
    `;
export const GroupMemberFragmentDoc = gql`
    fragment GroupMember on GroupMember {
  id
  user {
    ...User
  }
}
    ${UserFragmentDoc}`;
export const DomainMappingFragmentDoc = gql`
    fragment DomainMapping on DomainMapping {
  id
  domain
  enableSso
}
    `;
export const TokenFragmentDoc = gql`
    fragment Token on PersistedToken {
  id
  token
  insertedAt
}
    `;
export const TokenAuditFragmentDoc = gql`
    fragment TokenAudit on PersistedTokenAudit {
  ip
  timestamp
  count
  country
  city
  latitude
  longitude
}
    `;
export const WebhookFragmentDoc = gql`
    fragment Webhook on Webhook {
  id
  url
  secret
  insertedAt
}
    `;
export const PublicKeyFragmentDoc = gql`
    fragment PublicKey on PublicKey {
  id
  name
  digest
  insertedAt
  content
  user {
    ...User
  }
}
    ${UserFragmentDoc}`;
export const EabCredentialFragmentDoc = gql`
    fragment EabCredential on EabCredential {
  id
  keyId
  hmacKey
  cluster
  provider
  insertedAt
}
    `;
export const VersionTagFragmentDoc = gql`
    fragment VersionTag on VersionTag {
  id
  tag
  version {
    id
  }
}
    `;
export const GenerateLicenseKeyDocument = gql`
    query GenerateLicenseKey {
  licenseKey
}
    `;

/**
 * __useGenerateLicenseKeyQuery__
 *
 * To run a query within a React component, call `useGenerateLicenseKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateLicenseKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateLicenseKeyQuery({
 *   variables: {
 *   },
 * });
 */
export function useGenerateLicenseKeyQuery(baseOptions?: Apollo.QueryHookOptions<GenerateLicenseKeyQuery, GenerateLicenseKeyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GenerateLicenseKeyQuery, GenerateLicenseKeyQueryVariables>(GenerateLicenseKeyDocument, options);
      }
export function useGenerateLicenseKeyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GenerateLicenseKeyQuery, GenerateLicenseKeyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GenerateLicenseKeyQuery, GenerateLicenseKeyQueryVariables>(GenerateLicenseKeyDocument, options);
        }
export function useGenerateLicenseKeySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GenerateLicenseKeyQuery, GenerateLicenseKeyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GenerateLicenseKeyQuery, GenerateLicenseKeyQueryVariables>(GenerateLicenseKeyDocument, options);
        }
export type GenerateLicenseKeyQueryHookResult = ReturnType<typeof useGenerateLicenseKeyQuery>;
export type GenerateLicenseKeyLazyQueryHookResult = ReturnType<typeof useGenerateLicenseKeyLazyQuery>;
export type GenerateLicenseKeySuspenseQueryHookResult = ReturnType<typeof useGenerateLicenseKeySuspenseQuery>;
export type GenerateLicenseKeyQueryResult = Apollo.QueryResult<GenerateLicenseKeyQuery, GenerateLicenseKeyQueryVariables>;
export const ConsumerEmailDomainsDocument = gql`
    query ConsumerEmailDomains {
  account {
    consumerEmailDomains
  }
}
    `;

/**
 * __useConsumerEmailDomainsQuery__
 *
 * To run a query within a React component, call `useConsumerEmailDomainsQuery` and pass it any options that fit your needs.
 * When your component renders, `useConsumerEmailDomainsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConsumerEmailDomainsQuery({
 *   variables: {
 *   },
 * });
 */
export function useConsumerEmailDomainsQuery(baseOptions?: Apollo.QueryHookOptions<ConsumerEmailDomainsQuery, ConsumerEmailDomainsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConsumerEmailDomainsQuery, ConsumerEmailDomainsQueryVariables>(ConsumerEmailDomainsDocument, options);
      }
export function useConsumerEmailDomainsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConsumerEmailDomainsQuery, ConsumerEmailDomainsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConsumerEmailDomainsQuery, ConsumerEmailDomainsQueryVariables>(ConsumerEmailDomainsDocument, options);
        }
export function useConsumerEmailDomainsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ConsumerEmailDomainsQuery, ConsumerEmailDomainsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ConsumerEmailDomainsQuery, ConsumerEmailDomainsQueryVariables>(ConsumerEmailDomainsDocument, options);
        }
export type ConsumerEmailDomainsQueryHookResult = ReturnType<typeof useConsumerEmailDomainsQuery>;
export type ConsumerEmailDomainsLazyQueryHookResult = ReturnType<typeof useConsumerEmailDomainsLazyQuery>;
export type ConsumerEmailDomainsSuspenseQueryHookResult = ReturnType<typeof useConsumerEmailDomainsSuspenseQuery>;
export type ConsumerEmailDomainsQueryResult = Apollo.QueryResult<ConsumerEmailDomainsQuery, ConsumerEmailDomainsQueryVariables>;
export const UpdateAccountDocument = gql`
    mutation UpdateAccount($attributes: AccountAttributes!) {
  updateAccount(attributes: $attributes) {
    ...Account
    domainMappings {
      ...DomainMapping
    }
  }
}
    ${AccountFragmentDoc}
${DomainMappingFragmentDoc}`;
export type UpdateAccountMutationFn = Apollo.MutationFunction<UpdateAccountMutation, UpdateAccountMutationVariables>;

/**
 * __useUpdateAccountMutation__
 *
 * To run a mutation, you first call `useUpdateAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAccountMutation, { data, loading, error }] = useUpdateAccountMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAccountMutation, UpdateAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAccountMutation, UpdateAccountMutationVariables>(UpdateAccountDocument, options);
      }
export type UpdateAccountMutationHookResult = ReturnType<typeof useUpdateAccountMutation>;
export type UpdateAccountMutationResult = Apollo.MutationResult<UpdateAccountMutation>;
export type UpdateAccountMutationOptions = Apollo.BaseMutationOptions<UpdateAccountMutation, UpdateAccountMutationVariables>;
export const BeginTrialDocument = gql`
    mutation BeginTrial {
  beginTrial {
    id
    trialUntil
    plan {
      ...PlatformPlan
    }
  }
}
    ${PlatformPlanFragmentDoc}`;
export type BeginTrialMutationFn = Apollo.MutationFunction<BeginTrialMutation, BeginTrialMutationVariables>;

/**
 * __useBeginTrialMutation__
 *
 * To run a mutation, you first call `useBeginTrialMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBeginTrialMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [beginTrialMutation, { data, loading, error }] = useBeginTrialMutation({
 *   variables: {
 *   },
 * });
 */
export function useBeginTrialMutation(baseOptions?: Apollo.MutationHookOptions<BeginTrialMutation, BeginTrialMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BeginTrialMutation, BeginTrialMutationVariables>(BeginTrialDocument, options);
      }
export type BeginTrialMutationHookResult = ReturnType<typeof useBeginTrialMutation>;
export type BeginTrialMutationResult = Apollo.MutationResult<BeginTrialMutation>;
export type BeginTrialMutationOptions = Apollo.BaseMutationOptions<BeginTrialMutation, BeginTrialMutationVariables>;
export const ListArtifactsDocument = gql`
    query ListArtifacts($id: ID!) {
  repository(id: $id) {
    artifacts {
      ...Artifact
    }
  }
}
    ${ArtifactFragmentDoc}`;

/**
 * __useListArtifactsQuery__
 *
 * To run a query within a React component, call `useListArtifactsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListArtifactsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListArtifactsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useListArtifactsQuery(baseOptions: Apollo.QueryHookOptions<ListArtifactsQuery, ListArtifactsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListArtifactsQuery, ListArtifactsQueryVariables>(ListArtifactsDocument, options);
      }
export function useListArtifactsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListArtifactsQuery, ListArtifactsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListArtifactsQuery, ListArtifactsQueryVariables>(ListArtifactsDocument, options);
        }
export function useListArtifactsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ListArtifactsQuery, ListArtifactsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListArtifactsQuery, ListArtifactsQueryVariables>(ListArtifactsDocument, options);
        }
export type ListArtifactsQueryHookResult = ReturnType<typeof useListArtifactsQuery>;
export type ListArtifactsLazyQueryHookResult = ReturnType<typeof useListArtifactsLazyQuery>;
export type ListArtifactsSuspenseQueryHookResult = ReturnType<typeof useListArtifactsSuspenseQuery>;
export type ListArtifactsQueryResult = Apollo.QueryResult<ListArtifactsQuery, ListArtifactsQueryVariables>;
export const CreateArtifactDocument = gql`
    mutation CreateArtifact($repoName: String!, $name: String!, $readme: String!, $artifactType: String!, $platform: String!, $blob: UploadOrUrl!, $arch: String) {
  createArtifact(
    repositoryName: $repoName
    attributes: {name: $name, blob: $blob, readme: $readme, type: $artifactType, platform: $platform, arch: $arch}
  ) {
    ...Artifact
  }
}
    ${ArtifactFragmentDoc}`;
export type CreateArtifactMutationFn = Apollo.MutationFunction<CreateArtifactMutation, CreateArtifactMutationVariables>;

/**
 * __useCreateArtifactMutation__
 *
 * To run a mutation, you first call `useCreateArtifactMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateArtifactMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createArtifactMutation, { data, loading, error }] = useCreateArtifactMutation({
 *   variables: {
 *      repoName: // value for 'repoName'
 *      name: // value for 'name'
 *      readme: // value for 'readme'
 *      artifactType: // value for 'artifactType'
 *      platform: // value for 'platform'
 *      blob: // value for 'blob'
 *      arch: // value for 'arch'
 *   },
 * });
 */
export function useCreateArtifactMutation(baseOptions?: Apollo.MutationHookOptions<CreateArtifactMutation, CreateArtifactMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateArtifactMutation, CreateArtifactMutationVariables>(CreateArtifactDocument, options);
      }
export type CreateArtifactMutationHookResult = ReturnType<typeof useCreateArtifactMutation>;
export type CreateArtifactMutationResult = Apollo.MutationResult<CreateArtifactMutation>;
export type CreateArtifactMutationOptions = Apollo.BaseMutationOptions<CreateArtifactMutation, CreateArtifactMutationVariables>;
export const AuditsDocument = gql`
    query Audits($cursor: String) {
  audits(first: 50, after: $cursor) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...Audit
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${AuditFragmentDoc}`;

/**
 * __useAuditsQuery__
 *
 * To run a query within a React component, call `useAuditsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuditsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuditsQuery({
 *   variables: {
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useAuditsQuery(baseOptions?: Apollo.QueryHookOptions<AuditsQuery, AuditsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AuditsQuery, AuditsQueryVariables>(AuditsDocument, options);
      }
export function useAuditsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AuditsQuery, AuditsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AuditsQuery, AuditsQueryVariables>(AuditsDocument, options);
        }
export function useAuditsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AuditsQuery, AuditsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AuditsQuery, AuditsQueryVariables>(AuditsDocument, options);
        }
export type AuditsQueryHookResult = ReturnType<typeof useAuditsQuery>;
export type AuditsLazyQueryHookResult = ReturnType<typeof useAuditsLazyQuery>;
export type AuditsSuspenseQueryHookResult = ReturnType<typeof useAuditsSuspenseQuery>;
export type AuditsQueryResult = Apollo.QueryResult<AuditsQuery, AuditsQueryVariables>;
export const LoginsDocument = gql`
    query Logins($cursor: String) {
  oidcLogins(first: 50, after: $cursor) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...OidcLogin
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${OidcLoginFragmentDoc}`;

/**
 * __useLoginsQuery__
 *
 * To run a query within a React component, call `useLoginsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoginsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoginsQuery({
 *   variables: {
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useLoginsQuery(baseOptions?: Apollo.QueryHookOptions<LoginsQuery, LoginsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoginsQuery, LoginsQueryVariables>(LoginsDocument, options);
      }
export function useLoginsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoginsQuery, LoginsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoginsQuery, LoginsQueryVariables>(LoginsDocument, options);
        }
export function useLoginsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<LoginsQuery, LoginsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LoginsQuery, LoginsQueryVariables>(LoginsDocument, options);
        }
export type LoginsQueryHookResult = ReturnType<typeof useLoginsQuery>;
export type LoginsLazyQueryHookResult = ReturnType<typeof useLoginsLazyQuery>;
export type LoginsSuspenseQueryHookResult = ReturnType<typeof useLoginsSuspenseQuery>;
export type LoginsQueryResult = Apollo.QueryResult<LoginsQuery, LoginsQueryVariables>;
export const AuditMetricsDocument = gql`
    query AuditMetrics {
  auditMetrics {
    country
    count
  }
}
    `;

/**
 * __useAuditMetricsQuery__
 *
 * To run a query within a React component, call `useAuditMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuditMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuditMetricsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAuditMetricsQuery(baseOptions?: Apollo.QueryHookOptions<AuditMetricsQuery, AuditMetricsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AuditMetricsQuery, AuditMetricsQueryVariables>(AuditMetricsDocument, options);
      }
export function useAuditMetricsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AuditMetricsQuery, AuditMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AuditMetricsQuery, AuditMetricsQueryVariables>(AuditMetricsDocument, options);
        }
export function useAuditMetricsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AuditMetricsQuery, AuditMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AuditMetricsQuery, AuditMetricsQueryVariables>(AuditMetricsDocument, options);
        }
export type AuditMetricsQueryHookResult = ReturnType<typeof useAuditMetricsQuery>;
export type AuditMetricsLazyQueryHookResult = ReturnType<typeof useAuditMetricsLazyQuery>;
export type AuditMetricsSuspenseQueryHookResult = ReturnType<typeof useAuditMetricsSuspenseQuery>;
export type AuditMetricsQueryResult = Apollo.QueryResult<AuditMetricsQuery, AuditMetricsQueryVariables>;
export const LoginMetricsDocument = gql`
    query LoginMetrics {
  loginMetrics {
    country
    count
  }
}
    `;

/**
 * __useLoginMetricsQuery__
 *
 * To run a query within a React component, call `useLoginMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoginMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoginMetricsQuery({
 *   variables: {
 *   },
 * });
 */
export function useLoginMetricsQuery(baseOptions?: Apollo.QueryHookOptions<LoginMetricsQuery, LoginMetricsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoginMetricsQuery, LoginMetricsQueryVariables>(LoginMetricsDocument, options);
      }
export function useLoginMetricsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoginMetricsQuery, LoginMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoginMetricsQuery, LoginMetricsQueryVariables>(LoginMetricsDocument, options);
        }
export function useLoginMetricsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<LoginMetricsQuery, LoginMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LoginMetricsQuery, LoginMetricsQueryVariables>(LoginMetricsDocument, options);
        }
export type LoginMetricsQueryHookResult = ReturnType<typeof useLoginMetricsQuery>;
export type LoginMetricsLazyQueryHookResult = ReturnType<typeof useLoginMetricsLazyQuery>;
export type LoginMetricsSuspenseQueryHookResult = ReturnType<typeof useLoginMetricsSuspenseQuery>;
export type LoginMetricsQueryResult = Apollo.QueryResult<LoginMetricsQuery, LoginMetricsQueryVariables>;
export const GetChartsDocument = gql`
    query GetCharts($id: ID!) {
  charts(repositoryId: $id, first: 100) {
    edges {
      node {
        ...Chart
      }
    }
  }
}
    ${ChartFragmentDoc}`;

/**
 * __useGetChartsQuery__
 *
 * To run a query within a React component, call `useGetChartsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChartsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChartsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetChartsQuery(baseOptions: Apollo.QueryHookOptions<GetChartsQuery, GetChartsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChartsQuery, GetChartsQueryVariables>(GetChartsDocument, options);
      }
export function useGetChartsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChartsQuery, GetChartsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChartsQuery, GetChartsQueryVariables>(GetChartsDocument, options);
        }
export function useGetChartsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetChartsQuery, GetChartsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChartsQuery, GetChartsQueryVariables>(GetChartsDocument, options);
        }
export type GetChartsQueryHookResult = ReturnType<typeof useGetChartsQuery>;
export type GetChartsLazyQueryHookResult = ReturnType<typeof useGetChartsLazyQuery>;
export type GetChartsSuspenseQueryHookResult = ReturnType<typeof useGetChartsSuspenseQuery>;
export type GetChartsQueryResult = Apollo.QueryResult<GetChartsQuery, GetChartsQueryVariables>;
export const GetVersionsDocument = gql`
    query GetVersions($id: ID!) {
  versions(chartId: $id, first: 100) {
    edges {
      node {
        ...Version
      }
    }
  }
}
    ${VersionFragmentDoc}`;

/**
 * __useGetVersionsQuery__
 *
 * To run a query within a React component, call `useGetVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVersionsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetVersionsQuery(baseOptions: Apollo.QueryHookOptions<GetVersionsQuery, GetVersionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVersionsQuery, GetVersionsQueryVariables>(GetVersionsDocument, options);
      }
export function useGetVersionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVersionsQuery, GetVersionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVersionsQuery, GetVersionsQueryVariables>(GetVersionsDocument, options);
        }
export function useGetVersionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetVersionsQuery, GetVersionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetVersionsQuery, GetVersionsQueryVariables>(GetVersionsDocument, options);
        }
export type GetVersionsQueryHookResult = ReturnType<typeof useGetVersionsQuery>;
export type GetVersionsLazyQueryHookResult = ReturnType<typeof useGetVersionsLazyQuery>;
export type GetVersionsSuspenseQueryHookResult = ReturnType<typeof useGetVersionsSuspenseQuery>;
export type GetVersionsQueryResult = Apollo.QueryResult<GetVersionsQuery, GetVersionsQueryVariables>;
export const GetChartInstallationsDocument = gql`
    query GetChartInstallations($id: ID!) {
  chartInstallations(repositoryId: $id, first: 100) {
    edges {
      node {
        ...ChartInstallation
      }
    }
  }
}
    ${ChartInstallationFragmentDoc}`;

/**
 * __useGetChartInstallationsQuery__
 *
 * To run a query within a React component, call `useGetChartInstallationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChartInstallationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChartInstallationsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetChartInstallationsQuery(baseOptions: Apollo.QueryHookOptions<GetChartInstallationsQuery, GetChartInstallationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChartInstallationsQuery, GetChartInstallationsQueryVariables>(GetChartInstallationsDocument, options);
      }
export function useGetChartInstallationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChartInstallationsQuery, GetChartInstallationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChartInstallationsQuery, GetChartInstallationsQueryVariables>(GetChartInstallationsDocument, options);
        }
export function useGetChartInstallationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetChartInstallationsQuery, GetChartInstallationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChartInstallationsQuery, GetChartInstallationsQueryVariables>(GetChartInstallationsDocument, options);
        }
export type GetChartInstallationsQueryHookResult = ReturnType<typeof useGetChartInstallationsQuery>;
export type GetChartInstallationsLazyQueryHookResult = ReturnType<typeof useGetChartInstallationsLazyQuery>;
export type GetChartInstallationsSuspenseQueryHookResult = ReturnType<typeof useGetChartInstallationsSuspenseQuery>;
export type GetChartInstallationsQueryResult = Apollo.QueryResult<GetChartInstallationsQuery, GetChartInstallationsQueryVariables>;
export const GetPackageInstallationsDocument = gql`
    query GetPackageInstallations($id: ID!) {
  chartInstallations(repositoryId: $id, first: 100) {
    edges {
      node {
        ...ChartInstallation
      }
    }
  }
  terraformInstallations(repositoryId: $id, first: 100) {
    edges {
      node {
        ...TerraformInstallation
      }
    }
  }
}
    ${ChartInstallationFragmentDoc}
${TerraformInstallationFragmentDoc}`;

/**
 * __useGetPackageInstallationsQuery__
 *
 * To run a query within a React component, call `useGetPackageInstallationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPackageInstallationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPackageInstallationsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPackageInstallationsQuery(baseOptions: Apollo.QueryHookOptions<GetPackageInstallationsQuery, GetPackageInstallationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPackageInstallationsQuery, GetPackageInstallationsQueryVariables>(GetPackageInstallationsDocument, options);
      }
export function useGetPackageInstallationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPackageInstallationsQuery, GetPackageInstallationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPackageInstallationsQuery, GetPackageInstallationsQueryVariables>(GetPackageInstallationsDocument, options);
        }
export function useGetPackageInstallationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPackageInstallationsQuery, GetPackageInstallationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPackageInstallationsQuery, GetPackageInstallationsQueryVariables>(GetPackageInstallationsDocument, options);
        }
export type GetPackageInstallationsQueryHookResult = ReturnType<typeof useGetPackageInstallationsQuery>;
export type GetPackageInstallationsLazyQueryHookResult = ReturnType<typeof useGetPackageInstallationsLazyQuery>;
export type GetPackageInstallationsSuspenseQueryHookResult = ReturnType<typeof useGetPackageInstallationsSuspenseQuery>;
export type GetPackageInstallationsQueryResult = Apollo.QueryResult<GetPackageInstallationsQuery, GetPackageInstallationsQueryVariables>;
export const CreateCrdDocument = gql`
    mutation CreateCrd($chartName: ChartName!, $name: String!, $blob: UploadOrUrl!) {
  createCrd(chartName: $chartName, attributes: {name: $name, blob: $blob}) {
    id
  }
}
    `;
export type CreateCrdMutationFn = Apollo.MutationFunction<CreateCrdMutation, CreateCrdMutationVariables>;

/**
 * __useCreateCrdMutation__
 *
 * To run a mutation, you first call `useCreateCrdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCrdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCrdMutation, { data, loading, error }] = useCreateCrdMutation({
 *   variables: {
 *      chartName: // value for 'chartName'
 *      name: // value for 'name'
 *      blob: // value for 'blob'
 *   },
 * });
 */
export function useCreateCrdMutation(baseOptions?: Apollo.MutationHookOptions<CreateCrdMutation, CreateCrdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCrdMutation, CreateCrdMutationVariables>(CreateCrdDocument, options);
      }
export type CreateCrdMutationHookResult = ReturnType<typeof useCreateCrdMutation>;
export type CreateCrdMutationResult = Apollo.MutationResult<CreateCrdMutation>;
export type CreateCrdMutationOptions = Apollo.BaseMutationOptions<CreateCrdMutation, CreateCrdMutationVariables>;
export const UninstallChartDocument = gql`
    mutation UninstallChart($id: ID!) {
  deleteChartInstallation(id: $id) {
    id
  }
}
    `;
export type UninstallChartMutationFn = Apollo.MutationFunction<UninstallChartMutation, UninstallChartMutationVariables>;

/**
 * __useUninstallChartMutation__
 *
 * To run a mutation, you first call `useUninstallChartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUninstallChartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uninstallChartMutation, { data, loading, error }] = useUninstallChartMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUninstallChartMutation(baseOptions?: Apollo.MutationHookOptions<UninstallChartMutation, UninstallChartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UninstallChartMutation, UninstallChartMutationVariables>(UninstallChartDocument, options);
      }
export type UninstallChartMutationHookResult = ReturnType<typeof useUninstallChartMutation>;
export type UninstallChartMutationResult = Apollo.MutationResult<UninstallChartMutation>;
export type UninstallChartMutationOptions = Apollo.BaseMutationOptions<UninstallChartMutation, UninstallChartMutationVariables>;
export const ClustersDocument = gql`
    query Clusters($first: Int = 100) {
  clusters(first: $first) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...Cluster
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${ClusterFragmentDoc}`;

/**
 * __useClustersQuery__
 *
 * To run a query within a React component, call `useClustersQuery` and pass it any options that fit your needs.
 * When your component renders, `useClustersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useClustersQuery({
 *   variables: {
 *      first: // value for 'first'
 *   },
 * });
 */
export function useClustersQuery(baseOptions?: Apollo.QueryHookOptions<ClustersQuery, ClustersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ClustersQuery, ClustersQueryVariables>(ClustersDocument, options);
      }
export function useClustersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ClustersQuery, ClustersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ClustersQuery, ClustersQueryVariables>(ClustersDocument, options);
        }
export function useClustersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ClustersQuery, ClustersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ClustersQuery, ClustersQueryVariables>(ClustersDocument, options);
        }
export type ClustersQueryHookResult = ReturnType<typeof useClustersQuery>;
export type ClustersLazyQueryHookResult = ReturnType<typeof useClustersLazyQuery>;
export type ClustersSuspenseQueryHookResult = ReturnType<typeof useClustersSuspenseQuery>;
export type ClustersQueryResult = Apollo.QueryResult<ClustersQuery, ClustersQueryVariables>;
export const DnsRecordsDocument = gql`
    query DnsRecords($cluster: String!, $provider: Provider!) {
  dnsRecords(cluster: $cluster, provider: $provider, first: 500) {
    edges {
      node {
        ...DnsRecord
      }
    }
  }
}
    ${DnsRecordFragmentDoc}`;

/**
 * __useDnsRecordsQuery__
 *
 * To run a query within a React component, call `useDnsRecordsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDnsRecordsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDnsRecordsQuery({
 *   variables: {
 *      cluster: // value for 'cluster'
 *      provider: // value for 'provider'
 *   },
 * });
 */
export function useDnsRecordsQuery(baseOptions: Apollo.QueryHookOptions<DnsRecordsQuery, DnsRecordsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DnsRecordsQuery, DnsRecordsQueryVariables>(DnsRecordsDocument, options);
      }
export function useDnsRecordsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DnsRecordsQuery, DnsRecordsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DnsRecordsQuery, DnsRecordsQueryVariables>(DnsRecordsDocument, options);
        }
export function useDnsRecordsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<DnsRecordsQuery, DnsRecordsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DnsRecordsQuery, DnsRecordsQueryVariables>(DnsRecordsDocument, options);
        }
export type DnsRecordsQueryHookResult = ReturnType<typeof useDnsRecordsQuery>;
export type DnsRecordsLazyQueryHookResult = ReturnType<typeof useDnsRecordsLazyQuery>;
export type DnsRecordsSuspenseQueryHookResult = ReturnType<typeof useDnsRecordsSuspenseQuery>;
export type DnsRecordsQueryResult = Apollo.QueryResult<DnsRecordsQuery, DnsRecordsQueryVariables>;
export const CreateDnsRecordDocument = gql`
    mutation CreateDnsRecord($cluster: String!, $provider: Provider!, $attributes: DnsRecordAttributes!) {
  createDnsRecord(cluster: $cluster, provider: $provider, attributes: $attributes) {
    ...DnsRecord
  }
}
    ${DnsRecordFragmentDoc}`;
export type CreateDnsRecordMutationFn = Apollo.MutationFunction<CreateDnsRecordMutation, CreateDnsRecordMutationVariables>;

/**
 * __useCreateDnsRecordMutation__
 *
 * To run a mutation, you first call `useCreateDnsRecordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDnsRecordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDnsRecordMutation, { data, loading, error }] = useCreateDnsRecordMutation({
 *   variables: {
 *      cluster: // value for 'cluster'
 *      provider: // value for 'provider'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateDnsRecordMutation(baseOptions?: Apollo.MutationHookOptions<CreateDnsRecordMutation, CreateDnsRecordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDnsRecordMutation, CreateDnsRecordMutationVariables>(CreateDnsRecordDocument, options);
      }
export type CreateDnsRecordMutationHookResult = ReturnType<typeof useCreateDnsRecordMutation>;
export type CreateDnsRecordMutationResult = Apollo.MutationResult<CreateDnsRecordMutation>;
export type CreateDnsRecordMutationOptions = Apollo.BaseMutationOptions<CreateDnsRecordMutation, CreateDnsRecordMutationVariables>;
export const DeleteDnsRecordDocument = gql`
    mutation DeleteDnsRecord($name: String!, $type: DnsRecordType!) {
  deleteDnsRecord(name: $name, type: $type) {
    ...DnsRecord
  }
}
    ${DnsRecordFragmentDoc}`;
export type DeleteDnsRecordMutationFn = Apollo.MutationFunction<DeleteDnsRecordMutation, DeleteDnsRecordMutationVariables>;

/**
 * __useDeleteDnsRecordMutation__
 *
 * To run a mutation, you first call `useDeleteDnsRecordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDnsRecordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDnsRecordMutation, { data, loading, error }] = useDeleteDnsRecordMutation({
 *   variables: {
 *      name: // value for 'name'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useDeleteDnsRecordMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDnsRecordMutation, DeleteDnsRecordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDnsRecordMutation, DeleteDnsRecordMutationVariables>(DeleteDnsRecordDocument, options);
      }
export type DeleteDnsRecordMutationHookResult = ReturnType<typeof useDeleteDnsRecordMutation>;
export type DeleteDnsRecordMutationResult = Apollo.MutationResult<DeleteDnsRecordMutation>;
export type DeleteDnsRecordMutationOptions = Apollo.BaseMutationOptions<DeleteDnsRecordMutation, DeleteDnsRecordMutationVariables>;
export const UpdateDomainDocument = gql`
    mutation UpdateDomain($id: ID!, $attributes: DnsDomainAttributes!) {
  updateDomain(id: $id, attributes: $attributes) {
    ...DnsDomain
  }
}
    ${DnsDomainFragmentDoc}`;
export type UpdateDomainMutationFn = Apollo.MutationFunction<UpdateDomainMutation, UpdateDomainMutationVariables>;

/**
 * __useUpdateDomainMutation__
 *
 * To run a mutation, you first call `useUpdateDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDomainMutation, { data, loading, error }] = useUpdateDomainMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateDomainMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDomainMutation, UpdateDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDomainMutation, UpdateDomainMutationVariables>(UpdateDomainDocument, options);
      }
export type UpdateDomainMutationHookResult = ReturnType<typeof useUpdateDomainMutation>;
export type UpdateDomainMutationResult = Apollo.MutationResult<UpdateDomainMutation>;
export type UpdateDomainMutationOptions = Apollo.BaseMutationOptions<UpdateDomainMutation, UpdateDomainMutationVariables>;
export const DeleteDomainDocument = gql`
    mutation DeleteDomain($id: ID!) {
  deleteDomain(id: $id) {
    ...DnsDomain
  }
}
    ${DnsDomainFragmentDoc}`;
export type DeleteDomainMutationFn = Apollo.MutationFunction<DeleteDomainMutation, DeleteDomainMutationVariables>;

/**
 * __useDeleteDomainMutation__
 *
 * To run a mutation, you first call `useDeleteDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDomainMutation, { data, loading, error }] = useDeleteDomainMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteDomainMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDomainMutation, DeleteDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDomainMutation, DeleteDomainMutationVariables>(DeleteDomainDocument, options);
      }
export type DeleteDomainMutationHookResult = ReturnType<typeof useDeleteDomainMutation>;
export type DeleteDomainMutationResult = Apollo.MutationResult<DeleteDomainMutation>;
export type DeleteDomainMutationOptions = Apollo.BaseMutationOptions<DeleteDomainMutation, DeleteDomainMutationVariables>;
export const CreateDomainDocument = gql`
    mutation CreateDomain($name: String!) {
  provisionDomain(name: $name) {
    ...DnsDomain
  }
}
    ${DnsDomainFragmentDoc}`;
export type CreateDomainMutationFn = Apollo.MutationFunction<CreateDomainMutation, CreateDomainMutationVariables>;

/**
 * __useCreateDomainMutation__
 *
 * To run a mutation, you first call `useCreateDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDomainMutation, { data, loading, error }] = useCreateDomainMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateDomainMutation(baseOptions?: Apollo.MutationHookOptions<CreateDomainMutation, CreateDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDomainMutation, CreateDomainMutationVariables>(CreateDomainDocument, options);
      }
export type CreateDomainMutationHookResult = ReturnType<typeof useCreateDomainMutation>;
export type CreateDomainMutationResult = Apollo.MutationResult<CreateDomainMutation>;
export type CreateDomainMutationOptions = Apollo.BaseMutationOptions<CreateDomainMutation, CreateDomainMutationVariables>;
export const GroupMembersDocument = gql`
    query GroupMembers($cursor: String, $id: ID!) {
  groupMembers(groupId: $id, after: $cursor, first: 20) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...GroupMember
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${GroupMemberFragmentDoc}`;

/**
 * __useGroupMembersQuery__
 *
 * To run a query within a React component, call `useGroupMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupMembersQuery({
 *   variables: {
 *      cursor: // value for 'cursor'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGroupMembersQuery(baseOptions: Apollo.QueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GroupMembersQuery, GroupMembersQueryVariables>(GroupMembersDocument, options);
      }
export function useGroupMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GroupMembersQuery, GroupMembersQueryVariables>(GroupMembersDocument, options);
        }
export function useGroupMembersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GroupMembersQuery, GroupMembersQueryVariables>(GroupMembersDocument, options);
        }
export type GroupMembersQueryHookResult = ReturnType<typeof useGroupMembersQuery>;
export type GroupMembersLazyQueryHookResult = ReturnType<typeof useGroupMembersLazyQuery>;
export type GroupMembersSuspenseQueryHookResult = ReturnType<typeof useGroupMembersSuspenseQuery>;
export type GroupMembersQueryResult = Apollo.QueryResult<GroupMembersQuery, GroupMembersQueryVariables>;
export const CreateGroupMemberDocument = gql`
    mutation CreateGroupMember($groupId: ID!, $userId: ID!) {
  createGroupMember(groupId: $groupId, userId: $userId) {
    ...GroupMember
  }
}
    ${GroupMemberFragmentDoc}`;
export type CreateGroupMemberMutationFn = Apollo.MutationFunction<CreateGroupMemberMutation, CreateGroupMemberMutationVariables>;

/**
 * __useCreateGroupMemberMutation__
 *
 * To run a mutation, you first call `useCreateGroupMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMemberMutation, { data, loading, error }] = useCreateGroupMemberMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useCreateGroupMemberMutation(baseOptions?: Apollo.MutationHookOptions<CreateGroupMemberMutation, CreateGroupMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGroupMemberMutation, CreateGroupMemberMutationVariables>(CreateGroupMemberDocument, options);
      }
export type CreateGroupMemberMutationHookResult = ReturnType<typeof useCreateGroupMemberMutation>;
export type CreateGroupMemberMutationResult = Apollo.MutationResult<CreateGroupMemberMutation>;
export type CreateGroupMemberMutationOptions = Apollo.BaseMutationOptions<CreateGroupMemberMutation, CreateGroupMemberMutationVariables>;
export const DeleteGroupMemberDocument = gql`
    mutation DeleteGroupMember($groupId: ID!, $userId: ID!) {
  deleteGroupMember(groupId: $groupId, userId: $userId) {
    ...GroupMember
  }
}
    ${GroupMemberFragmentDoc}`;
export type DeleteGroupMemberMutationFn = Apollo.MutationFunction<DeleteGroupMemberMutation, DeleteGroupMemberMutationVariables>;

/**
 * __useDeleteGroupMemberMutation__
 *
 * To run a mutation, you first call `useDeleteGroupMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupMemberMutation, { data, loading, error }] = useDeleteGroupMemberMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteGroupMemberMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGroupMemberMutation, DeleteGroupMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGroupMemberMutation, DeleteGroupMemberMutationVariables>(DeleteGroupMemberDocument, options);
      }
export type DeleteGroupMemberMutationHookResult = ReturnType<typeof useDeleteGroupMemberMutation>;
export type DeleteGroupMemberMutationResult = Apollo.MutationResult<DeleteGroupMemberMutation>;
export type DeleteGroupMemberMutationOptions = Apollo.BaseMutationOptions<DeleteGroupMemberMutation, DeleteGroupMemberMutationVariables>;
export const CreateGroupDocument = gql`
    mutation CreateGroup($attributes: GroupAttributes!) {
  createGroup(attributes: $attributes) {
    ...Group
  }
}
    ${GroupFragmentDoc}`;
export type CreateGroupMutationFn = Apollo.MutationFunction<CreateGroupMutation, CreateGroupMutationVariables>;

/**
 * __useCreateGroupMutation__
 *
 * To run a mutation, you first call `useCreateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMutation, { data, loading, error }] = useCreateGroupMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateGroupMutation, CreateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGroupMutation, CreateGroupMutationVariables>(CreateGroupDocument, options);
      }
export type CreateGroupMutationHookResult = ReturnType<typeof useCreateGroupMutation>;
export type CreateGroupMutationResult = Apollo.MutationResult<CreateGroupMutation>;
export type CreateGroupMutationOptions = Apollo.BaseMutationOptions<CreateGroupMutation, CreateGroupMutationVariables>;
export const UpdateGroupDocument = gql`
    mutation UpdateGroup($id: ID!, $attributes: GroupAttributes!) {
  updateGroup(groupId: $id, attributes: $attributes) {
    ...Group
  }
}
    ${GroupFragmentDoc}`;
export type UpdateGroupMutationFn = Apollo.MutationFunction<UpdateGroupMutation, UpdateGroupMutationVariables>;

/**
 * __useUpdateGroupMutation__
 *
 * To run a mutation, you first call `useUpdateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGroupMutation, { data, loading, error }] = useUpdateGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateGroupMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGroupMutation, UpdateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGroupMutation, UpdateGroupMutationVariables>(UpdateGroupDocument, options);
      }
export type UpdateGroupMutationHookResult = ReturnType<typeof useUpdateGroupMutation>;
export type UpdateGroupMutationResult = Apollo.MutationResult<UpdateGroupMutation>;
export type UpdateGroupMutationOptions = Apollo.BaseMutationOptions<UpdateGroupMutation, UpdateGroupMutationVariables>;
export const DeleteGroupDocument = gql`
    mutation DeleteGroup($id: ID!) {
  deleteGroup(groupId: $id) {
    ...Group
  }
}
    ${GroupFragmentDoc}`;
export type DeleteGroupMutationFn = Apollo.MutationFunction<DeleteGroupMutation, DeleteGroupMutationVariables>;

/**
 * __useDeleteGroupMutation__
 *
 * To run a mutation, you first call `useDeleteGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupMutation, { data, loading, error }] = useDeleteGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGroupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGroupMutation, DeleteGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGroupMutation, DeleteGroupMutationVariables>(DeleteGroupDocument, options);
      }
export type DeleteGroupMutationHookResult = ReturnType<typeof useDeleteGroupMutation>;
export type DeleteGroupMutationResult = Apollo.MutationResult<DeleteGroupMutation>;
export type DeleteGroupMutationOptions = Apollo.BaseMutationOptions<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const GroupsDocument = gql`
    query Groups($q: String, $cursor: String) {
  groups(q: $q, first: 20, after: $cursor) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...Group
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${GroupFragmentDoc}`;

/**
 * __useGroupsQuery__
 *
 * To run a query within a React component, call `useGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupsQuery({
 *   variables: {
 *      q: // value for 'q'
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useGroupsQuery(baseOptions?: Apollo.QueryHookOptions<GroupsQuery, GroupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GroupsQuery, GroupsQueryVariables>(GroupsDocument, options);
      }
export function useGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GroupsQuery, GroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GroupsQuery, GroupsQueryVariables>(GroupsDocument, options);
        }
export function useGroupsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GroupsQuery, GroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GroupsQuery, GroupsQueryVariables>(GroupsDocument, options);
        }
export type GroupsQueryHookResult = ReturnType<typeof useGroupsQuery>;
export type GroupsLazyQueryHookResult = ReturnType<typeof useGroupsLazyQuery>;
export type GroupsSuspenseQueryHookResult = ReturnType<typeof useGroupsSuspenseQuery>;
export type GroupsQueryResult = Apollo.QueryResult<GroupsQuery, GroupsQueryVariables>;
export const OauthIntegrationsDocument = gql`
    query OauthIntegrations {
  oauthIntegrations {
    ...OauthIntegration
  }
}
    ${OauthIntegrationFragmentDoc}`;

/**
 * __useOauthIntegrationsQuery__
 *
 * To run a query within a React component, call `useOauthIntegrationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOauthIntegrationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOauthIntegrationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useOauthIntegrationsQuery(baseOptions?: Apollo.QueryHookOptions<OauthIntegrationsQuery, OauthIntegrationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OauthIntegrationsQuery, OauthIntegrationsQueryVariables>(OauthIntegrationsDocument, options);
      }
export function useOauthIntegrationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OauthIntegrationsQuery, OauthIntegrationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OauthIntegrationsQuery, OauthIntegrationsQueryVariables>(OauthIntegrationsDocument, options);
        }
export function useOauthIntegrationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OauthIntegrationsQuery, OauthIntegrationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OauthIntegrationsQuery, OauthIntegrationsQueryVariables>(OauthIntegrationsDocument, options);
        }
export type OauthIntegrationsQueryHookResult = ReturnType<typeof useOauthIntegrationsQuery>;
export type OauthIntegrationsLazyQueryHookResult = ReturnType<typeof useOauthIntegrationsLazyQuery>;
export type OauthIntegrationsSuspenseQueryHookResult = ReturnType<typeof useOauthIntegrationsSuspenseQuery>;
export type OauthIntegrationsQueryResult = Apollo.QueryResult<OauthIntegrationsQuery, OauthIntegrationsQueryVariables>;
export const CreateOauthIntegrationDocument = gql`
    mutation CreateOauthIntegration($attributes: OauthAttributes!) {
  createOauthIntegration(attributes: $attributes) {
    ...OauthIntegration
  }
}
    ${OauthIntegrationFragmentDoc}`;
export type CreateOauthIntegrationMutationFn = Apollo.MutationFunction<CreateOauthIntegrationMutation, CreateOauthIntegrationMutationVariables>;

/**
 * __useCreateOauthIntegrationMutation__
 *
 * To run a mutation, you first call `useCreateOauthIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOauthIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOauthIntegrationMutation, { data, loading, error }] = useCreateOauthIntegrationMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateOauthIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<CreateOauthIntegrationMutation, CreateOauthIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOauthIntegrationMutation, CreateOauthIntegrationMutationVariables>(CreateOauthIntegrationDocument, options);
      }
export type CreateOauthIntegrationMutationHookResult = ReturnType<typeof useCreateOauthIntegrationMutation>;
export type CreateOauthIntegrationMutationResult = Apollo.MutationResult<CreateOauthIntegrationMutation>;
export type CreateOauthIntegrationMutationOptions = Apollo.BaseMutationOptions<CreateOauthIntegrationMutation, CreateOauthIntegrationMutationVariables>;
export const InviteDocument = gql`
    query Invite($id: String!) {
  invite(id: $id) {
    ...Invite
  }
}
    ${InviteFragmentDoc}`;

/**
 * __useInviteQuery__
 *
 * To run a query within a React component, call `useInviteQuery` and pass it any options that fit your needs.
 * When your component renders, `useInviteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInviteQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useInviteQuery(baseOptions: Apollo.QueryHookOptions<InviteQuery, InviteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InviteQuery, InviteQueryVariables>(InviteDocument, options);
      }
export function useInviteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InviteQuery, InviteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InviteQuery, InviteQueryVariables>(InviteDocument, options);
        }
export function useInviteSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<InviteQuery, InviteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InviteQuery, InviteQueryVariables>(InviteDocument, options);
        }
export type InviteQueryHookResult = ReturnType<typeof useInviteQuery>;
export type InviteLazyQueryHookResult = ReturnType<typeof useInviteLazyQuery>;
export type InviteSuspenseQueryHookResult = ReturnType<typeof useInviteSuspenseQuery>;
export type InviteQueryResult = Apollo.QueryResult<InviteQuery, InviteQueryVariables>;
export const CreateInviteDocument = gql`
    mutation CreateInvite($attributes: InviteAttributes!) {
  createInvite(attributes: $attributes) {
    ...Invite
  }
}
    ${InviteFragmentDoc}`;
export type CreateInviteMutationFn = Apollo.MutationFunction<CreateInviteMutation, CreateInviteMutationVariables>;

/**
 * __useCreateInviteMutation__
 *
 * To run a mutation, you first call `useCreateInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInviteMutation, { data, loading, error }] = useCreateInviteMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateInviteMutation(baseOptions?: Apollo.MutationHookOptions<CreateInviteMutation, CreateInviteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateInviteMutation, CreateInviteMutationVariables>(CreateInviteDocument, options);
      }
export type CreateInviteMutationHookResult = ReturnType<typeof useCreateInviteMutation>;
export type CreateInviteMutationResult = Apollo.MutationResult<CreateInviteMutation>;
export type CreateInviteMutationOptions = Apollo.BaseMutationOptions<CreateInviteMutation, CreateInviteMutationVariables>;
export const SignupInviteDocument = gql`
    mutation SignupInvite($attributes: UserAttributes!, $inviteId: String!) {
  signup(attributes: $attributes, inviteId: $inviteId) {
    jwt
  }
}
    `;
export type SignupInviteMutationFn = Apollo.MutationFunction<SignupInviteMutation, SignupInviteMutationVariables>;

/**
 * __useSignupInviteMutation__
 *
 * To run a mutation, you first call `useSignupInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupInviteMutation, { data, loading, error }] = useSignupInviteMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *      inviteId: // value for 'inviteId'
 *   },
 * });
 */
export function useSignupInviteMutation(baseOptions?: Apollo.MutationHookOptions<SignupInviteMutation, SignupInviteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignupInviteMutation, SignupInviteMutationVariables>(SignupInviteDocument, options);
      }
export type SignupInviteMutationHookResult = ReturnType<typeof useSignupInviteMutation>;
export type SignupInviteMutationResult = Apollo.MutationResult<SignupInviteMutation>;
export type SignupInviteMutationOptions = Apollo.BaseMutationOptions<SignupInviteMutation, SignupInviteMutationVariables>;
export const RealizeInviteDocument = gql`
    mutation RealizeInvite($id: String!) {
  realizeInvite(id: $id) {
    jwt
  }
}
    `;
export type RealizeInviteMutationFn = Apollo.MutationFunction<RealizeInviteMutation, RealizeInviteMutationVariables>;

/**
 * __useRealizeInviteMutation__
 *
 * To run a mutation, you first call `useRealizeInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRealizeInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [realizeInviteMutation, { data, loading, error }] = useRealizeInviteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRealizeInviteMutation(baseOptions?: Apollo.MutationHookOptions<RealizeInviteMutation, RealizeInviteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RealizeInviteMutation, RealizeInviteMutationVariables>(RealizeInviteDocument, options);
      }
export type RealizeInviteMutationHookResult = ReturnType<typeof useRealizeInviteMutation>;
export type RealizeInviteMutationResult = Apollo.MutationResult<RealizeInviteMutation>;
export type RealizeInviteMutationOptions = Apollo.BaseMutationOptions<RealizeInviteMutation, RealizeInviteMutationVariables>;
export const DeleteInviteDocument = gql`
    mutation DeleteInvite($id: ID!) {
  deleteInvite(id: $id) {
    ...Invite
  }
}
    ${InviteFragmentDoc}`;
export type DeleteInviteMutationFn = Apollo.MutationFunction<DeleteInviteMutation, DeleteInviteMutationVariables>;

/**
 * __useDeleteInviteMutation__
 *
 * To run a mutation, you first call `useDeleteInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteInviteMutation, { data, loading, error }] = useDeleteInviteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteInviteMutation(baseOptions?: Apollo.MutationHookOptions<DeleteInviteMutation, DeleteInviteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteInviteMutation, DeleteInviteMutationVariables>(DeleteInviteDocument, options);
      }
export type DeleteInviteMutationHookResult = ReturnType<typeof useDeleteInviteMutation>;
export type DeleteInviteMutationResult = Apollo.MutationResult<DeleteInviteMutation>;
export type DeleteInviteMutationOptions = Apollo.BaseMutationOptions<DeleteInviteMutation, DeleteInviteMutationVariables>;
export const KeyBackupsDocument = gql`
    query KeyBackups {
  keyBackups(first: 1000) {
    edges {
      node {
        ...KeyBackup
      }
    }
  }
}
    ${KeyBackupFragmentDoc}`;

/**
 * __useKeyBackupsQuery__
 *
 * To run a query within a React component, call `useKeyBackupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useKeyBackupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useKeyBackupsQuery({
 *   variables: {
 *   },
 * });
 */
export function useKeyBackupsQuery(baseOptions?: Apollo.QueryHookOptions<KeyBackupsQuery, KeyBackupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<KeyBackupsQuery, KeyBackupsQueryVariables>(KeyBackupsDocument, options);
      }
export function useKeyBackupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<KeyBackupsQuery, KeyBackupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<KeyBackupsQuery, KeyBackupsQueryVariables>(KeyBackupsDocument, options);
        }
export function useKeyBackupsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<KeyBackupsQuery, KeyBackupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<KeyBackupsQuery, KeyBackupsQueryVariables>(KeyBackupsDocument, options);
        }
export type KeyBackupsQueryHookResult = ReturnType<typeof useKeyBackupsQuery>;
export type KeyBackupsLazyQueryHookResult = ReturnType<typeof useKeyBackupsLazyQuery>;
export type KeyBackupsSuspenseQueryHookResult = ReturnType<typeof useKeyBackupsSuspenseQuery>;
export type KeyBackupsQueryResult = Apollo.QueryResult<KeyBackupsQuery, KeyBackupsQueryVariables>;
export const KeyBackupDocument = gql`
    query KeyBackup($name: String!) {
  keyBackup(name: $name) {
    ...KeyBackup
  }
}
    ${KeyBackupFragmentDoc}`;

/**
 * __useKeyBackupQuery__
 *
 * To run a query within a React component, call `useKeyBackupQuery` and pass it any options that fit your needs.
 * When your component renders, `useKeyBackupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useKeyBackupQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useKeyBackupQuery(baseOptions: Apollo.QueryHookOptions<KeyBackupQuery, KeyBackupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<KeyBackupQuery, KeyBackupQueryVariables>(KeyBackupDocument, options);
      }
export function useKeyBackupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<KeyBackupQuery, KeyBackupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<KeyBackupQuery, KeyBackupQueryVariables>(KeyBackupDocument, options);
        }
export function useKeyBackupSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<KeyBackupQuery, KeyBackupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<KeyBackupQuery, KeyBackupQueryVariables>(KeyBackupDocument, options);
        }
export type KeyBackupQueryHookResult = ReturnType<typeof useKeyBackupQuery>;
export type KeyBackupLazyQueryHookResult = ReturnType<typeof useKeyBackupLazyQuery>;
export type KeyBackupSuspenseQueryHookResult = ReturnType<typeof useKeyBackupSuspenseQuery>;
export type KeyBackupQueryResult = Apollo.QueryResult<KeyBackupQuery, KeyBackupQueryVariables>;
export const DeleteKeyBackupDocument = gql`
    mutation DeleteKeyBackup($name: String!) {
  deleteKeyBackup(name: $name) {
    ...KeyBackup
  }
}
    ${KeyBackupFragmentDoc}`;
export type DeleteKeyBackupMutationFn = Apollo.MutationFunction<DeleteKeyBackupMutation, DeleteKeyBackupMutationVariables>;

/**
 * __useDeleteKeyBackupMutation__
 *
 * To run a mutation, you first call `useDeleteKeyBackupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteKeyBackupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteKeyBackupMutation, { data, loading, error }] = useDeleteKeyBackupMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useDeleteKeyBackupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteKeyBackupMutation, DeleteKeyBackupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteKeyBackupMutation, DeleteKeyBackupMutationVariables>(DeleteKeyBackupDocument, options);
      }
export type DeleteKeyBackupMutationHookResult = ReturnType<typeof useDeleteKeyBackupMutation>;
export type DeleteKeyBackupMutationResult = Apollo.MutationResult<DeleteKeyBackupMutation>;
export type DeleteKeyBackupMutationOptions = Apollo.BaseMutationOptions<DeleteKeyBackupMutation, DeleteKeyBackupMutationVariables>;
export const CreateKeyBackupDocument = gql`
    mutation CreateKeyBackup($attributes: KeyBackupAttributes!) {
  createKeyBackup(attributes: $attributes) {
    ...KeyBackup
  }
}
    ${KeyBackupFragmentDoc}`;
export type CreateKeyBackupMutationFn = Apollo.MutationFunction<CreateKeyBackupMutation, CreateKeyBackupMutationVariables>;

/**
 * __useCreateKeyBackupMutation__
 *
 * To run a mutation, you first call `useCreateKeyBackupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateKeyBackupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createKeyBackupMutation, { data, loading, error }] = useCreateKeyBackupMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateKeyBackupMutation(baseOptions?: Apollo.MutationHookOptions<CreateKeyBackupMutation, CreateKeyBackupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateKeyBackupMutation, CreateKeyBackupMutationVariables>(CreateKeyBackupDocument, options);
      }
export type CreateKeyBackupMutationHookResult = ReturnType<typeof useCreateKeyBackupMutation>;
export type CreateKeyBackupMutationResult = Apollo.MutationResult<CreateKeyBackupMutation>;
export type CreateKeyBackupMutationOptions = Apollo.BaseMutationOptions<CreateKeyBackupMutation, CreateKeyBackupMutationVariables>;
export const CategoriesDocument = gql`
    query Categories {
  categories {
    ...CategoryInfo
  }
}
    ${CategoryInfoFragmentDoc}`;

/**
 * __useCategoriesQuery__
 *
 * To run a query within a React component, call `useCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCategoriesQuery(baseOptions?: Apollo.QueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
      }
export function useCategoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
export function useCategoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<typeof useCategoriesLazyQuery>;
export type CategoriesSuspenseQueryHookResult = ReturnType<typeof useCategoriesSuspenseQuery>;
export type CategoriesQueryResult = Apollo.QueryResult<CategoriesQuery, CategoriesQueryVariables>;
export const TagsDocument = gql`
    query Tags($cursor: String) {
  tags(type: REPOSITORIES, first: 200, after: $cursor) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...GroupedTag
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${GroupedTagFragmentDoc}`;

/**
 * __useTagsQuery__
 *
 * To run a query within a React component, call `useTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTagsQuery({
 *   variables: {
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useTagsQuery(baseOptions?: Apollo.QueryHookOptions<TagsQuery, TagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
      }
export function useTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TagsQuery, TagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
        }
export function useTagsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TagsQuery, TagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
        }
export type TagsQueryHookResult = ReturnType<typeof useTagsQuery>;
export type TagsLazyQueryHookResult = ReturnType<typeof useTagsLazyQuery>;
export type TagsSuspenseQueryHookResult = ReturnType<typeof useTagsSuspenseQuery>;
export type TagsQueryResult = Apollo.QueryResult<TagsQuery, TagsQueryVariables>;
export const NotificationsDocument = gql`
    query Notifications($incidentId: ID, $first: Int = 50, $cursor: String) {
  notifications(incidentId: $incidentId, first: $first, after: $cursor) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...NotificationFragment
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${NotificationFragmentFragmentDoc}`;

/**
 * __useNotificationsQuery__
 *
 * To run a query within a React component, call `useNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationsQuery({
 *   variables: {
 *      incidentId: // value for 'incidentId'
 *      first: // value for 'first'
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useNotificationsQuery(baseOptions?: Apollo.QueryHookOptions<NotificationsQuery, NotificationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NotificationsQuery, NotificationsQueryVariables>(NotificationsDocument, options);
      }
export function useNotificationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NotificationsQuery, NotificationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NotificationsQuery, NotificationsQueryVariables>(NotificationsDocument, options);
        }
export function useNotificationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<NotificationsQuery, NotificationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<NotificationsQuery, NotificationsQueryVariables>(NotificationsDocument, options);
        }
export type NotificationsQueryHookResult = ReturnType<typeof useNotificationsQuery>;
export type NotificationsLazyQueryHookResult = ReturnType<typeof useNotificationsLazyQuery>;
export type NotificationsSuspenseQueryHookResult = ReturnType<typeof useNotificationsSuspenseQuery>;
export type NotificationsQueryResult = Apollo.QueryResult<NotificationsQuery, NotificationsQueryVariables>;
export const OidcConsentDocument = gql`
    query OIDCConsent($challenge: String!) {
  oidcConsent(challenge: $challenge) {
    repository {
      name
      icon
      darkIcon
    }
    consent {
      requestedScope
      skip
    }
  }
}
    `;

/**
 * __useOidcConsentQuery__
 *
 * To run a query within a React component, call `useOidcConsentQuery` and pass it any options that fit your needs.
 * When your component renders, `useOidcConsentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOidcConsentQuery({
 *   variables: {
 *      challenge: // value for 'challenge'
 *   },
 * });
 */
export function useOidcConsentQuery(baseOptions: Apollo.QueryHookOptions<OidcConsentQuery, OidcConsentQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OidcConsentQuery, OidcConsentQueryVariables>(OidcConsentDocument, options);
      }
export function useOidcConsentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OidcConsentQuery, OidcConsentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OidcConsentQuery, OidcConsentQueryVariables>(OidcConsentDocument, options);
        }
export function useOidcConsentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OidcConsentQuery, OidcConsentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OidcConsentQuery, OidcConsentQueryVariables>(OidcConsentDocument, options);
        }
export type OidcConsentQueryHookResult = ReturnType<typeof useOidcConsentQuery>;
export type OidcConsentLazyQueryHookResult = ReturnType<typeof useOidcConsentLazyQuery>;
export type OidcConsentSuspenseQueryHookResult = ReturnType<typeof useOidcConsentSuspenseQuery>;
export type OidcConsentQueryResult = Apollo.QueryResult<OidcConsentQuery, OidcConsentQueryVariables>;
export const ConsentDocument = gql`
    mutation Consent($challenge: String!, $scopes: [String]) {
  oauthConsent(challenge: $challenge, scopes: $scopes) {
    redirectTo
  }
}
    `;
export type ConsentMutationFn = Apollo.MutationFunction<ConsentMutation, ConsentMutationVariables>;

/**
 * __useConsentMutation__
 *
 * To run a mutation, you first call `useConsentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConsentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [consentMutation, { data, loading, error }] = useConsentMutation({
 *   variables: {
 *      challenge: // value for 'challenge'
 *      scopes: // value for 'scopes'
 *   },
 * });
 */
export function useConsentMutation(baseOptions?: Apollo.MutationHookOptions<ConsentMutation, ConsentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConsentMutation, ConsentMutationVariables>(ConsentDocument, options);
      }
export type ConsentMutationHookResult = ReturnType<typeof useConsentMutation>;
export type ConsentMutationResult = Apollo.MutationResult<ConsentMutation>;
export type ConsentMutationOptions = Apollo.BaseMutationOptions<ConsentMutation, ConsentMutationVariables>;
export const OidcProvidersDocument = gql`
    query OIDCProviders($first: Int, $last: Int, $after: String, $before: String) {
  oidcProviders(first: $first, last: $last, after: $after, before: $before) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...OIDCProvider
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${OidcProviderFragmentDoc}`;

/**
 * __useOidcProvidersQuery__
 *
 * To run a query within a React component, call `useOidcProvidersQuery` and pass it any options that fit your needs.
 * When your component renders, `useOidcProvidersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOidcProvidersQuery({
 *   variables: {
 *      first: // value for 'first'
 *      last: // value for 'last'
 *      after: // value for 'after'
 *      before: // value for 'before'
 *   },
 * });
 */
export function useOidcProvidersQuery(baseOptions?: Apollo.QueryHookOptions<OidcProvidersQuery, OidcProvidersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OidcProvidersQuery, OidcProvidersQueryVariables>(OidcProvidersDocument, options);
      }
export function useOidcProvidersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OidcProvidersQuery, OidcProvidersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OidcProvidersQuery, OidcProvidersQueryVariables>(OidcProvidersDocument, options);
        }
export function useOidcProvidersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OidcProvidersQuery, OidcProvidersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OidcProvidersQuery, OidcProvidersQueryVariables>(OidcProvidersDocument, options);
        }
export type OidcProvidersQueryHookResult = ReturnType<typeof useOidcProvidersQuery>;
export type OidcProvidersLazyQueryHookResult = ReturnType<typeof useOidcProvidersLazyQuery>;
export type OidcProvidersSuspenseQueryHookResult = ReturnType<typeof useOidcProvidersSuspenseQuery>;
export type OidcProvidersQueryResult = Apollo.QueryResult<OidcProvidersQuery, OidcProvidersQueryVariables>;
export const CreateProviderDocument = gql`
    mutation CreateProvider($installationId: ID, $attributes: OidcAttributes!) {
  createOidcProvider(installationId: $installationId, attributes: $attributes) {
    ...OIDCProvider
  }
}
    ${OidcProviderFragmentDoc}`;
export type CreateProviderMutationFn = Apollo.MutationFunction<CreateProviderMutation, CreateProviderMutationVariables>;

/**
 * __useCreateProviderMutation__
 *
 * To run a mutation, you first call `useCreateProviderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProviderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProviderMutation, { data, loading, error }] = useCreateProviderMutation({
 *   variables: {
 *      installationId: // value for 'installationId'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateProviderMutation(baseOptions?: Apollo.MutationHookOptions<CreateProviderMutation, CreateProviderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProviderMutation, CreateProviderMutationVariables>(CreateProviderDocument, options);
      }
export type CreateProviderMutationHookResult = ReturnType<typeof useCreateProviderMutation>;
export type CreateProviderMutationResult = Apollo.MutationResult<CreateProviderMutation>;
export type CreateProviderMutationOptions = Apollo.BaseMutationOptions<CreateProviderMutation, CreateProviderMutationVariables>;
export const UpdateProviderDocument = gql`
    mutation UpdateProvider($id: ID, $installationId: ID, $attributes: OidcAttributes!) {
  updateOidcProvider(
    id: $id
    installationId: $installationId
    attributes: $attributes
  ) {
    ...OIDCProvider
  }
}
    ${OidcProviderFragmentDoc}`;
export type UpdateProviderMutationFn = Apollo.MutationFunction<UpdateProviderMutation, UpdateProviderMutationVariables>;

/**
 * __useUpdateProviderMutation__
 *
 * To run a mutation, you first call `useUpdateProviderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProviderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProviderMutation, { data, loading, error }] = useUpdateProviderMutation({
 *   variables: {
 *      id: // value for 'id'
 *      installationId: // value for 'installationId'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateProviderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProviderMutation, UpdateProviderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProviderMutation, UpdateProviderMutationVariables>(UpdateProviderDocument, options);
      }
export type UpdateProviderMutationHookResult = ReturnType<typeof useUpdateProviderMutation>;
export type UpdateProviderMutationResult = Apollo.MutationResult<UpdateProviderMutation>;
export type UpdateProviderMutationOptions = Apollo.BaseMutationOptions<UpdateProviderMutation, UpdateProviderMutationVariables>;
export const DeleteProviderDocument = gql`
    mutation DeleteProvider($id: ID!) {
  deleteOidcProvider(id: $id) {
    ...OIDCProvider
  }
}
    ${OidcProviderFragmentDoc}`;
export type DeleteProviderMutationFn = Apollo.MutationFunction<DeleteProviderMutation, DeleteProviderMutationVariables>;

/**
 * __useDeleteProviderMutation__
 *
 * To run a mutation, you first call `useDeleteProviderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProviderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProviderMutation, { data, loading, error }] = useDeleteProviderMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProviderMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProviderMutation, DeleteProviderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteProviderMutation, DeleteProviderMutationVariables>(DeleteProviderDocument, options);
      }
export type DeleteProviderMutationHookResult = ReturnType<typeof useDeleteProviderMutation>;
export type DeleteProviderMutationResult = Apollo.MutationResult<DeleteProviderMutation>;
export type DeleteProviderMutationOptions = Apollo.BaseMutationOptions<DeleteProviderMutation, DeleteProviderMutationVariables>;
export const SubscriptionDocument = gql`
    query Subscription {
  account {
    ...SubscriptionAccount
  }
}
    ${SubscriptionAccountFragmentDoc}`;

/**
 * __useSubscriptionQuery__
 *
 * To run a query within a React component, call `useSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscriptionQuery({
 *   variables: {
 *   },
 * });
 */
export function useSubscriptionQuery(baseOptions?: Apollo.QueryHookOptions<SubscriptionQuery, SubscriptionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SubscriptionQuery, SubscriptionQueryVariables>(SubscriptionDocument, options);
      }
export function useSubscriptionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SubscriptionQuery, SubscriptionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SubscriptionQuery, SubscriptionQueryVariables>(SubscriptionDocument, options);
        }
export function useSubscriptionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SubscriptionQuery, SubscriptionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SubscriptionQuery, SubscriptionQueryVariables>(SubscriptionDocument, options);
        }
export type SubscriptionQueryHookResult = ReturnType<typeof useSubscriptionQuery>;
export type SubscriptionLazyQueryHookResult = ReturnType<typeof useSubscriptionLazyQuery>;
export type SubscriptionSuspenseQueryHookResult = ReturnType<typeof useSubscriptionSuspenseQuery>;
export type SubscriptionQueryResult = Apollo.QueryResult<SubscriptionQuery, SubscriptionQueryVariables>;
export const UpdateAccountBillingDocument = gql`
    mutation UpdateAccountBilling($attributes: AccountAttributes!) {
  updateAccount(attributes: $attributes) {
    id
  }
}
    `;
export type UpdateAccountBillingMutationFn = Apollo.MutationFunction<UpdateAccountBillingMutation, UpdateAccountBillingMutationVariables>;

/**
 * __useUpdateAccountBillingMutation__
 *
 * To run a mutation, you first call `useUpdateAccountBillingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAccountBillingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAccountBillingMutation, { data, loading, error }] = useUpdateAccountBillingMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateAccountBillingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAccountBillingMutation, UpdateAccountBillingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAccountBillingMutation, UpdateAccountBillingMutationVariables>(UpdateAccountBillingDocument, options);
      }
export type UpdateAccountBillingMutationHookResult = ReturnType<typeof useUpdateAccountBillingMutation>;
export type UpdateAccountBillingMutationResult = Apollo.MutationResult<UpdateAccountBillingMutation>;
export type UpdateAccountBillingMutationOptions = Apollo.BaseMutationOptions<UpdateAccountBillingMutation, UpdateAccountBillingMutationVariables>;
export const DowngradeToFreePlanMutationDocument = gql`
    mutation DowngradeToFreePlanMutation {
  deletePlatformSubscription {
    id
  }
}
    `;
export type DowngradeToFreePlanMutationMutationFn = Apollo.MutationFunction<DowngradeToFreePlanMutationMutation, DowngradeToFreePlanMutationMutationVariables>;

/**
 * __useDowngradeToFreePlanMutationMutation__
 *
 * To run a mutation, you first call `useDowngradeToFreePlanMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDowngradeToFreePlanMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [downgradeToFreePlanMutationMutation, { data, loading, error }] = useDowngradeToFreePlanMutationMutation({
 *   variables: {
 *   },
 * });
 */
export function useDowngradeToFreePlanMutationMutation(baseOptions?: Apollo.MutationHookOptions<DowngradeToFreePlanMutationMutation, DowngradeToFreePlanMutationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DowngradeToFreePlanMutationMutation, DowngradeToFreePlanMutationMutationVariables>(DowngradeToFreePlanMutationDocument, options);
      }
export type DowngradeToFreePlanMutationMutationHookResult = ReturnType<typeof useDowngradeToFreePlanMutationMutation>;
export type DowngradeToFreePlanMutationMutationResult = Apollo.MutationResult<DowngradeToFreePlanMutationMutation>;
export type DowngradeToFreePlanMutationMutationOptions = Apollo.BaseMutationOptions<DowngradeToFreePlanMutationMutation, DowngradeToFreePlanMutationMutationVariables>;
export const CardsDocument = gql`
    query Cards {
  me {
    id
    cards(first: 100) {
      edges {
        node {
          ...Card
        }
      }
    }
  }
}
    ${CardFragmentDoc}`;

/**
 * __useCardsQuery__
 *
 * To run a query within a React component, call `useCardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCardsQuery({
 *   variables: {
 *   },
 * });
 */
export function useCardsQuery(baseOptions?: Apollo.QueryHookOptions<CardsQuery, CardsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CardsQuery, CardsQueryVariables>(CardsDocument, options);
      }
export function useCardsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CardsQuery, CardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CardsQuery, CardsQueryVariables>(CardsDocument, options);
        }
export function useCardsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CardsQuery, CardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CardsQuery, CardsQueryVariables>(CardsDocument, options);
        }
export type CardsQueryHookResult = ReturnType<typeof useCardsQuery>;
export type CardsLazyQueryHookResult = ReturnType<typeof useCardsLazyQuery>;
export type CardsSuspenseQueryHookResult = ReturnType<typeof useCardsSuspenseQuery>;
export type CardsQueryResult = Apollo.QueryResult<CardsQuery, CardsQueryVariables>;
export const SetupIntentDocument = gql`
    mutation SetupIntent($address: AddressAttributes!) {
  setupIntent(address: $address) {
    ...SetupIntent
  }
}
    ${SetupIntentFragmentDoc}`;
export type SetupIntentMutationFn = Apollo.MutationFunction<SetupIntentMutation, SetupIntentMutationVariables>;

/**
 * __useSetupIntentMutation__
 *
 * To run a mutation, you first call `useSetupIntentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupIntentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupIntentMutation, { data, loading, error }] = useSetupIntentMutation({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useSetupIntentMutation(baseOptions?: Apollo.MutationHookOptions<SetupIntentMutation, SetupIntentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetupIntentMutation, SetupIntentMutationVariables>(SetupIntentDocument, options);
      }
export type SetupIntentMutationHookResult = ReturnType<typeof useSetupIntentMutation>;
export type SetupIntentMutationResult = Apollo.MutationResult<SetupIntentMutation>;
export type SetupIntentMutationOptions = Apollo.BaseMutationOptions<SetupIntentMutation, SetupIntentMutationVariables>;
export const InitiateCheckoutDocument = gql`
    mutation InitiateCheckout {
  initiateCheckout {
    url
  }
}
    `;
export type InitiateCheckoutMutationFn = Apollo.MutationFunction<InitiateCheckoutMutation, InitiateCheckoutMutationVariables>;

/**
 * __useInitiateCheckoutMutation__
 *
 * To run a mutation, you first call `useInitiateCheckoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInitiateCheckoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [initiateCheckoutMutation, { data, loading, error }] = useInitiateCheckoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useInitiateCheckoutMutation(baseOptions?: Apollo.MutationHookOptions<InitiateCheckoutMutation, InitiateCheckoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InitiateCheckoutMutation, InitiateCheckoutMutationVariables>(InitiateCheckoutDocument, options);
      }
export type InitiateCheckoutMutationHookResult = ReturnType<typeof useInitiateCheckoutMutation>;
export type InitiateCheckoutMutationResult = Apollo.MutationResult<InitiateCheckoutMutation>;
export type InitiateCheckoutMutationOptions = Apollo.BaseMutationOptions<InitiateCheckoutMutation, InitiateCheckoutMutationVariables>;
export const FinalizeCheckoutDocument = gql`
    mutation FinalizeCheckout($sessionId: String!) {
  finalizeCheckout(sessionId: $sessionId) {
    id
  }
}
    `;
export type FinalizeCheckoutMutationFn = Apollo.MutationFunction<FinalizeCheckoutMutation, FinalizeCheckoutMutationVariables>;

/**
 * __useFinalizeCheckoutMutation__
 *
 * To run a mutation, you first call `useFinalizeCheckoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFinalizeCheckoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [finalizeCheckoutMutation, { data, loading, error }] = useFinalizeCheckoutMutation({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *   },
 * });
 */
export function useFinalizeCheckoutMutation(baseOptions?: Apollo.MutationHookOptions<FinalizeCheckoutMutation, FinalizeCheckoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<FinalizeCheckoutMutation, FinalizeCheckoutMutationVariables>(FinalizeCheckoutDocument, options);
      }
export type FinalizeCheckoutMutationHookResult = ReturnType<typeof useFinalizeCheckoutMutation>;
export type FinalizeCheckoutMutationResult = Apollo.MutationResult<FinalizeCheckoutMutation>;
export type FinalizeCheckoutMutationOptions = Apollo.BaseMutationOptions<FinalizeCheckoutMutation, FinalizeCheckoutMutationVariables>;
export const DefaultPaymentMethodDocument = gql`
    mutation DefaultPaymentMethod($id: String!) {
  defaultPaymentMethod(id: $id)
}
    `;
export type DefaultPaymentMethodMutationFn = Apollo.MutationFunction<DefaultPaymentMethodMutation, DefaultPaymentMethodMutationVariables>;

/**
 * __useDefaultPaymentMethodMutation__
 *
 * To run a mutation, you first call `useDefaultPaymentMethodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDefaultPaymentMethodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [defaultPaymentMethodMutation, { data, loading, error }] = useDefaultPaymentMethodMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDefaultPaymentMethodMutation(baseOptions?: Apollo.MutationHookOptions<DefaultPaymentMethodMutation, DefaultPaymentMethodMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DefaultPaymentMethodMutation, DefaultPaymentMethodMutationVariables>(DefaultPaymentMethodDocument, options);
      }
export type DefaultPaymentMethodMutationHookResult = ReturnType<typeof useDefaultPaymentMethodMutation>;
export type DefaultPaymentMethodMutationResult = Apollo.MutationResult<DefaultPaymentMethodMutation>;
export type DefaultPaymentMethodMutationOptions = Apollo.BaseMutationOptions<DefaultPaymentMethodMutation, DefaultPaymentMethodMutationVariables>;
export const DeletePaymentMethodDocument = gql`
    mutation DeletePaymentMethod($id: ID!) {
  deletePaymentMethod(id: $id) {
    ...PaymentMethod
  }
}
    ${PaymentMethodFragmentDoc}`;
export type DeletePaymentMethodMutationFn = Apollo.MutationFunction<DeletePaymentMethodMutation, DeletePaymentMethodMutationVariables>;

/**
 * __useDeletePaymentMethodMutation__
 *
 * To run a mutation, you first call `useDeletePaymentMethodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePaymentMethodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePaymentMethodMutation, { data, loading, error }] = useDeletePaymentMethodMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeletePaymentMethodMutation(baseOptions?: Apollo.MutationHookOptions<DeletePaymentMethodMutation, DeletePaymentMethodMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePaymentMethodMutation, DeletePaymentMethodMutationVariables>(DeletePaymentMethodDocument, options);
      }
export type DeletePaymentMethodMutationHookResult = ReturnType<typeof useDeletePaymentMethodMutation>;
export type DeletePaymentMethodMutationResult = Apollo.MutationResult<DeletePaymentMethodMutation>;
export type DeletePaymentMethodMutationOptions = Apollo.BaseMutationOptions<DeletePaymentMethodMutation, DeletePaymentMethodMutationVariables>;
export const InvoicesDocument = gql`
    query Invoices {
  invoices(first: 500) {
    edges {
      node {
        ...Invoice
      }
    }
  }
}
    ${InvoiceFragmentDoc}`;

/**
 * __useInvoicesQuery__
 *
 * To run a query within a React component, call `useInvoicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInvoicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInvoicesQuery({
 *   variables: {
 *   },
 * });
 */
export function useInvoicesQuery(baseOptions?: Apollo.QueryHookOptions<InvoicesQuery, InvoicesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, options);
      }
export function useInvoicesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InvoicesQuery, InvoicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, options);
        }
export function useInvoicesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<InvoicesQuery, InvoicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, options);
        }
export type InvoicesQueryHookResult = ReturnType<typeof useInvoicesQuery>;
export type InvoicesLazyQueryHookResult = ReturnType<typeof useInvoicesLazyQuery>;
export type InvoicesSuspenseQueryHookResult = ReturnType<typeof useInvoicesSuspenseQuery>;
export type InvoicesQueryResult = Apollo.QueryResult<InvoicesQuery, InvoicesQueryVariables>;
export const ConsoleInstanceDocument = gql`
    query ConsoleInstance($id: ID!) {
  consoleInstance(id: $id) {
    ...ConsoleInstance
  }
}
    ${ConsoleInstanceFragmentDoc}`;

/**
 * __useConsoleInstanceQuery__
 *
 * To run a query within a React component, call `useConsoleInstanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useConsoleInstanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConsoleInstanceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useConsoleInstanceQuery(baseOptions: Apollo.QueryHookOptions<ConsoleInstanceQuery, ConsoleInstanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConsoleInstanceQuery, ConsoleInstanceQueryVariables>(ConsoleInstanceDocument, options);
      }
export function useConsoleInstanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConsoleInstanceQuery, ConsoleInstanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConsoleInstanceQuery, ConsoleInstanceQueryVariables>(ConsoleInstanceDocument, options);
        }
export function useConsoleInstanceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ConsoleInstanceQuery, ConsoleInstanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ConsoleInstanceQuery, ConsoleInstanceQueryVariables>(ConsoleInstanceDocument, options);
        }
export type ConsoleInstanceQueryHookResult = ReturnType<typeof useConsoleInstanceQuery>;
export type ConsoleInstanceLazyQueryHookResult = ReturnType<typeof useConsoleInstanceLazyQuery>;
export type ConsoleInstanceSuspenseQueryHookResult = ReturnType<typeof useConsoleInstanceSuspenseQuery>;
export type ConsoleInstanceQueryResult = Apollo.QueryResult<ConsoleInstanceQuery, ConsoleInstanceQueryVariables>;
export const ConsoleInstancesDocument = gql`
    query ConsoleInstances($after: String, $first: Int = 100, $before: String, $last: Int) {
  consoleInstances(after: $after, first: $first, before: $before, last: $last) {
    edges {
      node {
        ...ConsoleInstance
      }
    }
    pageInfo {
      ...PageInfo
    }
  }
}
    ${ConsoleInstanceFragmentDoc}
${PageInfoFragmentDoc}`;

/**
 * __useConsoleInstancesQuery__
 *
 * To run a query within a React component, call `useConsoleInstancesQuery` and pass it any options that fit your needs.
 * When your component renders, `useConsoleInstancesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConsoleInstancesQuery({
 *   variables: {
 *      after: // value for 'after'
 *      first: // value for 'first'
 *      before: // value for 'before'
 *      last: // value for 'last'
 *   },
 * });
 */
export function useConsoleInstancesQuery(baseOptions?: Apollo.QueryHookOptions<ConsoleInstancesQuery, ConsoleInstancesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConsoleInstancesQuery, ConsoleInstancesQueryVariables>(ConsoleInstancesDocument, options);
      }
export function useConsoleInstancesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConsoleInstancesQuery, ConsoleInstancesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConsoleInstancesQuery, ConsoleInstancesQueryVariables>(ConsoleInstancesDocument, options);
        }
export function useConsoleInstancesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ConsoleInstancesQuery, ConsoleInstancesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ConsoleInstancesQuery, ConsoleInstancesQueryVariables>(ConsoleInstancesDocument, options);
        }
export type ConsoleInstancesQueryHookResult = ReturnType<typeof useConsoleInstancesQuery>;
export type ConsoleInstancesLazyQueryHookResult = ReturnType<typeof useConsoleInstancesLazyQuery>;
export type ConsoleInstancesSuspenseQueryHookResult = ReturnType<typeof useConsoleInstancesSuspenseQuery>;
export type ConsoleInstancesQueryResult = Apollo.QueryResult<ConsoleInstancesQuery, ConsoleInstancesQueryVariables>;
export const CreateConsoleInstanceDocument = gql`
    mutation CreateConsoleInstance($attributes: ConsoleInstanceAttributes!) {
  createConsoleInstance(attributes: $attributes) {
    ...ConsoleInstance
  }
}
    ${ConsoleInstanceFragmentDoc}`;
export type CreateConsoleInstanceMutationFn = Apollo.MutationFunction<CreateConsoleInstanceMutation, CreateConsoleInstanceMutationVariables>;

/**
 * __useCreateConsoleInstanceMutation__
 *
 * To run a mutation, you first call `useCreateConsoleInstanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateConsoleInstanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createConsoleInstanceMutation, { data, loading, error }] = useCreateConsoleInstanceMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateConsoleInstanceMutation(baseOptions?: Apollo.MutationHookOptions<CreateConsoleInstanceMutation, CreateConsoleInstanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateConsoleInstanceMutation, CreateConsoleInstanceMutationVariables>(CreateConsoleInstanceDocument, options);
      }
export type CreateConsoleInstanceMutationHookResult = ReturnType<typeof useCreateConsoleInstanceMutation>;
export type CreateConsoleInstanceMutationResult = Apollo.MutationResult<CreateConsoleInstanceMutation>;
export type CreateConsoleInstanceMutationOptions = Apollo.BaseMutationOptions<CreateConsoleInstanceMutation, CreateConsoleInstanceMutationVariables>;
export const UpdateConsoleInstanceDocument = gql`
    mutation UpdateConsoleInstance($id: ID!, $attributes: ConsoleInstanceUpdateAttributes!) {
  updateConsoleInstance(id: $id, attributes: $attributes) {
    ...ConsoleInstance
  }
}
    ${ConsoleInstanceFragmentDoc}`;
export type UpdateConsoleInstanceMutationFn = Apollo.MutationFunction<UpdateConsoleInstanceMutation, UpdateConsoleInstanceMutationVariables>;

/**
 * __useUpdateConsoleInstanceMutation__
 *
 * To run a mutation, you first call `useUpdateConsoleInstanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateConsoleInstanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateConsoleInstanceMutation, { data, loading, error }] = useUpdateConsoleInstanceMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateConsoleInstanceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateConsoleInstanceMutation, UpdateConsoleInstanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateConsoleInstanceMutation, UpdateConsoleInstanceMutationVariables>(UpdateConsoleInstanceDocument, options);
      }
export type UpdateConsoleInstanceMutationHookResult = ReturnType<typeof useUpdateConsoleInstanceMutation>;
export type UpdateConsoleInstanceMutationResult = Apollo.MutationResult<UpdateConsoleInstanceMutation>;
export type UpdateConsoleInstanceMutationOptions = Apollo.BaseMutationOptions<UpdateConsoleInstanceMutation, UpdateConsoleInstanceMutationVariables>;
export const DeleteConsoleInstanceDocument = gql`
    mutation DeleteConsoleInstance($id: ID!) {
  deleteConsoleInstance(id: $id) {
    ...ConsoleInstance
  }
}
    ${ConsoleInstanceFragmentDoc}`;
export type DeleteConsoleInstanceMutationFn = Apollo.MutationFunction<DeleteConsoleInstanceMutation, DeleteConsoleInstanceMutationVariables>;

/**
 * __useDeleteConsoleInstanceMutation__
 *
 * To run a mutation, you first call `useDeleteConsoleInstanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteConsoleInstanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteConsoleInstanceMutation, { data, loading, error }] = useDeleteConsoleInstanceMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteConsoleInstanceMutation(baseOptions?: Apollo.MutationHookOptions<DeleteConsoleInstanceMutation, DeleteConsoleInstanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteConsoleInstanceMutation, DeleteConsoleInstanceMutationVariables>(DeleteConsoleInstanceDocument, options);
      }
export type DeleteConsoleInstanceMutationHookResult = ReturnType<typeof useDeleteConsoleInstanceMutation>;
export type DeleteConsoleInstanceMutationResult = Apollo.MutationResult<DeleteConsoleInstanceMutation>;
export type DeleteConsoleInstanceMutationOptions = Apollo.BaseMutationOptions<DeleteConsoleInstanceMutation, DeleteConsoleInstanceMutationVariables>;
export const UpdateOidcProviderDocument = gql`
    mutation UpdateOidcProvider($id: ID!, $attributes: OidcAttributes!) {
  updateOidcProvider(installationId: $id, attributes: $attributes) {
    ...OIDCProvider
  }
}
    ${OidcProviderFragmentDoc}`;
export type UpdateOidcProviderMutationFn = Apollo.MutationFunction<UpdateOidcProviderMutation, UpdateOidcProviderMutationVariables>;

/**
 * __useUpdateOidcProviderMutation__
 *
 * To run a mutation, you first call `useUpdateOidcProviderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOidcProviderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOidcProviderMutation, { data, loading, error }] = useUpdateOidcProviderMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateOidcProviderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOidcProviderMutation, UpdateOidcProviderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOidcProviderMutation, UpdateOidcProviderMutationVariables>(UpdateOidcProviderDocument, options);
      }
export type UpdateOidcProviderMutationHookResult = ReturnType<typeof useUpdateOidcProviderMutation>;
export type UpdateOidcProviderMutationResult = Apollo.MutationResult<UpdateOidcProviderMutation>;
export type UpdateOidcProviderMutationOptions = Apollo.BaseMutationOptions<UpdateOidcProviderMutation, UpdateOidcProviderMutationVariables>;
export const GetRecipeDocument = gql`
    query GetRecipe($repo: String, $name: String) {
  recipe(repo: $repo, name: $name) {
    ...Recipe
    recipeDependencies {
      ...Recipe
    }
  }
}
    ${RecipeFragmentDoc}`;

/**
 * __useGetRecipeQuery__
 *
 * To run a query within a React component, call `useGetRecipeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecipeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecipeQuery({
 *   variables: {
 *      repo: // value for 'repo'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGetRecipeQuery(baseOptions?: Apollo.QueryHookOptions<GetRecipeQuery, GetRecipeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecipeQuery, GetRecipeQueryVariables>(GetRecipeDocument, options);
      }
export function useGetRecipeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecipeQuery, GetRecipeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecipeQuery, GetRecipeQueryVariables>(GetRecipeDocument, options);
        }
export function useGetRecipeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecipeQuery, GetRecipeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecipeQuery, GetRecipeQueryVariables>(GetRecipeDocument, options);
        }
export type GetRecipeQueryHookResult = ReturnType<typeof useGetRecipeQuery>;
export type GetRecipeLazyQueryHookResult = ReturnType<typeof useGetRecipeLazyQuery>;
export type GetRecipeSuspenseQueryHookResult = ReturnType<typeof useGetRecipeSuspenseQuery>;
export type GetRecipeQueryResult = Apollo.QueryResult<GetRecipeQuery, GetRecipeQueryVariables>;
export const ListRecipesDocument = gql`
    query ListRecipes($repositoryName: String, $provider: Provider) {
  recipes(repositoryName: $repositoryName, provider: $provider, first: 500) {
    edges {
      node {
        ...Recipe
      }
    }
  }
}
    ${RecipeFragmentDoc}`;

/**
 * __useListRecipesQuery__
 *
 * To run a query within a React component, call `useListRecipesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListRecipesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListRecipesQuery({
 *   variables: {
 *      repositoryName: // value for 'repositoryName'
 *      provider: // value for 'provider'
 *   },
 * });
 */
export function useListRecipesQuery(baseOptions?: Apollo.QueryHookOptions<ListRecipesQuery, ListRecipesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListRecipesQuery, ListRecipesQueryVariables>(ListRecipesDocument, options);
      }
export function useListRecipesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListRecipesQuery, ListRecipesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListRecipesQuery, ListRecipesQueryVariables>(ListRecipesDocument, options);
        }
export function useListRecipesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ListRecipesQuery, ListRecipesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListRecipesQuery, ListRecipesQueryVariables>(ListRecipesDocument, options);
        }
export type ListRecipesQueryHookResult = ReturnType<typeof useListRecipesQuery>;
export type ListRecipesLazyQueryHookResult = ReturnType<typeof useListRecipesLazyQuery>;
export type ListRecipesSuspenseQueryHookResult = ReturnType<typeof useListRecipesSuspenseQuery>;
export type ListRecipesQueryResult = Apollo.QueryResult<ListRecipesQuery, ListRecipesQueryVariables>;
export const CreateRecipeDocument = gql`
    mutation CreateRecipe($name: String!, $attributes: RecipeAttributes!) {
  createRecipe(repositoryName: $name, attributes: $attributes) {
    id
  }
}
    `;
export type CreateRecipeMutationFn = Apollo.MutationFunction<CreateRecipeMutation, CreateRecipeMutationVariables>;

/**
 * __useCreateRecipeMutation__
 *
 * To run a mutation, you first call `useCreateRecipeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRecipeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRecipeMutation, { data, loading, error }] = useCreateRecipeMutation({
 *   variables: {
 *      name: // value for 'name'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateRecipeMutation(baseOptions?: Apollo.MutationHookOptions<CreateRecipeMutation, CreateRecipeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRecipeMutation, CreateRecipeMutationVariables>(CreateRecipeDocument, options);
      }
export type CreateRecipeMutationHookResult = ReturnType<typeof useCreateRecipeMutation>;
export type CreateRecipeMutationResult = Apollo.MutationResult<CreateRecipeMutation>;
export type CreateRecipeMutationOptions = Apollo.BaseMutationOptions<CreateRecipeMutation, CreateRecipeMutationVariables>;
export const InstallRecipeDocument = gql`
    mutation InstallRecipe($id: ID!) {
  installRecipe(recipeId: $id, context: "{}") {
    id
  }
}
    `;
export type InstallRecipeMutationFn = Apollo.MutationFunction<InstallRecipeMutation, InstallRecipeMutationVariables>;

/**
 * __useInstallRecipeMutation__
 *
 * To run a mutation, you first call `useInstallRecipeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInstallRecipeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [installRecipeMutation, { data, loading, error }] = useInstallRecipeMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useInstallRecipeMutation(baseOptions?: Apollo.MutationHookOptions<InstallRecipeMutation, InstallRecipeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InstallRecipeMutation, InstallRecipeMutationVariables>(InstallRecipeDocument, options);
      }
export type InstallRecipeMutationHookResult = ReturnType<typeof useInstallRecipeMutation>;
export type InstallRecipeMutationResult = Apollo.MutationResult<InstallRecipeMutation>;
export type InstallRecipeMutationOptions = Apollo.BaseMutationOptions<InstallRecipeMutation, InstallRecipeMutationVariables>;
export const CreateStackDocument = gql`
    mutation CreateStack($attributes: StackAttributes!) {
  createStack(attributes: $attributes) {
    id
  }
}
    `;
export type CreateStackMutationFn = Apollo.MutationFunction<CreateStackMutation, CreateStackMutationVariables>;

/**
 * __useCreateStackMutation__
 *
 * To run a mutation, you first call `useCreateStackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateStackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createStackMutation, { data, loading, error }] = useCreateStackMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateStackMutation(baseOptions?: Apollo.MutationHookOptions<CreateStackMutation, CreateStackMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateStackMutation, CreateStackMutationVariables>(CreateStackDocument, options);
      }
export type CreateStackMutationHookResult = ReturnType<typeof useCreateStackMutation>;
export type CreateStackMutationResult = Apollo.MutationResult<CreateStackMutation>;
export type CreateStackMutationOptions = Apollo.BaseMutationOptions<CreateStackMutation, CreateStackMutationVariables>;
export const GetStackDocument = gql`
    query GetStack($name: String!, $provider: Provider!) {
  stack(name: $name, provider: $provider) {
    ...Stack
  }
}
    ${StackFragmentDoc}`;

/**
 * __useGetStackQuery__
 *
 * To run a query within a React component, call `useGetStackQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStackQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStackQuery({
 *   variables: {
 *      name: // value for 'name'
 *      provider: // value for 'provider'
 *   },
 * });
 */
export function useGetStackQuery(baseOptions: Apollo.QueryHookOptions<GetStackQuery, GetStackQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStackQuery, GetStackQueryVariables>(GetStackDocument, options);
      }
export function useGetStackLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStackQuery, GetStackQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStackQuery, GetStackQueryVariables>(GetStackDocument, options);
        }
export function useGetStackSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetStackQuery, GetStackQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStackQuery, GetStackQueryVariables>(GetStackDocument, options);
        }
export type GetStackQueryHookResult = ReturnType<typeof useGetStackQuery>;
export type GetStackLazyQueryHookResult = ReturnType<typeof useGetStackLazyQuery>;
export type GetStackSuspenseQueryHookResult = ReturnType<typeof useGetStackSuspenseQuery>;
export type GetStackQueryResult = Apollo.QueryResult<GetStackQuery, GetStackQueryVariables>;
export const ListStacksDocument = gql`
    query ListStacks($first: Int = 100, $featured: Boolean, $cursor: String) {
  stacks(first: $first, after: $cursor, featured: $featured) {
    edges {
      node {
        ...Stack
      }
    }
  }
}
    ${StackFragmentDoc}`;

/**
 * __useListStacksQuery__
 *
 * To run a query within a React component, call `useListStacksQuery` and pass it any options that fit your needs.
 * When your component renders, `useListStacksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListStacksQuery({
 *   variables: {
 *      first: // value for 'first'
 *      featured: // value for 'featured'
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useListStacksQuery(baseOptions?: Apollo.QueryHookOptions<ListStacksQuery, ListStacksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListStacksQuery, ListStacksQueryVariables>(ListStacksDocument, options);
      }
export function useListStacksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListStacksQuery, ListStacksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListStacksQuery, ListStacksQueryVariables>(ListStacksDocument, options);
        }
export function useListStacksSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ListStacksQuery, ListStacksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListStacksQuery, ListStacksQueryVariables>(ListStacksDocument, options);
        }
export type ListStacksQueryHookResult = ReturnType<typeof useListStacksQuery>;
export type ListStacksLazyQueryHookResult = ReturnType<typeof useListStacksLazyQuery>;
export type ListStacksSuspenseQueryHookResult = ReturnType<typeof useListStacksSuspenseQuery>;
export type ListStacksQueryResult = Apollo.QueryResult<ListStacksQuery, ListStacksQueryVariables>;
export const RepositoryDocument = gql`
    query Repository($id: ID, $name: String) {
  repository(id: $id, name: $name) {
    ...Repo
    editable
    publicKey
    secrets
    artifacts {
      ...Artifact
    }
    installation {
      ...Installation
      oidcProvider {
        ...OIDCProvider
      }
    }
    upgradeChannels
    tags {
      tag
    }
    readme
    mainBranch
    gitUrl
    homepage
    license {
      name
      url
    }
    documentation
    community {
      discord
      slack
      homepage
      gitUrl
      twitter
    }
  }
}
    ${RepoFragmentDoc}
${ArtifactFragmentDoc}
${InstallationFragmentDoc}
${OidcProviderFragmentDoc}`;

/**
 * __useRepositoryQuery__
 *
 * To run a query within a React component, call `useRepositoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useRepositoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRepositoryQuery({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useRepositoryQuery(baseOptions?: Apollo.QueryHookOptions<RepositoryQuery, RepositoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RepositoryQuery, RepositoryQueryVariables>(RepositoryDocument, options);
      }
export function useRepositoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RepositoryQuery, RepositoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RepositoryQuery, RepositoryQueryVariables>(RepositoryDocument, options);
        }
export function useRepositorySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RepositoryQuery, RepositoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RepositoryQuery, RepositoryQueryVariables>(RepositoryDocument, options);
        }
export type RepositoryQueryHookResult = ReturnType<typeof useRepositoryQuery>;
export type RepositoryLazyQueryHookResult = ReturnType<typeof useRepositoryLazyQuery>;
export type RepositorySuspenseQueryHookResult = ReturnType<typeof useRepositorySuspenseQuery>;
export type RepositoryQueryResult = Apollo.QueryResult<RepositoryQuery, RepositoryQueryVariables>;
export const CreateResourceDefinitionDocument = gql`
    mutation CreateResourceDefinition($name: String!, $input: ResourceDefinitionAttributes!) {
  updateRepository(
    repositoryName: $name
    attributes: {integrationResourceDefinition: $input}
  ) {
    id
  }
}
    `;
export type CreateResourceDefinitionMutationFn = Apollo.MutationFunction<CreateResourceDefinitionMutation, CreateResourceDefinitionMutationVariables>;

/**
 * __useCreateResourceDefinitionMutation__
 *
 * To run a mutation, you first call `useCreateResourceDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateResourceDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createResourceDefinitionMutation, { data, loading, error }] = useCreateResourceDefinitionMutation({
 *   variables: {
 *      name: // value for 'name'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateResourceDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<CreateResourceDefinitionMutation, CreateResourceDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateResourceDefinitionMutation, CreateResourceDefinitionMutationVariables>(CreateResourceDefinitionDocument, options);
      }
export type CreateResourceDefinitionMutationHookResult = ReturnType<typeof useCreateResourceDefinitionMutation>;
export type CreateResourceDefinitionMutationResult = Apollo.MutationResult<CreateResourceDefinitionMutation>;
export type CreateResourceDefinitionMutationOptions = Apollo.BaseMutationOptions<CreateResourceDefinitionMutation, CreateResourceDefinitionMutationVariables>;
export const CreateIntegrationDocument = gql`
    mutation CreateIntegration($name: String!, $attrs: IntegrationAttributes!) {
  createIntegration(repositoryName: $name, attributes: $attrs) {
    id
  }
}
    `;
export type CreateIntegrationMutationFn = Apollo.MutationFunction<CreateIntegrationMutation, CreateIntegrationMutationVariables>;

/**
 * __useCreateIntegrationMutation__
 *
 * To run a mutation, you first call `useCreateIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createIntegrationMutation, { data, loading, error }] = useCreateIntegrationMutation({
 *   variables: {
 *      name: // value for 'name'
 *      attrs: // value for 'attrs'
 *   },
 * });
 */
export function useCreateIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<CreateIntegrationMutation, CreateIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateIntegrationMutation, CreateIntegrationMutationVariables>(CreateIntegrationDocument, options);
      }
export type CreateIntegrationMutationHookResult = ReturnType<typeof useCreateIntegrationMutation>;
export type CreateIntegrationMutationResult = Apollo.MutationResult<CreateIntegrationMutation>;
export type CreateIntegrationMutationOptions = Apollo.BaseMutationOptions<CreateIntegrationMutation, CreateIntegrationMutationVariables>;
export const UpdateRepositoryDocument = gql`
    mutation UpdateRepository($name: String!, $attrs: RepositoryAttributes!) {
  updateRepository(repositoryName: $name, attributes: $attrs) {
    id
  }
}
    `;
export type UpdateRepositoryMutationFn = Apollo.MutationFunction<UpdateRepositoryMutation, UpdateRepositoryMutationVariables>;

/**
 * __useUpdateRepositoryMutation__
 *
 * To run a mutation, you first call `useUpdateRepositoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRepositoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRepositoryMutation, { data, loading, error }] = useUpdateRepositoryMutation({
 *   variables: {
 *      name: // value for 'name'
 *      attrs: // value for 'attrs'
 *   },
 * });
 */
export function useUpdateRepositoryMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRepositoryMutation, UpdateRepositoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRepositoryMutation, UpdateRepositoryMutationVariables>(UpdateRepositoryDocument, options);
      }
export type UpdateRepositoryMutationHookResult = ReturnType<typeof useUpdateRepositoryMutation>;
export type UpdateRepositoryMutationResult = Apollo.MutationResult<UpdateRepositoryMutation>;
export type UpdateRepositoryMutationOptions = Apollo.BaseMutationOptions<UpdateRepositoryMutation, UpdateRepositoryMutationVariables>;
export const CreateRepositoryDocument = gql`
    mutation CreateRepository($name: String!, $publisher: String!, $attributes: RepositoryAttributes!) {
  upsertRepository(name: $name, publisher: $publisher, attributes: $attributes) {
    id
  }
}
    `;
export type CreateRepositoryMutationFn = Apollo.MutationFunction<CreateRepositoryMutation, CreateRepositoryMutationVariables>;

/**
 * __useCreateRepositoryMutation__
 *
 * To run a mutation, you first call `useCreateRepositoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRepositoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRepositoryMutation, { data, loading, error }] = useCreateRepositoryMutation({
 *   variables: {
 *      name: // value for 'name'
 *      publisher: // value for 'publisher'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateRepositoryMutation(baseOptions?: Apollo.MutationHookOptions<CreateRepositoryMutation, CreateRepositoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRepositoryMutation, CreateRepositoryMutationVariables>(CreateRepositoryDocument, options);
      }
export type CreateRepositoryMutationHookResult = ReturnType<typeof useCreateRepositoryMutation>;
export type CreateRepositoryMutationResult = Apollo.MutationResult<CreateRepositoryMutation>;
export type CreateRepositoryMutationOptions = Apollo.BaseMutationOptions<CreateRepositoryMutation, CreateRepositoryMutationVariables>;
export const AcquireLockDocument = gql`
    mutation AcquireLock($name: String!) {
  acquireLock(repository: $name) {
    ...ApplyLock
  }
}
    ${ApplyLockFragmentDoc}`;
export type AcquireLockMutationFn = Apollo.MutationFunction<AcquireLockMutation, AcquireLockMutationVariables>;

/**
 * __useAcquireLockMutation__
 *
 * To run a mutation, you first call `useAcquireLockMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcquireLockMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acquireLockMutation, { data, loading, error }] = useAcquireLockMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useAcquireLockMutation(baseOptions?: Apollo.MutationHookOptions<AcquireLockMutation, AcquireLockMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcquireLockMutation, AcquireLockMutationVariables>(AcquireLockDocument, options);
      }
export type AcquireLockMutationHookResult = ReturnType<typeof useAcquireLockMutation>;
export type AcquireLockMutationResult = Apollo.MutationResult<AcquireLockMutation>;
export type AcquireLockMutationOptions = Apollo.BaseMutationOptions<AcquireLockMutation, AcquireLockMutationVariables>;
export const ReleaseLockDocument = gql`
    mutation ReleaseLock($name: String!, $attrs: LockAttributes!) {
  releaseLock(repository: $name, attributes: $attrs) {
    ...ApplyLock
  }
}
    ${ApplyLockFragmentDoc}`;
export type ReleaseLockMutationFn = Apollo.MutationFunction<ReleaseLockMutation, ReleaseLockMutationVariables>;

/**
 * __useReleaseLockMutation__
 *
 * To run a mutation, you first call `useReleaseLockMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReleaseLockMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [releaseLockMutation, { data, loading, error }] = useReleaseLockMutation({
 *   variables: {
 *      name: // value for 'name'
 *      attrs: // value for 'attrs'
 *   },
 * });
 */
export function useReleaseLockMutation(baseOptions?: Apollo.MutationHookOptions<ReleaseLockMutation, ReleaseLockMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReleaseLockMutation, ReleaseLockMutationVariables>(ReleaseLockDocument, options);
      }
export type ReleaseLockMutationHookResult = ReturnType<typeof useReleaseLockMutation>;
export type ReleaseLockMutationResult = Apollo.MutationResult<ReleaseLockMutation>;
export type ReleaseLockMutationOptions = Apollo.BaseMutationOptions<ReleaseLockMutation, ReleaseLockMutationVariables>;
export const UnlockRepositoryDocument = gql`
    mutation UnlockRepository($name: String!) {
  unlockRepository(name: $name)
}
    `;
export type UnlockRepositoryMutationFn = Apollo.MutationFunction<UnlockRepositoryMutation, UnlockRepositoryMutationVariables>;

/**
 * __useUnlockRepositoryMutation__
 *
 * To run a mutation, you first call `useUnlockRepositoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnlockRepositoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unlockRepositoryMutation, { data, loading, error }] = useUnlockRepositoryMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUnlockRepositoryMutation(baseOptions?: Apollo.MutationHookOptions<UnlockRepositoryMutation, UnlockRepositoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnlockRepositoryMutation, UnlockRepositoryMutationVariables>(UnlockRepositoryDocument, options);
      }
export type UnlockRepositoryMutationHookResult = ReturnType<typeof useUnlockRepositoryMutation>;
export type UnlockRepositoryMutationResult = Apollo.MutationResult<UnlockRepositoryMutation>;
export type UnlockRepositoryMutationOptions = Apollo.BaseMutationOptions<UnlockRepositoryMutation, UnlockRepositoryMutationVariables>;
export const RepositoriesDocument = gql`
    query Repositories($cursor: String, $installed: Boolean) {
  repositories(after: $cursor, first: 200, installed: $installed) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...Repository
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${RepositoryFragmentDoc}`;

/**
 * __useRepositoriesQuery__
 *
 * To run a query within a React component, call `useRepositoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRepositoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRepositoriesQuery({
 *   variables: {
 *      cursor: // value for 'cursor'
 *      installed: // value for 'installed'
 *   },
 * });
 */
export function useRepositoriesQuery(baseOptions?: Apollo.QueryHookOptions<RepositoriesQuery, RepositoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RepositoriesQuery, RepositoriesQueryVariables>(RepositoriesDocument, options);
      }
export function useRepositoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RepositoriesQuery, RepositoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RepositoriesQuery, RepositoriesQueryVariables>(RepositoriesDocument, options);
        }
export function useRepositoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RepositoriesQuery, RepositoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RepositoriesQuery, RepositoriesQueryVariables>(RepositoriesDocument, options);
        }
export type RepositoriesQueryHookResult = ReturnType<typeof useRepositoriesQuery>;
export type RepositoriesLazyQueryHookResult = ReturnType<typeof useRepositoriesLazyQuery>;
export type RepositoriesSuspenseQueryHookResult = ReturnType<typeof useRepositoriesSuspenseQuery>;
export type RepositoriesQueryResult = Apollo.QueryResult<RepositoriesQuery, RepositoriesQueryVariables>;
export const MarketplaceRepositoriesDocument = gql`
    query MarketplaceRepositories($publisherId: ID, $tag: String, $cursor: String) {
  repositories(publisherId: $publisherId, tag: $tag, after: $cursor, first: 200) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...MarketplaceRepository
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${MarketplaceRepositoryFragmentDoc}`;

/**
 * __useMarketplaceRepositoriesQuery__
 *
 * To run a query within a React component, call `useMarketplaceRepositoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketplaceRepositoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketplaceRepositoriesQuery({
 *   variables: {
 *      publisherId: // value for 'publisherId'
 *      tag: // value for 'tag'
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useMarketplaceRepositoriesQuery(baseOptions?: Apollo.QueryHookOptions<MarketplaceRepositoriesQuery, MarketplaceRepositoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketplaceRepositoriesQuery, MarketplaceRepositoriesQueryVariables>(MarketplaceRepositoriesDocument, options);
      }
export function useMarketplaceRepositoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketplaceRepositoriesQuery, MarketplaceRepositoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketplaceRepositoriesQuery, MarketplaceRepositoriesQueryVariables>(MarketplaceRepositoriesDocument, options);
        }
export function useMarketplaceRepositoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MarketplaceRepositoriesQuery, MarketplaceRepositoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MarketplaceRepositoriesQuery, MarketplaceRepositoriesQueryVariables>(MarketplaceRepositoriesDocument, options);
        }
export type MarketplaceRepositoriesQueryHookResult = ReturnType<typeof useMarketplaceRepositoriesQuery>;
export type MarketplaceRepositoriesLazyQueryHookResult = ReturnType<typeof useMarketplaceRepositoriesLazyQuery>;
export type MarketplaceRepositoriesSuspenseQueryHookResult = ReturnType<typeof useMarketplaceRepositoriesSuspenseQuery>;
export type MarketplaceRepositoriesQueryResult = Apollo.QueryResult<MarketplaceRepositoriesQuery, MarketplaceRepositoriesQueryVariables>;
export const ScaffoldsDocument = gql`
    query Scaffolds($app: String!, $pub: String!, $cat: Category!, $ing: Boolean, $pg: Boolean) {
  scaffold(
    application: $app
    publisher: $pub
    category: $cat
    ingress: $ing
    postgres: $pg
  ) {
    path
    content
  }
}
    `;

/**
 * __useScaffoldsQuery__
 *
 * To run a query within a React component, call `useScaffoldsQuery` and pass it any options that fit your needs.
 * When your component renders, `useScaffoldsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useScaffoldsQuery({
 *   variables: {
 *      app: // value for 'app'
 *      pub: // value for 'pub'
 *      cat: // value for 'cat'
 *      ing: // value for 'ing'
 *      pg: // value for 'pg'
 *   },
 * });
 */
export function useScaffoldsQuery(baseOptions: Apollo.QueryHookOptions<ScaffoldsQuery, ScaffoldsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ScaffoldsQuery, ScaffoldsQueryVariables>(ScaffoldsDocument, options);
      }
export function useScaffoldsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ScaffoldsQuery, ScaffoldsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ScaffoldsQuery, ScaffoldsQueryVariables>(ScaffoldsDocument, options);
        }
export function useScaffoldsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ScaffoldsQuery, ScaffoldsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ScaffoldsQuery, ScaffoldsQueryVariables>(ScaffoldsDocument, options);
        }
export type ScaffoldsQueryHookResult = ReturnType<typeof useScaffoldsQuery>;
export type ScaffoldsLazyQueryHookResult = ReturnType<typeof useScaffoldsLazyQuery>;
export type ScaffoldsSuspenseQueryHookResult = ReturnType<typeof useScaffoldsSuspenseQuery>;
export type ScaffoldsQueryResult = Apollo.QueryResult<ScaffoldsQuery, ScaffoldsQueryVariables>;
export const DeleteRepositoryDocument = gql`
    mutation DeleteRepository($id: ID!) {
  deleteRepository(repositoryId: $id) {
    id
  }
}
    `;
export type DeleteRepositoryMutationFn = Apollo.MutationFunction<DeleteRepositoryMutation, DeleteRepositoryMutationVariables>;

/**
 * __useDeleteRepositoryMutation__
 *
 * To run a mutation, you first call `useDeleteRepositoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRepositoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRepositoryMutation, { data, loading, error }] = useDeleteRepositoryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteRepositoryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRepositoryMutation, DeleteRepositoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRepositoryMutation, DeleteRepositoryMutationVariables>(DeleteRepositoryDocument, options);
      }
export type DeleteRepositoryMutationHookResult = ReturnType<typeof useDeleteRepositoryMutation>;
export type DeleteRepositoryMutationResult = Apollo.MutationResult<DeleteRepositoryMutation>;
export type DeleteRepositoryMutationOptions = Apollo.BaseMutationOptions<DeleteRepositoryMutation, DeleteRepositoryMutationVariables>;
export const ReleaseDocument = gql`
    mutation Release($id: ID!, $tags: [String!]) {
  release(repositoryId: $id, tags: $tags)
}
    `;
export type ReleaseMutationFn = Apollo.MutationFunction<ReleaseMutation, ReleaseMutationVariables>;

/**
 * __useReleaseMutation__
 *
 * To run a mutation, you first call `useReleaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReleaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [releaseMutation, { data, loading, error }] = useReleaseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useReleaseMutation(baseOptions?: Apollo.MutationHookOptions<ReleaseMutation, ReleaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReleaseMutation, ReleaseMutationVariables>(ReleaseDocument, options);
      }
export type ReleaseMutationHookResult = ReturnType<typeof useReleaseMutation>;
export type ReleaseMutationResult = Apollo.MutationResult<ReleaseMutation>;
export type ReleaseMutationOptions = Apollo.BaseMutationOptions<ReleaseMutation, ReleaseMutationVariables>;
export const CreateRoleDocument = gql`
    mutation CreateRole($attributes: RoleAttributes!) {
  createRole(attributes: $attributes) {
    ...Role
  }
}
    ${RoleFragmentDoc}`;
export type CreateRoleMutationFn = Apollo.MutationFunction<CreateRoleMutation, CreateRoleMutationVariables>;

/**
 * __useCreateRoleMutation__
 *
 * To run a mutation, you first call `useCreateRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRoleMutation, { data, loading, error }] = useCreateRoleMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateRoleMutation(baseOptions?: Apollo.MutationHookOptions<CreateRoleMutation, CreateRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRoleMutation, CreateRoleMutationVariables>(CreateRoleDocument, options);
      }
export type CreateRoleMutationHookResult = ReturnType<typeof useCreateRoleMutation>;
export type CreateRoleMutationResult = Apollo.MutationResult<CreateRoleMutation>;
export type CreateRoleMutationOptions = Apollo.BaseMutationOptions<CreateRoleMutation, CreateRoleMutationVariables>;
export const UpdateRoleDocument = gql`
    mutation UpdateRole($id: ID!, $attributes: RoleAttributes!) {
  updateRole(id: $id, attributes: $attributes) {
    ...Role
  }
}
    ${RoleFragmentDoc}`;
export type UpdateRoleMutationFn = Apollo.MutationFunction<UpdateRoleMutation, UpdateRoleMutationVariables>;

/**
 * __useUpdateRoleMutation__
 *
 * To run a mutation, you first call `useUpdateRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRoleMutation, { data, loading, error }] = useUpdateRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRoleMutation, UpdateRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRoleMutation, UpdateRoleMutationVariables>(UpdateRoleDocument, options);
      }
export type UpdateRoleMutationHookResult = ReturnType<typeof useUpdateRoleMutation>;
export type UpdateRoleMutationResult = Apollo.MutationResult<UpdateRoleMutation>;
export type UpdateRoleMutationOptions = Apollo.BaseMutationOptions<UpdateRoleMutation, UpdateRoleMutationVariables>;
export const DeleteRoleDocument = gql`
    mutation DeleteRole($id: ID!) {
  deleteRole(id: $id) {
    ...Role
  }
}
    ${RoleFragmentDoc}`;
export type DeleteRoleMutationFn = Apollo.MutationFunction<DeleteRoleMutation, DeleteRoleMutationVariables>;

/**
 * __useDeleteRoleMutation__
 *
 * To run a mutation, you first call `useDeleteRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRoleMutation, { data, loading, error }] = useDeleteRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteRoleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRoleMutation, DeleteRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRoleMutation, DeleteRoleMutationVariables>(DeleteRoleDocument, options);
      }
export type DeleteRoleMutationHookResult = ReturnType<typeof useDeleteRoleMutation>;
export type DeleteRoleMutationResult = Apollo.MutationResult<DeleteRoleMutation>;
export type DeleteRoleMutationOptions = Apollo.BaseMutationOptions<DeleteRoleMutation, DeleteRoleMutationVariables>;
export const GetTfProvidersDocument = gql`
    query GetTfProviders {
  terraformProviders
}
    `;

/**
 * __useGetTfProvidersQuery__
 *
 * To run a query within a React component, call `useGetTfProvidersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTfProvidersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTfProvidersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTfProvidersQuery(baseOptions?: Apollo.QueryHookOptions<GetTfProvidersQuery, GetTfProvidersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTfProvidersQuery, GetTfProvidersQueryVariables>(GetTfProvidersDocument, options);
      }
export function useGetTfProvidersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTfProvidersQuery, GetTfProvidersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTfProvidersQuery, GetTfProvidersQueryVariables>(GetTfProvidersDocument, options);
        }
export function useGetTfProvidersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTfProvidersQuery, GetTfProvidersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTfProvidersQuery, GetTfProvidersQueryVariables>(GetTfProvidersDocument, options);
        }
export type GetTfProvidersQueryHookResult = ReturnType<typeof useGetTfProvidersQuery>;
export type GetTfProvidersLazyQueryHookResult = ReturnType<typeof useGetTfProvidersLazyQuery>;
export type GetTfProvidersSuspenseQueryHookResult = ReturnType<typeof useGetTfProvidersSuspenseQuery>;
export type GetTfProvidersQueryResult = Apollo.QueryResult<GetTfProvidersQuery, GetTfProvidersQueryVariables>;
export const GetTfProviderScaffoldDocument = gql`
    query GetTfProviderScaffold($name: Provider!, $vsn: String) {
  terraformProvider(name: $name, vsn: $vsn) {
    name
    content
  }
}
    `;

/**
 * __useGetTfProviderScaffoldQuery__
 *
 * To run a query within a React component, call `useGetTfProviderScaffoldQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTfProviderScaffoldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTfProviderScaffoldQuery({
 *   variables: {
 *      name: // value for 'name'
 *      vsn: // value for 'vsn'
 *   },
 * });
 */
export function useGetTfProviderScaffoldQuery(baseOptions: Apollo.QueryHookOptions<GetTfProviderScaffoldQuery, GetTfProviderScaffoldQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTfProviderScaffoldQuery, GetTfProviderScaffoldQueryVariables>(GetTfProviderScaffoldDocument, options);
      }
export function useGetTfProviderScaffoldLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTfProviderScaffoldQuery, GetTfProviderScaffoldQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTfProviderScaffoldQuery, GetTfProviderScaffoldQueryVariables>(GetTfProviderScaffoldDocument, options);
        }
export function useGetTfProviderScaffoldSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTfProviderScaffoldQuery, GetTfProviderScaffoldQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTfProviderScaffoldQuery, GetTfProviderScaffoldQueryVariables>(GetTfProviderScaffoldDocument, options);
        }
export type GetTfProviderScaffoldQueryHookResult = ReturnType<typeof useGetTfProviderScaffoldQuery>;
export type GetTfProviderScaffoldLazyQueryHookResult = ReturnType<typeof useGetTfProviderScaffoldLazyQuery>;
export type GetTfProviderScaffoldSuspenseQueryHookResult = ReturnType<typeof useGetTfProviderScaffoldSuspenseQuery>;
export type GetTfProviderScaffoldQueryResult = Apollo.QueryResult<GetTfProviderScaffoldQuery, GetTfProviderScaffoldQueryVariables>;
export const GetShellDocument = gql`
    query GetShell {
  shell {
    ...CloudShell
  }
}
    ${CloudShellFragmentDoc}`;

/**
 * __useGetShellQuery__
 *
 * To run a query within a React component, call `useGetShellQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetShellQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetShellQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetShellQuery(baseOptions?: Apollo.QueryHookOptions<GetShellQuery, GetShellQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetShellQuery, GetShellQueryVariables>(GetShellDocument, options);
      }
export function useGetShellLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetShellQuery, GetShellQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetShellQuery, GetShellQueryVariables>(GetShellDocument, options);
        }
export function useGetShellSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetShellQuery, GetShellQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetShellQuery, GetShellQueryVariables>(GetShellDocument, options);
        }
export type GetShellQueryHookResult = ReturnType<typeof useGetShellQuery>;
export type GetShellLazyQueryHookResult = ReturnType<typeof useGetShellLazyQuery>;
export type GetShellSuspenseQueryHookResult = ReturnType<typeof useGetShellSuspenseQuery>;
export type GetShellQueryResult = Apollo.QueryResult<GetShellQuery, GetShellQueryVariables>;
export const DeleteShellDocument = gql`
    mutation DeleteShell {
  deleteShell {
    ...CloudShell
  }
}
    ${CloudShellFragmentDoc}`;
export type DeleteShellMutationFn = Apollo.MutationFunction<DeleteShellMutation, DeleteShellMutationVariables>;

/**
 * __useDeleteShellMutation__
 *
 * To run a mutation, you first call `useDeleteShellMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShellMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShellMutation, { data, loading, error }] = useDeleteShellMutation({
 *   variables: {
 *   },
 * });
 */
export function useDeleteShellMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShellMutation, DeleteShellMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShellMutation, DeleteShellMutationVariables>(DeleteShellDocument, options);
      }
export type DeleteShellMutationHookResult = ReturnType<typeof useDeleteShellMutation>;
export type DeleteShellMutationResult = Apollo.MutationResult<DeleteShellMutation>;
export type DeleteShellMutationOptions = Apollo.BaseMutationOptions<DeleteShellMutation, DeleteShellMutationVariables>;
export const GetTerraformDocument = gql`
    query GetTerraform($id: ID!) {
  terraform(repositoryId: $id, first: 100) {
    edges {
      node {
        ...Terraform
      }
    }
  }
}
    ${TerraformFragmentDoc}`;

/**
 * __useGetTerraformQuery__
 *
 * To run a query within a React component, call `useGetTerraformQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTerraformQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTerraformQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTerraformQuery(baseOptions: Apollo.QueryHookOptions<GetTerraformQuery, GetTerraformQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTerraformQuery, GetTerraformQueryVariables>(GetTerraformDocument, options);
      }
export function useGetTerraformLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTerraformQuery, GetTerraformQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTerraformQuery, GetTerraformQueryVariables>(GetTerraformDocument, options);
        }
export function useGetTerraformSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTerraformQuery, GetTerraformQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTerraformQuery, GetTerraformQueryVariables>(GetTerraformDocument, options);
        }
export type GetTerraformQueryHookResult = ReturnType<typeof useGetTerraformQuery>;
export type GetTerraformLazyQueryHookResult = ReturnType<typeof useGetTerraformLazyQuery>;
export type GetTerraformSuspenseQueryHookResult = ReturnType<typeof useGetTerraformSuspenseQuery>;
export type GetTerraformQueryResult = Apollo.QueryResult<GetTerraformQuery, GetTerraformQueryVariables>;
export const GetTerraformInstallationsDocument = gql`
    query GetTerraformInstallations($id: ID!) {
  terraformInstallations(repositoryId: $id, first: 100) {
    edges {
      node {
        ...TerraformInstallation
      }
    }
  }
}
    ${TerraformInstallationFragmentDoc}`;

/**
 * __useGetTerraformInstallationsQuery__
 *
 * To run a query within a React component, call `useGetTerraformInstallationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTerraformInstallationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTerraformInstallationsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTerraformInstallationsQuery(baseOptions: Apollo.QueryHookOptions<GetTerraformInstallationsQuery, GetTerraformInstallationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTerraformInstallationsQuery, GetTerraformInstallationsQueryVariables>(GetTerraformInstallationsDocument, options);
      }
export function useGetTerraformInstallationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTerraformInstallationsQuery, GetTerraformInstallationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTerraformInstallationsQuery, GetTerraformInstallationsQueryVariables>(GetTerraformInstallationsDocument, options);
        }
export function useGetTerraformInstallationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTerraformInstallationsQuery, GetTerraformInstallationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTerraformInstallationsQuery, GetTerraformInstallationsQueryVariables>(GetTerraformInstallationsDocument, options);
        }
export type GetTerraformInstallationsQueryHookResult = ReturnType<typeof useGetTerraformInstallationsQuery>;
export type GetTerraformInstallationsLazyQueryHookResult = ReturnType<typeof useGetTerraformInstallationsLazyQuery>;
export type GetTerraformInstallationsSuspenseQueryHookResult = ReturnType<typeof useGetTerraformInstallationsSuspenseQuery>;
export type GetTerraformInstallationsQueryResult = Apollo.QueryResult<GetTerraformInstallationsQuery, GetTerraformInstallationsQueryVariables>;
export const UploadTerraformDocument = gql`
    mutation UploadTerraform($repoName: String!, $name: String!, $uploadOrUrl: UploadOrUrl!) {
  uploadTerraform(
    repositoryName: $repoName
    name: $name
    attributes: {name: $name, package: $uploadOrUrl}
  ) {
    ...Terraform
  }
}
    ${TerraformFragmentDoc}`;
export type UploadTerraformMutationFn = Apollo.MutationFunction<UploadTerraformMutation, UploadTerraformMutationVariables>;

/**
 * __useUploadTerraformMutation__
 *
 * To run a mutation, you first call `useUploadTerraformMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadTerraformMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadTerraformMutation, { data, loading, error }] = useUploadTerraformMutation({
 *   variables: {
 *      repoName: // value for 'repoName'
 *      name: // value for 'name'
 *      uploadOrUrl: // value for 'uploadOrUrl'
 *   },
 * });
 */
export function useUploadTerraformMutation(baseOptions?: Apollo.MutationHookOptions<UploadTerraformMutation, UploadTerraformMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadTerraformMutation, UploadTerraformMutationVariables>(UploadTerraformDocument, options);
      }
export type UploadTerraformMutationHookResult = ReturnType<typeof useUploadTerraformMutation>;
export type UploadTerraformMutationResult = Apollo.MutationResult<UploadTerraformMutation>;
export type UploadTerraformMutationOptions = Apollo.BaseMutationOptions<UploadTerraformMutation, UploadTerraformMutationVariables>;
export const UninstallTerraformDocument = gql`
    mutation UninstallTerraform($id: ID!) {
  uninstallTerraform(id: $id) {
    id
  }
}
    `;
export type UninstallTerraformMutationFn = Apollo.MutationFunction<UninstallTerraformMutation, UninstallTerraformMutationVariables>;

/**
 * __useUninstallTerraformMutation__
 *
 * To run a mutation, you first call `useUninstallTerraformMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUninstallTerraformMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uninstallTerraformMutation, { data, loading, error }] = useUninstallTerraformMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUninstallTerraformMutation(baseOptions?: Apollo.MutationHookOptions<UninstallTerraformMutation, UninstallTerraformMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UninstallTerraformMutation, UninstallTerraformMutationVariables>(UninstallTerraformDocument, options);
      }
export type UninstallTerraformMutationHookResult = ReturnType<typeof useUninstallTerraformMutation>;
export type UninstallTerraformMutationResult = Apollo.MutationResult<UninstallTerraformMutation>;
export type UninstallTerraformMutationOptions = Apollo.BaseMutationOptions<UninstallTerraformMutation, UninstallTerraformMutationVariables>;
export const CreateTestDocument = gql`
    mutation CreateTest($name: String!, $attrs: TestAttributes!) {
  createTest(name: $name, attributes: $attrs) {
    ...Test
  }
}
    ${TestFragmentDoc}`;
export type CreateTestMutationFn = Apollo.MutationFunction<CreateTestMutation, CreateTestMutationVariables>;

/**
 * __useCreateTestMutation__
 *
 * To run a mutation, you first call `useCreateTestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTestMutation, { data, loading, error }] = useCreateTestMutation({
 *   variables: {
 *      name: // value for 'name'
 *      attrs: // value for 'attrs'
 *   },
 * });
 */
export function useCreateTestMutation(baseOptions?: Apollo.MutationHookOptions<CreateTestMutation, CreateTestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTestMutation, CreateTestMutationVariables>(CreateTestDocument, options);
      }
export type CreateTestMutationHookResult = ReturnType<typeof useCreateTestMutation>;
export type CreateTestMutationResult = Apollo.MutationResult<CreateTestMutation>;
export type CreateTestMutationOptions = Apollo.BaseMutationOptions<CreateTestMutation, CreateTestMutationVariables>;
export const UpdateTestDocument = gql`
    mutation UpdateTest($id: ID!, $attrs: TestAttributes!) {
  updateTest(id: $id, attributes: $attrs) {
    ...Test
  }
}
    ${TestFragmentDoc}`;
export type UpdateTestMutationFn = Apollo.MutationFunction<UpdateTestMutation, UpdateTestMutationVariables>;

/**
 * __useUpdateTestMutation__
 *
 * To run a mutation, you first call `useUpdateTestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTestMutation, { data, loading, error }] = useUpdateTestMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attrs: // value for 'attrs'
 *   },
 * });
 */
export function useUpdateTestMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTestMutation, UpdateTestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTestMutation, UpdateTestMutationVariables>(UpdateTestDocument, options);
      }
export type UpdateTestMutationHookResult = ReturnType<typeof useUpdateTestMutation>;
export type UpdateTestMutationResult = Apollo.MutationResult<UpdateTestMutation>;
export type UpdateTestMutationOptions = Apollo.BaseMutationOptions<UpdateTestMutation, UpdateTestMutationVariables>;
export const UpdateStepDocument = gql`
    mutation UpdateStep($id: ID!, $logs: UploadOrUrl!) {
  updateStep(id: $id, attributes: {logs: $logs}) {
    id
  }
}
    `;
export type UpdateStepMutationFn = Apollo.MutationFunction<UpdateStepMutation, UpdateStepMutationVariables>;

/**
 * __useUpdateStepMutation__
 *
 * To run a mutation, you first call `useUpdateStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateStepMutation, { data, loading, error }] = useUpdateStepMutation({
 *   variables: {
 *      id: // value for 'id'
 *      logs: // value for 'logs'
 *   },
 * });
 */
export function useUpdateStepMutation(baseOptions?: Apollo.MutationHookOptions<UpdateStepMutation, UpdateStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateStepMutation, UpdateStepMutationVariables>(UpdateStepDocument, options);
      }
export type UpdateStepMutationHookResult = ReturnType<typeof useUpdateStepMutation>;
export type UpdateStepMutationResult = Apollo.MutationResult<UpdateStepMutation>;
export type UpdateStepMutationOptions = Apollo.BaseMutationOptions<UpdateStepMutation, UpdateStepMutationVariables>;
export const PublishLogsDocument = gql`
    mutation PublishLogs($id: ID!, $logs: String!) {
  publishLogs(id: $id, logs: $logs) {
    id
  }
}
    `;
export type PublishLogsMutationFn = Apollo.MutationFunction<PublishLogsMutation, PublishLogsMutationVariables>;

/**
 * __usePublishLogsMutation__
 *
 * To run a mutation, you first call `usePublishLogsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishLogsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishLogsMutation, { data, loading, error }] = usePublishLogsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      logs: // value for 'logs'
 *   },
 * });
 */
export function usePublishLogsMutation(baseOptions?: Apollo.MutationHookOptions<PublishLogsMutation, PublishLogsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishLogsMutation, PublishLogsMutationVariables>(PublishLogsDocument, options);
      }
export type PublishLogsMutationHookResult = ReturnType<typeof usePublishLogsMutation>;
export type PublishLogsMutationResult = Apollo.MutationResult<PublishLogsMutation>;
export type PublishLogsMutationOptions = Apollo.BaseMutationOptions<PublishLogsMutation, PublishLogsMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    ...User
    demoing
    loginMethod
    hasInstallations
    hasShell
    account {
      ...Account
      rootUser {
        id
        name
        email
      }
      domainMappings {
        ...DomainMapping
      }
    }
    publisher {
      ...Publisher
      billingAccountId
    }
    boundRoles {
      ...Role
    }
  }
  configuration {
    stripeConnectId
    stripePublishableKey
    registry
    gitCommit
  }
}
    ${UserFragmentDoc}
${AccountFragmentDoc}
${DomainMappingFragmentDoc}
${PublisherFragmentDoc}
${RoleFragmentDoc}`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const GetLoginMethodDocument = gql`
    query GetLoginMethod($email: String!) {
  loginMethod(email: $email) {
    loginMethod
    token
  }
}
    `;

/**
 * __useGetLoginMethodQuery__
 *
 * To run a query within a React component, call `useGetLoginMethodQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoginMethodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoginMethodQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetLoginMethodQuery(baseOptions: Apollo.QueryHookOptions<GetLoginMethodQuery, GetLoginMethodQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLoginMethodQuery, GetLoginMethodQueryVariables>(GetLoginMethodDocument, options);
      }
export function useGetLoginMethodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLoginMethodQuery, GetLoginMethodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLoginMethodQuery, GetLoginMethodQueryVariables>(GetLoginMethodDocument, options);
        }
export function useGetLoginMethodSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLoginMethodQuery, GetLoginMethodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLoginMethodQuery, GetLoginMethodQueryVariables>(GetLoginMethodDocument, options);
        }
export type GetLoginMethodQueryHookResult = ReturnType<typeof useGetLoginMethodQuery>;
export type GetLoginMethodLazyQueryHookResult = ReturnType<typeof useGetLoginMethodLazyQuery>;
export type GetLoginMethodSuspenseQueryHookResult = ReturnType<typeof useGetLoginMethodSuspenseQuery>;
export type GetLoginMethodQueryResult = Apollo.QueryResult<GetLoginMethodQuery, GetLoginMethodQueryVariables>;
export const ListTokensDocument = gql`
    query ListTokens {
  tokens(first: 3) {
    edges {
      node {
        token
      }
    }
  }
}
    `;

/**
 * __useListTokensQuery__
 *
 * To run a query within a React component, call `useListTokensQuery` and pass it any options that fit your needs.
 * When your component renders, `useListTokensQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListTokensQuery({
 *   variables: {
 *   },
 * });
 */
export function useListTokensQuery(baseOptions?: Apollo.QueryHookOptions<ListTokensQuery, ListTokensQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListTokensQuery, ListTokensQueryVariables>(ListTokensDocument, options);
      }
export function useListTokensLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListTokensQuery, ListTokensQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListTokensQuery, ListTokensQueryVariables>(ListTokensDocument, options);
        }
export function useListTokensSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ListTokensQuery, ListTokensQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListTokensQuery, ListTokensQueryVariables>(ListTokensDocument, options);
        }
export type ListTokensQueryHookResult = ReturnType<typeof useListTokensQuery>;
export type ListTokensLazyQueryHookResult = ReturnType<typeof useListTokensLazyQuery>;
export type ListTokensSuspenseQueryHookResult = ReturnType<typeof useListTokensSuspenseQuery>;
export type ListTokensQueryResult = Apollo.QueryResult<ListTokensQuery, ListTokensQueryVariables>;
export const ListKeysDocument = gql`
    query ListKeys($emails: [String]) {
  publicKeys(emails: $emails, first: 1000) {
    edges {
      node {
        ...PublicKey
      }
    }
  }
}
    ${PublicKeyFragmentDoc}`;

/**
 * __useListKeysQuery__
 *
 * To run a query within a React component, call `useListKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useListKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListKeysQuery({
 *   variables: {
 *      emails: // value for 'emails'
 *   },
 * });
 */
export function useListKeysQuery(baseOptions?: Apollo.QueryHookOptions<ListKeysQuery, ListKeysQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListKeysQuery, ListKeysQueryVariables>(ListKeysDocument, options);
      }
export function useListKeysLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListKeysQuery, ListKeysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListKeysQuery, ListKeysQueryVariables>(ListKeysDocument, options);
        }
export function useListKeysSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ListKeysQuery, ListKeysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListKeysQuery, ListKeysQueryVariables>(ListKeysDocument, options);
        }
export type ListKeysQueryHookResult = ReturnType<typeof useListKeysQuery>;
export type ListKeysLazyQueryHookResult = ReturnType<typeof useListKeysLazyQuery>;
export type ListKeysSuspenseQueryHookResult = ReturnType<typeof useListKeysSuspenseQuery>;
export type ListKeysQueryResult = Apollo.QueryResult<ListKeysQuery, ListKeysQueryVariables>;
export const GetEabCredentialDocument = gql`
    query GetEabCredential($cluster: String!, $provider: Provider!) {
  eabCredential(cluster: $cluster, provider: $provider) {
    ...EabCredential
  }
}
    ${EabCredentialFragmentDoc}`;

/**
 * __useGetEabCredentialQuery__
 *
 * To run a query within a React component, call `useGetEabCredentialQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEabCredentialQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEabCredentialQuery({
 *   variables: {
 *      cluster: // value for 'cluster'
 *      provider: // value for 'provider'
 *   },
 * });
 */
export function useGetEabCredentialQuery(baseOptions: Apollo.QueryHookOptions<GetEabCredentialQuery, GetEabCredentialQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEabCredentialQuery, GetEabCredentialQueryVariables>(GetEabCredentialDocument, options);
      }
export function useGetEabCredentialLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEabCredentialQuery, GetEabCredentialQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEabCredentialQuery, GetEabCredentialQueryVariables>(GetEabCredentialDocument, options);
        }
export function useGetEabCredentialSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetEabCredentialQuery, GetEabCredentialQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEabCredentialQuery, GetEabCredentialQueryVariables>(GetEabCredentialDocument, options);
        }
export type GetEabCredentialQueryHookResult = ReturnType<typeof useGetEabCredentialQuery>;
export type GetEabCredentialLazyQueryHookResult = ReturnType<typeof useGetEabCredentialLazyQuery>;
export type GetEabCredentialSuspenseQueryHookResult = ReturnType<typeof useGetEabCredentialSuspenseQuery>;
export type GetEabCredentialQueryResult = Apollo.QueryResult<GetEabCredentialQuery, GetEabCredentialQueryVariables>;
export const DevLoginDocument = gql`
    mutation DevLogin {
  deviceLogin {
    loginUrl
    deviceToken
  }
}
    `;
export type DevLoginMutationFn = Apollo.MutationFunction<DevLoginMutation, DevLoginMutationVariables>;

/**
 * __useDevLoginMutation__
 *
 * To run a mutation, you first call `useDevLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDevLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [devLoginMutation, { data, loading, error }] = useDevLoginMutation({
 *   variables: {
 *   },
 * });
 */
export function useDevLoginMutation(baseOptions?: Apollo.MutationHookOptions<DevLoginMutation, DevLoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DevLoginMutation, DevLoginMutationVariables>(DevLoginDocument, options);
      }
export type DevLoginMutationHookResult = ReturnType<typeof useDevLoginMutation>;
export type DevLoginMutationResult = Apollo.MutationResult<DevLoginMutation>;
export type DevLoginMutationOptions = Apollo.BaseMutationOptions<DevLoginMutation, DevLoginMutationVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!, $deviceToken: String, $captcha: String!) {
  login(
    email: $email
    password: $password
    deviceToken: $deviceToken
    captcha: $captcha
  ) {
    jwt
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      deviceToken: // value for 'deviceToken'
 *      captcha: // value for 'captcha'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const CreateServiceAccountDocument = gql`
    mutation CreateServiceAccount($attributes: ServiceAccountAttributes!) {
  createServiceAccount(attributes: $attributes) {
    ...User
    impersonationPolicy {
      ...ImpersonationPolicy
    }
  }
}
    ${UserFragmentDoc}
${ImpersonationPolicyFragmentDoc}`;
export type CreateServiceAccountMutationFn = Apollo.MutationFunction<CreateServiceAccountMutation, CreateServiceAccountMutationVariables>;

/**
 * __useCreateServiceAccountMutation__
 *
 * To run a mutation, you first call `useCreateServiceAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateServiceAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createServiceAccountMutation, { data, loading, error }] = useCreateServiceAccountMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateServiceAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateServiceAccountMutation, CreateServiceAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateServiceAccountMutation, CreateServiceAccountMutationVariables>(CreateServiceAccountDocument, options);
      }
export type CreateServiceAccountMutationHookResult = ReturnType<typeof useCreateServiceAccountMutation>;
export type CreateServiceAccountMutationResult = Apollo.MutationResult<CreateServiceAccountMutation>;
export type CreateServiceAccountMutationOptions = Apollo.BaseMutationOptions<CreateServiceAccountMutation, CreateServiceAccountMutationVariables>;
export const ImpersonateServiceAccountDocument = gql`
    mutation ImpersonateServiceAccount($id: ID, $email: String) {
  impersonateServiceAccount(id: $id, email: $email) {
    jwt
    email
  }
}
    `;
export type ImpersonateServiceAccountMutationFn = Apollo.MutationFunction<ImpersonateServiceAccountMutation, ImpersonateServiceAccountMutationVariables>;

/**
 * __useImpersonateServiceAccountMutation__
 *
 * To run a mutation, you first call `useImpersonateServiceAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImpersonateServiceAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [impersonateServiceAccountMutation, { data, loading, error }] = useImpersonateServiceAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useImpersonateServiceAccountMutation(baseOptions?: Apollo.MutationHookOptions<ImpersonateServiceAccountMutation, ImpersonateServiceAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ImpersonateServiceAccountMutation, ImpersonateServiceAccountMutationVariables>(ImpersonateServiceAccountDocument, options);
      }
export type ImpersonateServiceAccountMutationHookResult = ReturnType<typeof useImpersonateServiceAccountMutation>;
export type ImpersonateServiceAccountMutationResult = Apollo.MutationResult<ImpersonateServiceAccountMutation>;
export type ImpersonateServiceAccountMutationOptions = Apollo.BaseMutationOptions<ImpersonateServiceAccountMutation, ImpersonateServiceAccountMutationVariables>;
export const CreateAccessTokenDocument = gql`
    mutation CreateAccessToken {
  createToken {
    token
  }
}
    `;
export type CreateAccessTokenMutationFn = Apollo.MutationFunction<CreateAccessTokenMutation, CreateAccessTokenMutationVariables>;

/**
 * __useCreateAccessTokenMutation__
 *
 * To run a mutation, you first call `useCreateAccessTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAccessTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAccessTokenMutation, { data, loading, error }] = useCreateAccessTokenMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateAccessTokenMutation(baseOptions?: Apollo.MutationHookOptions<CreateAccessTokenMutation, CreateAccessTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAccessTokenMutation, CreateAccessTokenMutationVariables>(CreateAccessTokenDocument, options);
      }
export type CreateAccessTokenMutationHookResult = ReturnType<typeof useCreateAccessTokenMutation>;
export type CreateAccessTokenMutationResult = Apollo.MutationResult<CreateAccessTokenMutation>;
export type CreateAccessTokenMutationOptions = Apollo.BaseMutationOptions<CreateAccessTokenMutation, CreateAccessTokenMutationVariables>;
export const CreateKeyDocument = gql`
    mutation CreateKey($key: String!, $name: String!) {
  createPublicKey(attributes: {content: $key, name: $name}) {
    id
  }
}
    `;
export type CreateKeyMutationFn = Apollo.MutationFunction<CreateKeyMutation, CreateKeyMutationVariables>;

/**
 * __useCreateKeyMutation__
 *
 * To run a mutation, you first call `useCreateKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createKeyMutation, { data, loading, error }] = useCreateKeyMutation({
 *   variables: {
 *      key: // value for 'key'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateKeyMutation(baseOptions?: Apollo.MutationHookOptions<CreateKeyMutation, CreateKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateKeyMutation, CreateKeyMutationVariables>(CreateKeyDocument, options);
      }
export type CreateKeyMutationHookResult = ReturnType<typeof useCreateKeyMutation>;
export type CreateKeyMutationResult = Apollo.MutationResult<CreateKeyMutation>;
export type CreateKeyMutationOptions = Apollo.BaseMutationOptions<CreateKeyMutation, CreateKeyMutationVariables>;
export const DeleteEabCredentialDocument = gql`
    mutation DeleteEabCredential($cluster: String!, $provider: Provider!) {
  deleteEabKey(cluster: $cluster, provider: $provider) {
    id
  }
}
    `;
export type DeleteEabCredentialMutationFn = Apollo.MutationFunction<DeleteEabCredentialMutation, DeleteEabCredentialMutationVariables>;

/**
 * __useDeleteEabCredentialMutation__
 *
 * To run a mutation, you first call `useDeleteEabCredentialMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEabCredentialMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEabCredentialMutation, { data, loading, error }] = useDeleteEabCredentialMutation({
 *   variables: {
 *      cluster: // value for 'cluster'
 *      provider: // value for 'provider'
 *   },
 * });
 */
export function useDeleteEabCredentialMutation(baseOptions?: Apollo.MutationHookOptions<DeleteEabCredentialMutation, DeleteEabCredentialMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteEabCredentialMutation, DeleteEabCredentialMutationVariables>(DeleteEabCredentialDocument, options);
      }
export type DeleteEabCredentialMutationHookResult = ReturnType<typeof useDeleteEabCredentialMutation>;
export type DeleteEabCredentialMutationResult = Apollo.MutationResult<DeleteEabCredentialMutation>;
export type DeleteEabCredentialMutationOptions = Apollo.BaseMutationOptions<DeleteEabCredentialMutation, DeleteEabCredentialMutationVariables>;
export const CreateEventDocument = gql`
    mutation CreateEvent($attrs: UserEventAttributes!) {
  createUserEvent(attributes: $attrs)
}
    `;
export type CreateEventMutationFn = Apollo.MutationFunction<CreateEventMutation, CreateEventMutationVariables>;

/**
 * __useCreateEventMutation__
 *
 * To run a mutation, you first call `useCreateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEventMutation, { data, loading, error }] = useCreateEventMutation({
 *   variables: {
 *      attrs: // value for 'attrs'
 *   },
 * });
 */
export function useCreateEventMutation(baseOptions?: Apollo.MutationHookOptions<CreateEventMutation, CreateEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateEventMutation, CreateEventMutationVariables>(CreateEventDocument, options);
      }
export type CreateEventMutationHookResult = ReturnType<typeof useCreateEventMutation>;
export type CreateEventMutationResult = Apollo.MutationResult<CreateEventMutation>;
export type CreateEventMutationOptions = Apollo.BaseMutationOptions<CreateEventMutation, CreateEventMutationVariables>;
export const LoginMethodDocument = gql`
    query LoginMethod($email: String!, $host: String) {
  loginMethod(email: $email, host: $host) {
    loginMethod
    token
    authorizeUrl
  }
}
    `;

/**
 * __useLoginMethodQuery__
 *
 * To run a query within a React component, call `useLoginMethodQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoginMethodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoginMethodQuery({
 *   variables: {
 *      email: // value for 'email'
 *      host: // value for 'host'
 *   },
 * });
 */
export function useLoginMethodQuery(baseOptions: Apollo.QueryHookOptions<LoginMethodQuery, LoginMethodQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoginMethodQuery, LoginMethodQueryVariables>(LoginMethodDocument, options);
      }
export function useLoginMethodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoginMethodQuery, LoginMethodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoginMethodQuery, LoginMethodQueryVariables>(LoginMethodDocument, options);
        }
export function useLoginMethodSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<LoginMethodQuery, LoginMethodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LoginMethodQuery, LoginMethodQueryVariables>(LoginMethodDocument, options);
        }
export type LoginMethodQueryHookResult = ReturnType<typeof useLoginMethodQuery>;
export type LoginMethodLazyQueryHookResult = ReturnType<typeof useLoginMethodLazyQuery>;
export type LoginMethodSuspenseQueryHookResult = ReturnType<typeof useLoginMethodSuspenseQuery>;
export type LoginMethodQueryResult = Apollo.QueryResult<LoginMethodQuery, LoginMethodQueryVariables>;
export const SignupDocument = gql`
    mutation Signup($attributes: UserAttributes!, $account: AccountAttributes, $deviceToken: String) {
  signup(attributes: $attributes, account: $account, deviceToken: $deviceToken) {
    jwt
    onboarding
  }
}
    `;
export type SignupMutationFn = Apollo.MutationFunction<SignupMutation, SignupMutationVariables>;

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *      account: // value for 'account'
 *      deviceToken: // value for 'deviceToken'
 *   },
 * });
 */
export function useSignupMutation(baseOptions?: Apollo.MutationHookOptions<SignupMutation, SignupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignupMutation, SignupMutationVariables>(SignupDocument, options);
      }
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = Apollo.MutationResult<SignupMutation>;
export type SignupMutationOptions = Apollo.BaseMutationOptions<SignupMutation, SignupMutationVariables>;
export const PasswordlessLoginDocument = gql`
    mutation PasswordlessLogin($token: String!) {
  passwordlessLogin(token: $token) {
    jwt
  }
}
    `;
export type PasswordlessLoginMutationFn = Apollo.MutationFunction<PasswordlessLoginMutation, PasswordlessLoginMutationVariables>;

/**
 * __usePasswordlessLoginMutation__
 *
 * To run a mutation, you first call `usePasswordlessLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePasswordlessLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [passwordlessLoginMutation, { data, loading, error }] = usePasswordlessLoginMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function usePasswordlessLoginMutation(baseOptions?: Apollo.MutationHookOptions<PasswordlessLoginMutation, PasswordlessLoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PasswordlessLoginMutation, PasswordlessLoginMutationVariables>(PasswordlessLoginDocument, options);
      }
export type PasswordlessLoginMutationHookResult = ReturnType<typeof usePasswordlessLoginMutation>;
export type PasswordlessLoginMutationResult = Apollo.MutationResult<PasswordlessLoginMutation>;
export type PasswordlessLoginMutationOptions = Apollo.BaseMutationOptions<PasswordlessLoginMutation, PasswordlessLoginMutationVariables>;
export const PollLoginTokenDocument = gql`
    mutation PollLoginToken($token: String!, $deviceToken: String) {
  loginToken(token: $token, deviceToken: $deviceToken) {
    jwt
  }
}
    `;
export type PollLoginTokenMutationFn = Apollo.MutationFunction<PollLoginTokenMutation, PollLoginTokenMutationVariables>;

/**
 * __usePollLoginTokenMutation__
 *
 * To run a mutation, you first call `usePollLoginTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePollLoginTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [pollLoginTokenMutation, { data, loading, error }] = usePollLoginTokenMutation({
 *   variables: {
 *      token: // value for 'token'
 *      deviceToken: // value for 'deviceToken'
 *   },
 * });
 */
export function usePollLoginTokenMutation(baseOptions?: Apollo.MutationHookOptions<PollLoginTokenMutation, PollLoginTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PollLoginTokenMutation, PollLoginTokenMutationVariables>(PollLoginTokenDocument, options);
      }
export type PollLoginTokenMutationHookResult = ReturnType<typeof usePollLoginTokenMutation>;
export type PollLoginTokenMutationResult = Apollo.MutationResult<PollLoginTokenMutation>;
export type PollLoginTokenMutationOptions = Apollo.BaseMutationOptions<PollLoginTokenMutation, PollLoginTokenMutationVariables>;
export const OauthUrlsDocument = gql`
    query OauthUrls($host: String) {
  oauthUrls(host: $host) {
    provider
    authorizeUrl
  }
}
    `;

/**
 * __useOauthUrlsQuery__
 *
 * To run a query within a React component, call `useOauthUrlsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOauthUrlsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOauthUrlsQuery({
 *   variables: {
 *      host: // value for 'host'
 *   },
 * });
 */
export function useOauthUrlsQuery(baseOptions?: Apollo.QueryHookOptions<OauthUrlsQuery, OauthUrlsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OauthUrlsQuery, OauthUrlsQueryVariables>(OauthUrlsDocument, options);
      }
export function useOauthUrlsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OauthUrlsQuery, OauthUrlsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OauthUrlsQuery, OauthUrlsQueryVariables>(OauthUrlsDocument, options);
        }
export function useOauthUrlsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OauthUrlsQuery, OauthUrlsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OauthUrlsQuery, OauthUrlsQueryVariables>(OauthUrlsDocument, options);
        }
export type OauthUrlsQueryHookResult = ReturnType<typeof useOauthUrlsQuery>;
export type OauthUrlsLazyQueryHookResult = ReturnType<typeof useOauthUrlsLazyQuery>;
export type OauthUrlsSuspenseQueryHookResult = ReturnType<typeof useOauthUrlsSuspenseQuery>;
export type OauthUrlsQueryResult = Apollo.QueryResult<OauthUrlsQuery, OauthUrlsQueryVariables>;
export const AcceptLoginDocument = gql`
    mutation AcceptLogin($challenge: String!) {
  acceptLogin(challenge: $challenge) {
    redirectTo
  }
}
    `;
export type AcceptLoginMutationFn = Apollo.MutationFunction<AcceptLoginMutation, AcceptLoginMutationVariables>;

/**
 * __useAcceptLoginMutation__
 *
 * To run a mutation, you first call `useAcceptLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcceptLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acceptLoginMutation, { data, loading, error }] = useAcceptLoginMutation({
 *   variables: {
 *      challenge: // value for 'challenge'
 *   },
 * });
 */
export function useAcceptLoginMutation(baseOptions?: Apollo.MutationHookOptions<AcceptLoginMutation, AcceptLoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcceptLoginMutation, AcceptLoginMutationVariables>(AcceptLoginDocument, options);
      }
export type AcceptLoginMutationHookResult = ReturnType<typeof useAcceptLoginMutation>;
export type AcceptLoginMutationResult = Apollo.MutationResult<AcceptLoginMutation>;
export type AcceptLoginMutationOptions = Apollo.BaseMutationOptions<AcceptLoginMutation, AcceptLoginMutationVariables>;
export const CreateResetTokenDocument = gql`
    mutation CreateResetToken($attributes: ResetTokenAttributes!) {
  createResetToken(attributes: $attributes)
}
    `;
export type CreateResetTokenMutationFn = Apollo.MutationFunction<CreateResetTokenMutation, CreateResetTokenMutationVariables>;

/**
 * __useCreateResetTokenMutation__
 *
 * To run a mutation, you first call `useCreateResetTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateResetTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createResetTokenMutation, { data, loading, error }] = useCreateResetTokenMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateResetTokenMutation(baseOptions?: Apollo.MutationHookOptions<CreateResetTokenMutation, CreateResetTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateResetTokenMutation, CreateResetTokenMutationVariables>(CreateResetTokenDocument, options);
      }
export type CreateResetTokenMutationHookResult = ReturnType<typeof useCreateResetTokenMutation>;
export type CreateResetTokenMutationResult = Apollo.MutationResult<CreateResetTokenMutation>;
export type CreateResetTokenMutationOptions = Apollo.BaseMutationOptions<CreateResetTokenMutation, CreateResetTokenMutationVariables>;
export const RealizeResetTokenDocument = gql`
    mutation RealizeResetToken($id: ID!, $attributes: ResetTokenRealization!) {
  realizeResetToken(id: $id, attributes: $attributes)
}
    `;
export type RealizeResetTokenMutationFn = Apollo.MutationFunction<RealizeResetTokenMutation, RealizeResetTokenMutationVariables>;

/**
 * __useRealizeResetTokenMutation__
 *
 * To run a mutation, you first call `useRealizeResetTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRealizeResetTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [realizeResetTokenMutation, { data, loading, error }] = useRealizeResetTokenMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useRealizeResetTokenMutation(baseOptions?: Apollo.MutationHookOptions<RealizeResetTokenMutation, RealizeResetTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RealizeResetTokenMutation, RealizeResetTokenMutationVariables>(RealizeResetTokenDocument, options);
      }
export type RealizeResetTokenMutationHookResult = ReturnType<typeof useRealizeResetTokenMutation>;
export type RealizeResetTokenMutationResult = Apollo.MutationResult<RealizeResetTokenMutation>;
export type RealizeResetTokenMutationOptions = Apollo.BaseMutationOptions<RealizeResetTokenMutation, RealizeResetTokenMutationVariables>;
export const ResetTokenDocument = gql`
    query ResetToken($id: ID!) {
  resetToken(id: $id) {
    type
    user {
      ...User
    }
  }
}
    ${UserFragmentDoc}`;

/**
 * __useResetTokenQuery__
 *
 * To run a query within a React component, call `useResetTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useResetTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useResetTokenQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useResetTokenQuery(baseOptions: Apollo.QueryHookOptions<ResetTokenQuery, ResetTokenQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ResetTokenQuery, ResetTokenQueryVariables>(ResetTokenDocument, options);
      }
export function useResetTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ResetTokenQuery, ResetTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ResetTokenQuery, ResetTokenQueryVariables>(ResetTokenDocument, options);
        }
export function useResetTokenSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ResetTokenQuery, ResetTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ResetTokenQuery, ResetTokenQueryVariables>(ResetTokenDocument, options);
        }
export type ResetTokenQueryHookResult = ReturnType<typeof useResetTokenQuery>;
export type ResetTokenLazyQueryHookResult = ReturnType<typeof useResetTokenLazyQuery>;
export type ResetTokenSuspenseQueryHookResult = ReturnType<typeof useResetTokenSuspenseQuery>;
export type ResetTokenQueryResult = Apollo.QueryResult<ResetTokenQuery, ResetTokenQueryVariables>;
export const UsersDocument = gql`
    query Users($q: String, $serviceAccount: Boolean, $all: Boolean, $cursor: String, $first: Int = 20) {
  users(
    q: $q
    first: $first
    after: $cursor
    serviceAccount: $serviceAccount
    all: $all
  ) {
    pageInfo {
      ...PageInfo
    }
    edges {
      node {
        ...User
        impersonationPolicy {
          ...ImpersonationPolicy
        }
      }
    }
  }
}
    ${PageInfoFragmentDoc}
${UserFragmentDoc}
${ImpersonationPolicyFragmentDoc}`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *      q: // value for 'q'
 *      serviceAccount: // value for 'serviceAccount'
 *      all: // value for 'all'
 *      cursor: // value for 'cursor'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useUsersQuery(baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
      }
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export function useUsersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersSuspenseQueryHookResult = ReturnType<typeof useUsersSuspenseQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
export const ReadNotificationsDocument = gql`
    mutation ReadNotifications($incidentId: ID) {
  readNotifications(incidentId: $incidentId)
}
    `;
export type ReadNotificationsMutationFn = Apollo.MutationFunction<ReadNotificationsMutation, ReadNotificationsMutationVariables>;

/**
 * __useReadNotificationsMutation__
 *
 * To run a mutation, you first call `useReadNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReadNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [readNotificationsMutation, { data, loading, error }] = useReadNotificationsMutation({
 *   variables: {
 *      incidentId: // value for 'incidentId'
 *   },
 * });
 */
export function useReadNotificationsMutation(baseOptions?: Apollo.MutationHookOptions<ReadNotificationsMutation, ReadNotificationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReadNotificationsMutation, ReadNotificationsMutationVariables>(ReadNotificationsDocument, options);
      }
export type ReadNotificationsMutationHookResult = ReturnType<typeof useReadNotificationsMutation>;
export type ReadNotificationsMutationResult = Apollo.MutationResult<ReadNotificationsMutation>;
export type ReadNotificationsMutationOptions = Apollo.BaseMutationOptions<ReadNotificationsMutation, ReadNotificationsMutationVariables>;
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: ID!) {
  deleteUser(id: $id) {
    ...User
  }
}
    ${UserFragmentDoc}`;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: ID, $attributes: UserAttributes!) {
  updateUser(id: $id, attributes: $attributes) {
    ...User
  }
}
    ${UserFragmentDoc}`;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateVersionDocument = gql`
    mutation UpdateVersion($spec: VersionSpec, $attributes: VersionAttributes!) {
  updateVersion(spec: $spec, attributes: $attributes) {
    id
  }
}
    `;
export type UpdateVersionMutationFn = Apollo.MutationFunction<UpdateVersionMutation, UpdateVersionMutationVariables>;

/**
 * __useUpdateVersionMutation__
 *
 * To run a mutation, you first call `useUpdateVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVersionMutation, { data, loading, error }] = useUpdateVersionMutation({
 *   variables: {
 *      spec: // value for 'spec'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateVersionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVersionMutation, UpdateVersionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateVersionMutation, UpdateVersionMutationVariables>(UpdateVersionDocument, options);
      }
export type UpdateVersionMutationHookResult = ReturnType<typeof useUpdateVersionMutation>;
export type UpdateVersionMutationResult = Apollo.MutationResult<UpdateVersionMutation>;
export type UpdateVersionMutationOptions = Apollo.BaseMutationOptions<UpdateVersionMutation, UpdateVersionMutationVariables>;
export const namedOperations = {
  Query: {
    GenerateLicenseKey: 'GenerateLicenseKey',
    ConsumerEmailDomains: 'ConsumerEmailDomains',
    ListArtifacts: 'ListArtifacts',
    Audits: 'Audits',
    Logins: 'Logins',
    AuditMetrics: 'AuditMetrics',
    LoginMetrics: 'LoginMetrics',
    GetCharts: 'GetCharts',
    GetVersions: 'GetVersions',
    GetChartInstallations: 'GetChartInstallations',
    GetPackageInstallations: 'GetPackageInstallations',
    Clusters: 'Clusters',
    DnsRecords: 'DnsRecords',
    GroupMembers: 'GroupMembers',
    Groups: 'Groups',
    OauthIntegrations: 'OauthIntegrations',
    Invite: 'Invite',
    KeyBackups: 'KeyBackups',
    KeyBackup: 'KeyBackup',
    Categories: 'Categories',
    Tags: 'Tags',
    Notifications: 'Notifications',
    OIDCConsent: 'OIDCConsent',
    OIDCProviders: 'OIDCProviders',
    Subscription: 'Subscription',
    Cards: 'Cards',
    Invoices: 'Invoices',
    ConsoleInstance: 'ConsoleInstance',
    ConsoleInstances: 'ConsoleInstances',
    GetRecipe: 'GetRecipe',
    ListRecipes: 'ListRecipes',
    GetStack: 'GetStack',
    ListStacks: 'ListStacks',
    Repository: 'Repository',
    Repositories: 'Repositories',
    MarketplaceRepositories: 'MarketplaceRepositories',
    Scaffolds: 'Scaffolds',
    GetTfProviders: 'GetTfProviders',
    GetTfProviderScaffold: 'GetTfProviderScaffold',
    GetShell: 'GetShell',
    GetTerraform: 'GetTerraform',
    GetTerraformInstallations: 'GetTerraformInstallations',
    Me: 'Me',
    GetLoginMethod: 'GetLoginMethod',
    ListTokens: 'ListTokens',
    ListKeys: 'ListKeys',
    GetEabCredential: 'GetEabCredential',
    LoginMethod: 'LoginMethod',
    OauthUrls: 'OauthUrls',
    ResetToken: 'ResetToken',
    Users: 'Users'
  },
  Mutation: {
    UpdateAccount: 'UpdateAccount',
    BeginTrial: 'BeginTrial',
    CreateArtifact: 'CreateArtifact',
    CreateCrd: 'CreateCrd',
    UninstallChart: 'UninstallChart',
    CreateDnsRecord: 'CreateDnsRecord',
    DeleteDnsRecord: 'DeleteDnsRecord',
    UpdateDomain: 'UpdateDomain',
    DeleteDomain: 'DeleteDomain',
    CreateDomain: 'CreateDomain',
    CreateGroupMember: 'CreateGroupMember',
    DeleteGroupMember: 'DeleteGroupMember',
    CreateGroup: 'CreateGroup',
    UpdateGroup: 'UpdateGroup',
    DeleteGroup: 'DeleteGroup',
    CreateOauthIntegration: 'CreateOauthIntegration',
    CreateInvite: 'CreateInvite',
    SignupInvite: 'SignupInvite',
    RealizeInvite: 'RealizeInvite',
    DeleteInvite: 'DeleteInvite',
    DeleteKeyBackup: 'DeleteKeyBackup',
    CreateKeyBackup: 'CreateKeyBackup',
    Consent: 'Consent',
    CreateProvider: 'CreateProvider',
    UpdateProvider: 'UpdateProvider',
    DeleteProvider: 'DeleteProvider',
    UpdateAccountBilling: 'UpdateAccountBilling',
    DowngradeToFreePlanMutation: 'DowngradeToFreePlanMutation',
    SetupIntent: 'SetupIntent',
    InitiateCheckout: 'InitiateCheckout',
    FinalizeCheckout: 'FinalizeCheckout',
    DefaultPaymentMethod: 'DefaultPaymentMethod',
    DeletePaymentMethod: 'DeletePaymentMethod',
    CreateConsoleInstance: 'CreateConsoleInstance',
    UpdateConsoleInstance: 'UpdateConsoleInstance',
    DeleteConsoleInstance: 'DeleteConsoleInstance',
    UpdateOidcProvider: 'UpdateOidcProvider',
    CreateRecipe: 'CreateRecipe',
    InstallRecipe: 'InstallRecipe',
    CreateStack: 'CreateStack',
    CreateResourceDefinition: 'CreateResourceDefinition',
    CreateIntegration: 'CreateIntegration',
    UpdateRepository: 'UpdateRepository',
    CreateRepository: 'CreateRepository',
    AcquireLock: 'AcquireLock',
    ReleaseLock: 'ReleaseLock',
    UnlockRepository: 'UnlockRepository',
    DeleteRepository: 'DeleteRepository',
    Release: 'Release',
    CreateRole: 'CreateRole',
    UpdateRole: 'UpdateRole',
    DeleteRole: 'DeleteRole',
    DeleteShell: 'DeleteShell',
    UploadTerraform: 'UploadTerraform',
    UninstallTerraform: 'UninstallTerraform',
    CreateTest: 'CreateTest',
    UpdateTest: 'UpdateTest',
    UpdateStep: 'UpdateStep',
    PublishLogs: 'PublishLogs',
    DevLogin: 'DevLogin',
    Login: 'Login',
    CreateServiceAccount: 'CreateServiceAccount',
    ImpersonateServiceAccount: 'ImpersonateServiceAccount',
    CreateAccessToken: 'CreateAccessToken',
    CreateKey: 'CreateKey',
    DeleteEabCredential: 'DeleteEabCredential',
    CreateEvent: 'CreateEvent',
    Signup: 'Signup',
    PasswordlessLogin: 'PasswordlessLogin',
    PollLoginToken: 'PollLoginToken',
    AcceptLogin: 'AcceptLogin',
    CreateResetToken: 'CreateResetToken',
    RealizeResetToken: 'RealizeResetToken',
    ReadNotifications: 'ReadNotifications',
    DeleteUser: 'DeleteUser',
    UpdateUser: 'UpdateUser',
    UpdateVersion: 'UpdateVersion'
  },
  Fragment: {
    PolicyBinding: 'PolicyBinding',
    DnsDomain: 'DnsDomain',
    OidcLogin: 'OidcLogin',
    Artifact: 'Artifact',
    Audit: 'Audit',
    Chart: 'Chart',
    Crd: 'Crd',
    ChartInstallation: 'ChartInstallation',
    ScanViolation: 'ScanViolation',
    ScanError: 'ScanError',
    PackageScan: 'PackageScan',
    Cluster: 'Cluster',
    UpgradeInfo: 'UpgradeInfo',
    DnsRecord: 'DnsRecord',
    DockerRepo: 'DockerRepo',
    DockerRepository: 'DockerRepository',
    DockerImage: 'DockerImage',
    Vulnerability: 'Vulnerability',
    Postmortem: 'Postmortem',
    Follower: 'Follower',
    SlimSubscription: 'SlimSubscription',
    ClusterInformation: 'ClusterInformation',
    Incident: 'Incident',
    IncidentHistory: 'IncidentHistory',
    File: 'File',
    IncidentMessage: 'IncidentMessage',
    Notification: 'Notification',
    InstallationRepo: 'InstallationRepo',
    Installation: 'Installation',
    IntegrationWebhook: 'IntegrationWebhook',
    WebhookLog: 'WebhookLog',
    OauthIntegration: 'OauthIntegration',
    ZoomMeeting: 'ZoomMeeting',
    Invite: 'Invite',
    KeyBackupUser: 'KeyBackupUser',
    KeyBackup: 'KeyBackup',
    CategoryInfo: 'CategoryInfo',
    GroupedTag: 'GroupedTag',
    Metric: 'Metric',
    PageInfo: 'PageInfo',
    NotificationFragment: 'NotificationFragment',
    OIDCProvider: 'OIDCProvider',
    OidcProviderBinding: 'OidcProviderBinding',
    OAuthInfo: 'OAuthInfo',
    Limit: 'Limit',
    LineItem: 'LineItem',
    ServiceLevel: 'ServiceLevel',
    Plan: 'Plan',
    Subscription: 'Subscription',
    InvoiceItem: 'InvoiceItem',
    PaymentIntent: 'PaymentIntent',
    NextAction: 'NextAction',
    Invoice: 'Invoice',
    Card: 'Card',
    PlatformPlan: 'PlatformPlan',
    SubscriptionAccount: 'SubscriptionAccount',
    SetupIntent: 'SetupIntent',
    PaymentMethod: 'PaymentMethod',
    ConsoleInstance: 'ConsoleInstance',
    ConsoleInstanceOidc: 'ConsoleInstanceOidc',
    Recipe: 'Recipe',
    RecipeItem: 'RecipeItem',
    RecipeSection: 'RecipeSection',
    RecipeConfiguration: 'RecipeConfiguration',
    Stack: 'Stack',
    StackCollection: 'StackCollection',
    ApplyLock: 'ApplyLock',
    Category: 'Category',
    FileContent: 'FileContent',
    Repo: 'Repo',
    Repository: 'Repository',
    MarketplaceRepository: 'MarketplaceRepository',
    Dependencies: 'Dependencies',
    Integration: 'Integration',
    Role: 'Role',
    RoleBinding: 'RoleBinding',
    CloudShell: 'CloudShell',
    DemoProject: 'DemoProject',
    Terraform: 'Terraform',
    TerraformInstallation: 'TerraformInstallation',
    Step: 'Step',
    Test: 'Test',
    UpgradeQueue: 'UpgradeQueue',
    Rollout: 'Rollout',
    Upgrade: 'Upgrade',
    DeferredUpdate: 'DeferredUpdate',
    Account: 'Account',
    Group: 'Group',
    User: 'User',
    ImpersonationPolicy: 'ImpersonationPolicy',
    ImpersonationPolicyBinding: 'ImpersonationPolicyBinding',
    GroupMember: 'GroupMember',
    DomainMapping: 'DomainMapping',
    Token: 'Token',
    TokenAudit: 'TokenAudit',
    Address: 'Address',
    Publisher: 'Publisher',
    Webhook: 'Webhook',
    PublicKey: 'PublicKey',
    EabCredential: 'EabCredential',
    VersionTag: 'VersionTag',
    Version: 'Version'
  }
}