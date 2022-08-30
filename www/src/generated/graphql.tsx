import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Map: any;
  UploadOrUrl: any;
  Yaml: any;
};

export type Account = {
  __typename?: 'Account';
  backgroundColor?: Maybe<Scalars['String']>;
  billingCustomerId?: Maybe<Scalars['String']>;
  domainMappings?: Maybe<Array<Maybe<DomainMapping>>>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  rootUser?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  workosConnectionId?: Maybe<Scalars['String']>;
};

export type AccountAttributes = {
  domainMappings?: InputMaybe<Array<InputMaybe<DomainMappingInput>>>;
  icon?: InputMaybe<Scalars['UploadOrUrl']>;
  name?: InputMaybe<Scalars['String']>;
};

export type ActionItem = {
  __typename?: 'ActionItem';
  link: Scalars['String'];
  type: ActionItemType;
};

export type ActionItemAttributes = {
  link: Scalars['String'];
  type: ActionItemType;
};

export enum ActionItemType {
  Blog = 'BLOG',
  Issue = 'ISSUE',
  Pull = 'PULL'
}

export type Address = {
  __typename?: 'Address';
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  line1?: Maybe<Scalars['String']>;
  line2?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type AddressAttributes = {
  city: Scalars['String'];
  country: Scalars['String'];
  line1: Scalars['String'];
  line2: Scalars['String'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type ApplyLock = {
  __typename?: 'ApplyLock';
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  lock?: Maybe<Scalars['String']>;
  owner?: Maybe<User>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type Artifact = {
  __typename?: 'Artifact';
  arch?: Maybe<Scalars['String']>;
  blob?: Maybe<Scalars['String']>;
  filesize?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  platform?: Maybe<ArtifactPlatform>;
  readme?: Maybe<Scalars['String']>;
  sha?: Maybe<Scalars['String']>;
  type?: Maybe<ArtifactType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type ArtifactAttributes = {
  arch?: InputMaybe<Scalars['String']>;
  blob?: InputMaybe<Scalars['UploadOrUrl']>;
  name: Scalars['String'];
  platform: Scalars['String'];
  readme: Scalars['String'];
  type: Scalars['String'];
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
  action: Scalars['String'];
  actor?: Maybe<User>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  group?: Maybe<Group>;
  id: Scalars['ID'];
  image?: Maybe<DockerImage>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  integrationWebhook?: Maybe<IntegrationWebhook>;
  ip?: Maybe<Scalars['String']>;
  latitude?: Maybe<Scalars['String']>;
  longitude?: Maybe<Scalars['String']>;
  repository?: Maybe<Repository>;
  role?: Maybe<Role>;
  updatedAt?: Maybe<Scalars['DateTime']>;
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
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Audit>;
};

export type AuthorizationUrl = {
  __typename?: 'AuthorizationUrl';
  provider: ScmProvider;
  url: Scalars['String'];
};

export type AwsShellCredentialsAttributes = {
  accessKeyId: Scalars['String'];
  secretAccessKey: Scalars['String'];
};

export type BindingAttributes = {
  groupId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type Card = {
  __typename?: 'Card';
  brand: Scalars['String'];
  expMonth: Scalars['Int'];
  expYear: Scalars['Int'];
  id: Scalars['ID'];
  last4: Scalars['String'];
  name?: Maybe<Scalars['String']>;
};

export type CardConnection = {
  __typename?: 'CardConnection';
  edges?: Maybe<Array<Maybe<CardEdge>>>;
  pageInfo: PageInfo;
};

export type CardEdge = {
  __typename?: 'CardEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Card>;
};

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
  count?: Maybe<Scalars['Int']>;
  tags?: Maybe<GroupedTagConnection>;
};


export type CategoryInfoTagsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  q?: InputMaybe<Scalars['String']>;
};

export type ChangeInstructions = {
  __typename?: 'ChangeInstructions';
  instructions?: Maybe<Scalars['String']>;
  script?: Maybe<Scalars['String']>;
};

export type Chart = {
  __typename?: 'Chart';
  dependencies?: Maybe<Dependencies>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  installation?: Maybe<ChartInstallation>;
  latestVersion?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  repository?: Maybe<Repository>;
  tags?: Maybe<Array<Maybe<VersionTag>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
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
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Chart>;
};

export type ChartInstallation = {
  __typename?: 'ChartInstallation';
  chart?: Maybe<Chart>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  installation?: Maybe<Installation>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  version?: Maybe<Version>;
};

export type ChartInstallationAttributes = {
  chartId?: InputMaybe<Scalars['ID']>;
  versionId?: InputMaybe<Scalars['ID']>;
};

export type ChartInstallationConnection = {
  __typename?: 'ChartInstallationConnection';
  edges?: Maybe<Array<Maybe<ChartInstallationEdge>>>;
  pageInfo: PageInfo;
};

export type ChartInstallationEdge = {
  __typename?: 'ChartInstallationEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<ChartInstallation>;
};

export type ChartName = {
  chart?: InputMaybe<Scalars['String']>;
  repo?: InputMaybe<Scalars['String']>;
};

export type ClosureItem = {
  __typename?: 'ClosureItem';
  dep?: Maybe<Dependency>;
  helm?: Maybe<Chart>;
  terraform?: Maybe<Terraform>;
};

export type CloudShell = {
  __typename?: 'CloudShell';
  aesKey: Scalars['String'];
  alive: Scalars['Boolean'];
  cluster: Scalars['String'];
  gitUrl: Scalars['String'];
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  provider: Provider;
  status?: Maybe<ShellStatus>;
  subdomain: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type CloudShellAttributes = {
  credentials: ShellCredentialsAttributes;
  demoId?: InputMaybe<Scalars['ID']>;
  provider?: InputMaybe<Provider>;
  scm?: InputMaybe<ScmAttributes>;
  workspace: WorkspaceAttributes;
};

export type ClusterInformation = {
  __typename?: 'ClusterInformation';
  gitCommit?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  platform?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  version?: Maybe<Scalars['String']>;
};

export type ClusterInformationAttributes = {
  gitCommit?: InputMaybe<Scalars['String']>;
  platform?: InputMaybe<Scalars['String']>;
  version?: InputMaybe<Scalars['String']>;
};

export type ConsentRequest = {
  __typename?: 'ConsentRequest';
  requestedScope?: Maybe<Array<Maybe<Scalars['String']>>>;
  skip?: Maybe<Scalars['Boolean']>;
};

export type Crd = {
  __typename?: 'Crd';
  blob?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type CrdAttributes = {
  blob?: InputMaybe<Scalars['UploadOrUrl']>;
  name: Scalars['String'];
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

export type DeferredUpdate = {
  __typename?: 'DeferredUpdate';
  attempts?: Maybe<Scalars['Int']>;
  chartInstallation?: Maybe<ChartInstallation>;
  dequeueAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  terraformInstallation?: Maybe<TerraformInstallation>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  version?: Maybe<Version>;
};

export type DeferredUpdateConnection = {
  __typename?: 'DeferredUpdateConnection';
  edges?: Maybe<Array<Maybe<DeferredUpdateEdge>>>;
  pageInfo: PageInfo;
};

export type DeferredUpdateEdge = {
  __typename?: 'DeferredUpdateEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<DeferredUpdate>;
};

export enum Delta {
  Create = 'CREATE',
  Delete = 'DELETE',
  Update = 'UPDATE'
}

export type DemoProject = {
  __typename?: 'DemoProject';
  credentials?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  projectId: Scalars['String'];
  ready?: Maybe<Scalars['Boolean']>;
  state?: Maybe<DemoProjectState>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export enum DemoProjectState {
  Created = 'CREATED',
  Enabled = 'ENABLED',
  Ready = 'READY'
}

export type Dependencies = {
  __typename?: 'Dependencies';
  application?: Maybe<Scalars['Boolean']>;
  breaking?: Maybe<Scalars['Boolean']>;
  dependencies?: Maybe<Array<Maybe<Dependency>>>;
  instructions?: Maybe<ChangeInstructions>;
  outputs?: Maybe<Scalars['Map']>;
  providerVsn?: Maybe<Scalars['String']>;
  providerWirings?: Maybe<Scalars['Map']>;
  providers?: Maybe<Array<Maybe<Provider>>>;
  secrets?: Maybe<Array<Maybe<Scalars['String']>>>;
  wait?: Maybe<Scalars['Boolean']>;
  wirings?: Maybe<Wirings>;
};

export type Dependency = {
  __typename?: 'Dependency';
  name?: Maybe<Scalars['String']>;
  optional?: Maybe<Scalars['Boolean']>;
  repo?: Maybe<Scalars['String']>;
  type?: Maybe<DependencyType>;
  version?: Maybe<Scalars['String']>;
};

export enum DependencyType {
  Helm = 'HELM',
  Terraform = 'TERRAFORM'
}

export type DeviceLogin = {
  __typename?: 'DeviceLogin';
  deviceToken: Scalars['String'];
  loginUrl: Scalars['String'];
};

export type DnsAccessPolicy = {
  __typename?: 'DnsAccessPolicy';
  bindings?: Maybe<Array<Maybe<PolicyBinding>>>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type DnsAccessPolicyAttributes = {
  bindings?: InputMaybe<Array<InputMaybe<BindingAttributes>>>;
  id?: InputMaybe<Scalars['ID']>;
};

export type DnsDomain = {
  __typename?: 'DnsDomain';
  accessPolicy?: Maybe<DnsAccessPolicy>;
  account?: Maybe<Account>;
  creator?: Maybe<User>;
  dnsRecords?: Maybe<DnsRecordConnection>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type DnsDomainDnsRecordsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type DnsDomainAttributes = {
  accessPolicy?: InputMaybe<DnsAccessPolicyAttributes>;
  name?: InputMaybe<Scalars['String']>;
};

export type DnsDomainConnection = {
  __typename?: 'DnsDomainConnection';
  edges?: Maybe<Array<Maybe<DnsDomainEdge>>>;
  pageInfo: PageInfo;
};

export type DnsDomainEdge = {
  __typename?: 'DnsDomainEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<DnsDomain>;
};

export type DnsRecord = {
  __typename?: 'DnsRecord';
  cluster: Scalars['String'];
  creator?: Maybe<User>;
  domain?: Maybe<DnsDomain>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  provider: Provider;
  records?: Maybe<Array<Maybe<Scalars['String']>>>;
  type: DnsRecordType;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type DnsRecordAttributes = {
  name: Scalars['String'];
  records?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  type: DnsRecordType;
};

export type DnsRecordConnection = {
  __typename?: 'DnsRecordConnection';
  edges?: Maybe<Array<Maybe<DnsRecordEdge>>>;
  pageInfo: PageInfo;
};

export type DnsRecordEdge = {
  __typename?: 'DnsRecordEdge';
  cursor?: Maybe<Scalars['String']>;
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
  digest: Scalars['String'];
  dockerRepository?: Maybe<DockerRepository>;
  grade?: Maybe<ImageGrade>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  scannedAt?: Maybe<Scalars['DateTime']>;
  tag?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  vulnerabilities?: Maybe<Array<Maybe<Vulnerability>>>;
};

export type DockerImageConnection = {
  __typename?: 'DockerImageConnection';
  edges?: Maybe<Array<Maybe<DockerImageEdge>>>;
  pageInfo: PageInfo;
};

export type DockerImageEdge = {
  __typename?: 'DockerImageEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<DockerImage>;
};

export type DockerRepository = {
  __typename?: 'DockerRepository';
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  metrics?: Maybe<Array<Maybe<Metric>>>;
  name: Scalars['String'];
  public?: Maybe<Scalars['Boolean']>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type DockerRepositoryMetricsArgs = {
  offset?: InputMaybe<Scalars['String']>;
  precision?: InputMaybe<Scalars['String']>;
  tag?: InputMaybe<Scalars['String']>;
};

export type DockerRepositoryAttributes = {
  public: Scalars['Boolean'];
};

export type DockerRepositoryConnection = {
  __typename?: 'DockerRepositoryConnection';
  edges?: Maybe<Array<Maybe<DockerRepositoryEdge>>>;
  pageInfo: PageInfo;
};

export type DockerRepositoryEdge = {
  __typename?: 'DockerRepositoryEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<DockerRepository>;
};

export type DomainMapping = {
  __typename?: 'DomainMapping';
  account?: Maybe<Account>;
  domain: Scalars['String'];
  enableSso?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type DomainMappingInput = {
  domain?: InputMaybe<Scalars['String']>;
  enableSso?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['ID']>;
};

export type EabCredential = {
  __typename?: 'EabCredential';
  cluster: Scalars['String'];
  hmacKey: Scalars['String'];
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  keyId: Scalars['String'];
  provider: Provider;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type EntityAttributes = {
  endIndex?: InputMaybe<Scalars['Int']>;
  startIndex?: InputMaybe<Scalars['Int']>;
  text?: InputMaybe<Scalars['String']>;
  type: MessageEntityType;
  userId?: InputMaybe<Scalars['ID']>;
};

export type File = {
  __typename?: 'File';
  blob: Scalars['String'];
  contentType?: Maybe<Scalars['String']>;
  filename?: Maybe<Scalars['String']>;
  filesize?: Maybe<Scalars['Int']>;
  height?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  mediaType?: Maybe<MediaType>;
  message: IncidentMessage;
  updatedAt?: Maybe<Scalars['DateTime']>;
  width?: Maybe<Scalars['Int']>;
};

export type FileAttributes = {
  blob?: InputMaybe<Scalars['UploadOrUrl']>;
};

export type FileConnection = {
  __typename?: 'FileConnection';
  edges?: Maybe<Array<Maybe<FileEdge>>>;
  pageInfo: PageInfo;
};

export type FileEdge = {
  __typename?: 'FileEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<File>;
};

export type Follower = {
  __typename?: 'Follower';
  id: Scalars['ID'];
  incident?: Maybe<Incident>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  preferences?: Maybe<NotificationPreferences>;
  updatedAt?: Maybe<Scalars['DateTime']>;
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
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Follower>;
};

export type GcpShellCredentialsAttributes = {
  applicationCredentials: Scalars['String'];
};

export type GeoMetric = {
  __typename?: 'GeoMetric';
  count?: Maybe<Scalars['Int']>;
  country?: Maybe<Scalars['String']>;
};

export type Group = {
  __typename?: 'Group';
  description?: Maybe<Scalars['String']>;
  global?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type GroupAttributes = {
  description?: InputMaybe<Scalars['String']>;
  global?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
};

export type GroupConnection = {
  __typename?: 'GroupConnection';
  edges?: Maybe<Array<Maybe<GroupEdge>>>;
  pageInfo: PageInfo;
};

export type GroupEdge = {
  __typename?: 'GroupEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Group>;
};

export type GroupMember = {
  __typename?: 'GroupMember';
  group?: Maybe<Group>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type GroupMemberConnection = {
  __typename?: 'GroupMemberConnection';
  edges?: Maybe<Array<Maybe<GroupMemberEdge>>>;
  pageInfo: PageInfo;
};

export type GroupMemberEdge = {
  __typename?: 'GroupMemberEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<GroupMember>;
};

export type GroupedTag = {
  __typename?: 'GroupedTag';
  count: Scalars['Int'];
  tag: Scalars['String'];
};

export type GroupedTagConnection = {
  __typename?: 'GroupedTagConnection';
  edges?: Maybe<Array<Maybe<GroupedTagEdge>>>;
  pageInfo: PageInfo;
};

export type GroupedTagEdge = {
  __typename?: 'GroupedTagEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<GroupedTag>;
};

export type ImageDependency = {
  __typename?: 'ImageDependency';
  id: Scalars['ID'];
  image: DockerImage;
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
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
  diffId?: Maybe<Scalars['String']>;
  digest?: Maybe<Scalars['String']>;
};

export type ImpersonationPolicy = {
  __typename?: 'ImpersonationPolicy';
  bindings?: Maybe<Array<Maybe<ImpersonationPolicyBinding>>>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type ImpersonationPolicyAttributes = {
  bindings?: InputMaybe<Array<InputMaybe<ImpersonationPolicyBindingAttributes>>>;
  id?: InputMaybe<Scalars['ID']>;
};

export type ImpersonationPolicyBinding = {
  __typename?: 'ImpersonationPolicyBinding';
  group?: Maybe<Group>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type ImpersonationPolicyBindingAttributes = {
  groupId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type Incident = {
  __typename?: 'Incident';
  clusterInformation?: Maybe<ClusterInformation>;
  creator: User;
  description?: Maybe<Scalars['String']>;
  files?: Maybe<FileConnection>;
  follower?: Maybe<Follower>;
  followers?: Maybe<FollowerConnection>;
  history?: Maybe<IncidentHistoryConnection>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  messages?: Maybe<IncidentMessageConnection>;
  nextResponseAt?: Maybe<Scalars['DateTime']>;
  notificationCount?: Maybe<Scalars['Int']>;
  owner?: Maybe<User>;
  postmortem?: Maybe<Postmortem>;
  repository: Repository;
  severity: Scalars['Int'];
  status: IncidentStatus;
  subscription?: Maybe<SlimSubscription>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  title: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type IncidentFilesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IncidentFollowersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IncidentHistoryArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IncidentMessagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
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
  description?: InputMaybe<Scalars['String']>;
  severity?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<IncidentStatus>;
  tags?: InputMaybe<Array<InputMaybe<TagAttributes>>>;
  title?: InputMaybe<Scalars['String']>;
};

export type IncidentChange = {
  __typename?: 'IncidentChange';
  key: Scalars['String'];
  next?: Maybe<Scalars['String']>;
  prev?: Maybe<Scalars['String']>;
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
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Incident>;
};

export type IncidentFilter = {
  statuses?: InputMaybe<Array<InputMaybe<IncidentStatus>>>;
  type: IncidentFilterType;
  value?: InputMaybe<Scalars['String']>;
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
  id: Scalars['ID'];
  incident: Incident;
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type IncidentHistoryConnection = {
  __typename?: 'IncidentHistoryConnection';
  edges?: Maybe<Array<Maybe<IncidentHistoryEdge>>>;
  pageInfo: PageInfo;
};

export type IncidentHistoryEdge = {
  __typename?: 'IncidentHistoryEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<IncidentHistory>;
};

export type IncidentMessage = {
  __typename?: 'IncidentMessage';
  creator: User;
  entities?: Maybe<Array<Maybe<MessageEntity>>>;
  file?: Maybe<File>;
  id: Scalars['ID'];
  incident: Incident;
  insertedAt?: Maybe<Scalars['DateTime']>;
  reactions?: Maybe<Array<Maybe<Reaction>>>;
  text: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type IncidentMessageAttributes = {
  entities?: InputMaybe<Array<InputMaybe<EntityAttributes>>>;
  file?: InputMaybe<FileAttributes>;
  text: Scalars['String'];
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
  cursor?: Maybe<Scalars['String']>;
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

export type Installation = {
  __typename?: 'Installation';
  acmeKeyId?: Maybe<Scalars['String']>;
  acmeSecret?: Maybe<Scalars['String']>;
  autoUpgrade?: Maybe<Scalars['Boolean']>;
  context?: Maybe<Scalars['Map']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  license?: Maybe<Scalars['String']>;
  licenseKey?: Maybe<Scalars['String']>;
  oidcProvider?: Maybe<OidcProvider>;
  repository?: Maybe<Repository>;
  subscription?: Maybe<RepositorySubscription>;
  trackTag: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type InstallationAttributes = {
  autoUpgrade?: InputMaybe<Scalars['Boolean']>;
  context?: InputMaybe<Scalars['Yaml']>;
  trackTag?: InputMaybe<Scalars['String']>;
};

export type InstallationConnection = {
  __typename?: 'InstallationConnection';
  edges?: Maybe<Array<Maybe<InstallationEdge>>>;
  pageInfo: PageInfo;
};

export type InstallationEdge = {
  __typename?: 'InstallationEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Installation>;
};

export type Integration = {
  __typename?: 'Integration';
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  publisher?: Maybe<Publisher>;
  repository?: Maybe<Repository>;
  sourceUrl?: Maybe<Scalars['String']>;
  spec?: Maybe<Scalars['Map']>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type IntegrationAttributes = {
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['UploadOrUrl']>;
  name: Scalars['String'];
  sourceUrl?: InputMaybe<Scalars['String']>;
  spec?: InputMaybe<Scalars['Yaml']>;
  tags?: InputMaybe<Array<InputMaybe<TagAttributes>>>;
  type?: InputMaybe<Scalars['String']>;
};

export type IntegrationConnection = {
  __typename?: 'IntegrationConnection';
  edges?: Maybe<Array<Maybe<IntegrationEdge>>>;
  pageInfo: PageInfo;
};

export type IntegrationEdge = {
  __typename?: 'IntegrationEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Integration>;
};

export type IntegrationWebhook = {
  __typename?: 'IntegrationWebhook';
  account?: Maybe<Account>;
  actions?: Maybe<Array<Maybe<Scalars['String']>>>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  logs?: Maybe<WebhookLogConnection>;
  name: Scalars['String'];
  secret: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
  url: Scalars['String'];
};


export type IntegrationWebhookLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type IntegrationWebhookAttributes = {
  actions?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name: Scalars['String'];
  url: Scalars['String'];
};

export type IntegrationWebhookConnection = {
  __typename?: 'IntegrationWebhookConnection';
  edges?: Maybe<Array<Maybe<IntegrationWebhookEdge>>>;
  pageInfo: PageInfo;
};

export type IntegrationWebhookEdge = {
  __typename?: 'IntegrationWebhookEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<IntegrationWebhook>;
};

export type Invite = {
  __typename?: 'Invite';
  account?: Maybe<Account>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  secureId: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type InviteAttributes = {
  email?: InputMaybe<Scalars['String']>;
};

export type InviteConnection = {
  __typename?: 'InviteConnection';
  edges?: Maybe<Array<Maybe<InviteEdge>>>;
  pageInfo: PageInfo;
};

export type InviteEdge = {
  __typename?: 'InviteEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Invite>;
};

export type Invoice = {
  __typename?: 'Invoice';
  amountDue: Scalars['Int'];
  amountPaid: Scalars['Int'];
  createdAt?: Maybe<Scalars['DateTime']>;
  currency: Scalars['String'];
  hostedInvoiceUrl?: Maybe<Scalars['String']>;
  lines?: Maybe<Array<Maybe<InvoiceItem>>>;
  number: Scalars['String'];
  status?: Maybe<Scalars['String']>;
};

export type InvoiceConnection = {
  __typename?: 'InvoiceConnection';
  edges?: Maybe<Array<Maybe<InvoiceEdge>>>;
  pageInfo: PageInfo;
};

export type InvoiceEdge = {
  __typename?: 'InvoiceEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Invoice>;
};

export type InvoiceItem = {
  __typename?: 'InvoiceItem';
  amount: Scalars['Int'];
  currency: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type License = {
  __typename?: 'License';
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type Limit = {
  __typename?: 'Limit';
  dimension: Scalars['String'];
  quantity: Scalars['Int'];
};

export type LimitAttributes = {
  dimension: Scalars['String'];
  quantity: Scalars['Int'];
};

export type LineItem = {
  __typename?: 'LineItem';
  cost: Scalars['Int'];
  dimension: Scalars['String'];
  name: Scalars['String'];
  period?: Maybe<Scalars['String']>;
  type?: Maybe<PlanType>;
};

export type LineItemAttributes = {
  cost: Scalars['Int'];
  dimension: Scalars['String'];
  name: Scalars['String'];
  period: Scalars['String'];
  type?: InputMaybe<PlanType>;
};

export type LockAttributes = {
  lock: Scalars['String'];
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
  authorizeUrl?: Maybe<Scalars['String']>;
  loginMethod: LoginMethod;
  token?: Maybe<Scalars['String']>;
};

export type LoginRequest = {
  __typename?: 'LoginRequest';
  requestedScope?: Maybe<Array<Maybe<Scalars['String']>>>;
  subject?: Maybe<Scalars['String']>;
};

export enum MediaType {
  Audio = 'AUDIO',
  Image = 'IMAGE',
  Other = 'OTHER',
  Pdf = 'PDF',
  Video = 'VIDEO'
}

export type MeetingAttributes = {
  incidentId?: InputMaybe<Scalars['ID']>;
  topic: Scalars['String'];
};

export type MessageEntity = {
  __typename?: 'MessageEntity';
  endIndex?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  startIndex?: Maybe<Scalars['Int']>;
  text?: Maybe<Scalars['String']>;
  type: MessageEntityType;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export enum MessageEntityType {
  Emoji = 'EMOJI',
  Mention = 'MENTION'
}

export type Metric = {
  __typename?: 'Metric';
  name: Scalars['String'];
  tags?: Maybe<Array<Maybe<MetricTag>>>;
  values?: Maybe<Array<Maybe<MetricValue>>>;
};

export type MetricTag = {
  __typename?: 'MetricTag';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type MetricValue = {
  __typename?: 'MetricValue';
  time?: Maybe<Scalars['DateTime']>;
  value?: Maybe<Scalars['Int']>;
};

export type Notification = {
  __typename?: 'Notification';
  actor: User;
  id: Scalars['ID'];
  incident?: Maybe<Incident>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  message?: Maybe<IncidentMessage>;
  msg?: Maybe<Scalars['String']>;
  repository?: Maybe<Repository>;
  type: NotificationType;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user: User;
};

export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  edges?: Maybe<Array<Maybe<NotificationEdge>>>;
  pageInfo: PageInfo;
};

export type NotificationEdge = {
  __typename?: 'NotificationEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Notification>;
};

export type NotificationPreferences = {
  __typename?: 'NotificationPreferences';
  incidentUpdate?: Maybe<Scalars['Boolean']>;
  mention?: Maybe<Scalars['Boolean']>;
  message?: Maybe<Scalars['Boolean']>;
};

export type NotificationPreferencesAttributes = {
  incidentUpdate: Scalars['Boolean'];
  mention: Scalars['Boolean'];
  message: Scalars['Boolean'];
};

export enum NotificationType {
  IncidentUpdate = 'INCIDENT_UPDATE',
  Locked = 'LOCKED',
  Mention = 'MENTION',
  Message = 'MESSAGE'
}

export type OauthAttributes = {
  code?: InputMaybe<Scalars['String']>;
  redirectUri?: InputMaybe<Scalars['String']>;
  service?: InputMaybe<OauthService>;
};

export type OauthInfo = {
  __typename?: 'OauthInfo';
  authorizeUrl: Scalars['String'];
  provider: OauthProvider;
};

export type OauthIntegration = {
  __typename?: 'OauthIntegration';
  account?: Maybe<Account>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  service: OauthService;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export enum OauthProvider {
  Github = 'GITHUB',
  Gitlab = 'GITLAB',
  Google = 'GOOGLE'
}

export type OauthResponse = {
  __typename?: 'OauthResponse';
  redirectTo: Scalars['String'];
};

export enum OauthService {
  Zoom = 'ZOOM'
}

export type OauthSettings = {
  __typename?: 'OauthSettings';
  authMethod: OidcAuthMethod;
  uriFormat: Scalars['String'];
};

export type OauthSettingsAttributes = {
  authMethod: OidcAuthMethod;
  uriFormat: Scalars['String'];
};

export type OidcAttributes = {
  authMethod: OidcAuthMethod;
  bindings?: InputMaybe<Array<InputMaybe<BindingAttributes>>>;
  redirectUris?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export enum OidcAuthMethod {
  Basic = 'BASIC',
  Post = 'POST'
}

export type OidcLogin = {
  __typename?: 'OidcLogin';
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  ip?: Maybe<Scalars['String']>;
  latitude?: Maybe<Scalars['String']>;
  longitude?: Maybe<Scalars['String']>;
  owner?: Maybe<User>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type OidcLoginConnection = {
  __typename?: 'OidcLoginConnection';
  edges?: Maybe<Array<Maybe<OidcLoginEdge>>>;
  pageInfo: PageInfo;
};

export type OidcLoginEdge = {
  __typename?: 'OidcLoginEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<OidcLogin>;
};

export type OidcProvider = {
  __typename?: 'OidcProvider';
  authMethod: OidcAuthMethod;
  bindings?: Maybe<Array<Maybe<OidcProviderBinding>>>;
  clientId: Scalars['String'];
  clientSecret: Scalars['String'];
  configuration?: Maybe<OuathConfiguration>;
  consent?: Maybe<ConsentRequest>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  redirectUris?: Maybe<Array<Maybe<Scalars['String']>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type OidcProviderBinding = {
  __typename?: 'OidcProviderBinding';
  group?: Maybe<Group>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type OidcSettings = {
  __typename?: 'OidcSettings';
  authMethod: OidcAuthMethod;
  domainKey?: Maybe<Scalars['String']>;
  subdomain?: Maybe<Scalars['Boolean']>;
  uriFormat?: Maybe<Scalars['String']>;
  uriFormats?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type OidcSettingsAttributes = {
  authMethod: OidcAuthMethod;
  domainKey?: InputMaybe<Scalars['String']>;
  subdomain?: InputMaybe<Scalars['Boolean']>;
  uriFormat?: InputMaybe<Scalars['String']>;
  uriFormats?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type OidcStepResponse = {
  __typename?: 'OidcStepResponse';
  consent?: Maybe<ConsentRequest>;
  login?: Maybe<LoginRequest>;
  repository?: Maybe<Repository>;
};

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
  authorizationEndpoint?: Maybe<Scalars['String']>;
  issuer?: Maybe<Scalars['String']>;
  jwksUri?: Maybe<Scalars['String']>;
  tokenEndpoint?: Maybe<Scalars['String']>;
  userinfoEndpoint?: Maybe<Scalars['String']>;
};

export type PackageScan = {
  __typename?: 'PackageScan';
  errors?: Maybe<Array<Maybe<ScanError>>>;
  grade?: Maybe<ImageGrade>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  violations?: Maybe<Array<Maybe<ScanViolation>>>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

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
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  metrics?: Maybe<Array<Maybe<GeoMetric>>>;
  token?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type PersistedTokenAuditsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type PersistedTokenAudit = {
  __typename?: 'PersistedTokenAudit';
  city?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['Int']>;
  country?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  ip?: Maybe<Scalars['String']>;
  latitude?: Maybe<Scalars['String']>;
  longitude?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type PersistedTokenAuditConnection = {
  __typename?: 'PersistedTokenAuditConnection';
  edges?: Maybe<Array<Maybe<PersistedTokenAuditEdge>>>;
  pageInfo: PageInfo;
};

export type PersistedTokenAuditEdge = {
  __typename?: 'PersistedTokenAuditEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<PersistedTokenAudit>;
};

export type PersistedTokenConnection = {
  __typename?: 'PersistedTokenConnection';
  edges?: Maybe<Array<Maybe<PersistedTokenEdge>>>;
  pageInfo: PageInfo;
};

export type PersistedTokenEdge = {
  __typename?: 'PersistedTokenEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<PersistedToken>;
};

export type Plan = {
  __typename?: 'Plan';
  cost: Scalars['Int'];
  default?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  lineItems?: Maybe<PlanLineItems>;
  metadata?: Maybe<PlanMetadata>;
  name: Scalars['String'];
  period?: Maybe<Scalars['String']>;
  serviceLevels?: Maybe<Array<Maybe<ServiceLevel>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  visible: Scalars['Boolean'];
};

export type PlanAttributes = {
  cost: Scalars['Int'];
  default?: InputMaybe<Scalars['Boolean']>;
  lineItems?: InputMaybe<PlanLineItemAttributes>;
  metadata?: InputMaybe<PlanMetadataAttributes>;
  name: Scalars['String'];
  period: Scalars['String'];
  serviceLevels?: InputMaybe<Array<InputMaybe<ServiceLevelAttributes>>>;
};

export type PlanFeature = {
  __typename?: 'PlanFeature';
  description: Scalars['String'];
  name: Scalars['String'];
};

export type PlanFeatureAttributes = {
  description: Scalars['String'];
  name: Scalars['String'];
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
  freeform?: Maybe<Scalars['Map']>;
};

export type PlanMetadataAttributes = {
  features?: InputMaybe<Array<InputMaybe<PlanFeatureAttributes>>>;
  freeform?: InputMaybe<Scalars['Yaml']>;
};

export enum PlanType {
  Licensed = 'LICENSED',
  Metered = 'METERED'
}

export type PlatformMetrics = {
  __typename?: 'PlatformMetrics';
  clusters?: Maybe<Scalars['Int']>;
  publishers?: Maybe<Scalars['Int']>;
  repositories?: Maybe<Scalars['Int']>;
  rollouts?: Maybe<Scalars['Int']>;
};

export type PluralConfiguration = {
  __typename?: 'PluralConfiguration';
  gitCommit?: Maybe<Scalars['String']>;
  registry?: Maybe<Scalars['String']>;
  stripeConnectId?: Maybe<Scalars['String']>;
  stripePublishableKey?: Maybe<Scalars['String']>;
};

export type PolicyBinding = {
  __typename?: 'PolicyBinding';
  group?: Maybe<Group>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type Postmortem = {
  __typename?: 'Postmortem';
  actionItems?: Maybe<Array<Maybe<ActionItem>>>;
  content: Scalars['String'];
  creator: User;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type PostmortemAttributes = {
  actionItems?: InputMaybe<Array<InputMaybe<ActionItemAttributes>>>;
  content: Scalars['String'];
};

export enum Provider {
  Aws = 'AWS',
  Azure = 'AZURE',
  Custom = 'CUSTOM',
  Equinix = 'EQUINIX',
  Gcp = 'GCP',
  Kind = 'KIND',
  Kubernetes = 'KUBERNETES'
}

export type PublicKey = {
  __typename?: 'PublicKey';
  content: Scalars['String'];
  digest: Scalars['String'];
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
  user: User;
};

export type PublicKeyAttributes = {
  content: Scalars['String'];
  name: Scalars['String'];
};

export type PublicKeyConnection = {
  __typename?: 'PublicKeyConnection';
  edges?: Maybe<Array<Maybe<PublicKeyEdge>>>;
  pageInfo: PageInfo;
};

export type PublicKeyEdge = {
  __typename?: 'PublicKeyEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<PublicKey>;
};

export type Publisher = {
  __typename?: 'Publisher';
  address?: Maybe<Address>;
  avatar?: Maybe<Scalars['String']>;
  backgroundColor?: Maybe<Scalars['String']>;
  billingAccountId?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  owner?: Maybe<User>;
  phone?: Maybe<Scalars['String']>;
  repositories?: Maybe<Array<Maybe<Repository>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type PublisherAttributes = {
  address?: InputMaybe<AddressAttributes>;
  avatar?: InputMaybe<Scalars['UploadOrUrl']>;
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
};

export type PublisherConnection = {
  __typename?: 'PublisherConnection';
  edges?: Maybe<Array<Maybe<PublisherEdge>>>;
  pageInfo: PageInfo;
};

export type PublisherEdge = {
  __typename?: 'PublisherEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Publisher>;
};

export type Reaction = {
  __typename?: 'Reaction';
  creator: User;
  insertedAt?: Maybe<Scalars['DateTime']>;
  message: IncidentMessage;
  name: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type Recipe = {
  __typename?: 'Recipe';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  oidcSettings?: Maybe<OidcSettings>;
  private?: Maybe<Scalars['Boolean']>;
  provider?: Maybe<Provider>;
  recipeDependencies?: Maybe<Array<Maybe<Recipe>>>;
  recipeSections?: Maybe<Array<Maybe<RecipeSection>>>;
  repository?: Maybe<Repository>;
  restricted?: Maybe<Scalars['Boolean']>;
  tests?: Maybe<Array<Maybe<RecipeTest>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type RecipeAttributes = {
  dependencies?: InputMaybe<Array<InputMaybe<RecipeDependencyAttributes>>>;
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  oidcSettings?: InputMaybe<OidcSettingsAttributes>;
  private?: InputMaybe<Scalars['Boolean']>;
  provider?: InputMaybe<Provider>;
  restricted?: InputMaybe<Scalars['Boolean']>;
  sections?: InputMaybe<Array<InputMaybe<RecipeSectionAttributes>>>;
  tests?: InputMaybe<Array<InputMaybe<RecipeTestAttributes>>>;
};

export type RecipeCondition = {
  __typename?: 'RecipeCondition';
  field: Scalars['String'];
  operation: Operation;
  value?: Maybe<Scalars['String']>;
};

export type RecipeConditionAttributes = {
  field: Scalars['String'];
  operation: Operation;
  value?: InputMaybe<Scalars['String']>;
};

export type RecipeConfiguration = {
  __typename?: 'RecipeConfiguration';
  args?: Maybe<Array<Maybe<Scalars['String']>>>;
  condition?: Maybe<RecipeCondition>;
  default?: Maybe<Scalars['String']>;
  documentation?: Maybe<Scalars['String']>;
  functionName?: Maybe<Scalars['String']>;
  longform?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  optional?: Maybe<Scalars['Boolean']>;
  placeholder?: Maybe<Scalars['String']>;
  type?: Maybe<Datatype>;
  validation?: Maybe<RecipeValidation>;
};

export type RecipeConfigurationAttributes = {
  condition?: InputMaybe<RecipeConditionAttributes>;
  default?: InputMaybe<Scalars['String']>;
  documentation?: InputMaybe<Scalars['String']>;
  functionName?: InputMaybe<Scalars['String']>;
  longform?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  optional?: InputMaybe<Scalars['Boolean']>;
  placeholder?: InputMaybe<Scalars['String']>;
  type: Datatype;
  validation?: InputMaybe<RecipeValidationAttributes>;
};

export type RecipeConnection = {
  __typename?: 'RecipeConnection';
  edges?: Maybe<Array<Maybe<RecipeEdge>>>;
  pageInfo: PageInfo;
};

export type RecipeDependencyAttributes = {
  name: Scalars['String'];
  repo: Scalars['String'];
};

export type RecipeEdge = {
  __typename?: 'RecipeEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Recipe>;
};

export type RecipeItem = {
  __typename?: 'RecipeItem';
  chart?: Maybe<Chart>;
  configuration?: Maybe<Array<Maybe<RecipeConfiguration>>>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  recipeSection?: Maybe<RecipeSection>;
  terraform?: Maybe<Terraform>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type RecipeItemAttributes = {
  configuration?: InputMaybe<Array<InputMaybe<RecipeConfigurationAttributes>>>;
  name: Scalars['String'];
  type: RecipeItemType;
};

export enum RecipeItemType {
  Helm = 'HELM',
  Terraform = 'TERRAFORM'
}

export type RecipeSection = {
  __typename?: 'RecipeSection';
  configuration?: Maybe<Array<Maybe<RecipeConfiguration>>>;
  id?: Maybe<Scalars['ID']>;
  index?: Maybe<Scalars['Int']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  recipe?: Maybe<Recipe>;
  recipeItems?: Maybe<Array<Maybe<RecipeItem>>>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type RecipeSectionAttributes = {
  configuration?: InputMaybe<Array<InputMaybe<RecipeConfigurationAttributes>>>;
  items?: InputMaybe<Array<InputMaybe<RecipeItemAttributes>>>;
  name: Scalars['String'];
};

export type RecipeTest = {
  __typename?: 'RecipeTest';
  args?: Maybe<Array<Maybe<TestArgument>>>;
  message?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  type: TestType;
};

export type RecipeTestAttributes = {
  args?: InputMaybe<Array<InputMaybe<TestArgumentAttributes>>>;
  message?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  type: TestType;
};

export type RecipeValidation = {
  __typename?: 'RecipeValidation';
  message: Scalars['String'];
  regex?: Maybe<Scalars['String']>;
  type: ValidationType;
};

export type RecipeValidationAttributes = {
  message: Scalars['String'];
  regex?: InputMaybe<Scalars['String']>;
  type: ValidationType;
};

export type Repository = {
  __typename?: 'Repository';
  artifacts?: Maybe<Array<Maybe<Artifact>>>;
  category?: Maybe<Category>;
  darkIcon?: Maybe<Scalars['String']>;
  defaultTag?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  documentation?: Maybe<Scalars['String']>;
  editable?: Maybe<Scalars['Boolean']>;
  gitUrl?: Maybe<Scalars['String']>;
  homepage?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  installation?: Maybe<Installation>;
  license?: Maybe<License>;
  name: Scalars['String'];
  notes?: Maybe<Scalars['String']>;
  oauthSettings?: Maybe<OauthSettings>;
  plans?: Maybe<Array<Maybe<Plan>>>;
  private?: Maybe<Scalars['Boolean']>;
  publicKey?: Maybe<Scalars['String']>;
  publisher?: Maybe<Publisher>;
  readme?: Maybe<Scalars['String']>;
  recipes?: Maybe<Array<Maybe<Recipe>>>;
  secrets?: Maybe<Scalars['Map']>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type RepositoryAttributes = {
  category?: InputMaybe<Category>;
  darkIcon?: InputMaybe<Scalars['UploadOrUrl']>;
  defaultTag?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  documentation?: InputMaybe<Scalars['String']>;
  gitUrl?: InputMaybe<Scalars['String']>;
  homepage?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['UploadOrUrl']>;
  integrationResourceDefinition?: InputMaybe<ResourceDefinitionAttributes>;
  name?: InputMaybe<Scalars['String']>;
  notes?: InputMaybe<Scalars['String']>;
  oauthSettings?: InputMaybe<OauthSettingsAttributes>;
  private?: InputMaybe<Scalars['Boolean']>;
  readme?: InputMaybe<Scalars['String']>;
  secrets?: InputMaybe<Scalars['Yaml']>;
  tags?: InputMaybe<Array<InputMaybe<TagAttributes>>>;
};

export type RepositoryConnection = {
  __typename?: 'RepositoryConnection';
  edges?: Maybe<Array<Maybe<RepositoryEdge>>>;
  pageInfo: PageInfo;
};

export type RepositoryEdge = {
  __typename?: 'RepositoryEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Repository>;
};

export type RepositorySubscription = {
  __typename?: 'RepositorySubscription';
  customerId?: Maybe<Scalars['String']>;
  externalId?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  installation?: Maybe<Installation>;
  invoices?: Maybe<InvoiceConnection>;
  lineItems?: Maybe<SubscriptionLineItems>;
  plan?: Maybe<Plan>;
};


export type RepositorySubscriptionInvoicesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type RepositorySubscriptionConnection = {
  __typename?: 'RepositorySubscriptionConnection';
  edges?: Maybe<Array<Maybe<RepositorySubscriptionEdge>>>;
  pageInfo: PageInfo;
};

export type RepositorySubscriptionEdge = {
  __typename?: 'RepositorySubscriptionEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<RepositorySubscription>;
};

export type ResetToken = {
  __typename?: 'ResetToken';
  email: Scalars['String'];
  externalId: Scalars['ID'];
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  type: ResetTokenType;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user: User;
};

export type ResetTokenAttributes = {
  email?: InputMaybe<Scalars['String']>;
  type: ResetTokenType;
};

export type ResetTokenRealization = {
  password?: InputMaybe<Scalars['String']>;
};

export enum ResetTokenType {
  Email = 'EMAIL',
  Password = 'PASSWORD'
}

export type ResourceDefinitionAttributes = {
  name: Scalars['String'];
  spec?: InputMaybe<Array<InputMaybe<SpecificationAttributes>>>;
};

export type Role = {
  __typename?: 'Role';
  account?: Maybe<Account>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  permissions?: Maybe<Array<Maybe<Permission>>>;
  repositories?: Maybe<Array<Maybe<Scalars['String']>>>;
  roleBindings?: Maybe<Array<Maybe<RoleBinding>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type RoleAttributes = {
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  permissions?: InputMaybe<Array<InputMaybe<Permission>>>;
  repositories?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  roleBindings?: InputMaybe<Array<InputMaybe<BindingAttributes>>>;
};

export type RoleBinding = {
  __typename?: 'RoleBinding';
  group?: Maybe<Group>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type RoleConnection = {
  __typename?: 'RoleConnection';
  edges?: Maybe<Array<Maybe<RoleEdge>>>;
  pageInfo: PageInfo;
};

export type RoleEdge = {
  __typename?: 'RoleEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Role>;
};

export type Roles = {
  __typename?: 'Roles';
  admin?: Maybe<Scalars['Boolean']>;
};

export type RolesAttributes = {
  admin?: InputMaybe<Scalars['Boolean']>;
};

export type Rollout = {
  __typename?: 'Rollout';
  count?: Maybe<Scalars['Int']>;
  cursor?: Maybe<Scalars['ID']>;
  event?: Maybe<Scalars['String']>;
  heartbeat?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  repository?: Maybe<Repository>;
  status: RolloutStatus;
  updatedAt?: Maybe<Scalars['DateTime']>;
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
  cursor?: Maybe<Scalars['String']>;
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
  completeIncident?: Maybe<Incident>;
  createArtifact?: Maybe<Artifact>;
  createCard?: Maybe<Account>;
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
  createMessage?: Maybe<IncidentMessage>;
  createOauthIntegration?: Maybe<OauthIntegration>;
  createOidcProvider?: Maybe<OidcProvider>;
  createPlan?: Maybe<Plan>;
  createPublicKey?: Maybe<PublicKey>;
  createPublisher?: Maybe<Publisher>;
  createQueue?: Maybe<UpgradeQueue>;
  createReaction?: Maybe<IncidentMessage>;
  createRecipe?: Maybe<Recipe>;
  createRepository?: Maybe<Repository>;
  createResetToken?: Maybe<Scalars['Boolean']>;
  createRole?: Maybe<Role>;
  createServiceAccount?: Maybe<User>;
  createShell?: Maybe<CloudShell>;
  createSubscription?: Maybe<RepositorySubscription>;
  createTerraform?: Maybe<Terraform>;
  createTest?: Maybe<Test>;
  createToken?: Maybe<PersistedToken>;
  createUserEvent?: Maybe<Scalars['Boolean']>;
  createWebhook?: Maybe<Webhook>;
  createZoom?: Maybe<ZoomMeeting>;
  deleteCard?: Maybe<Account>;
  deleteDnsRecord?: Maybe<DnsRecord>;
  deleteDomain?: Maybe<DnsDomain>;
  deleteEabKey?: Maybe<EabCredential>;
  deleteGroup?: Maybe<Group>;
  deleteGroupMember?: Maybe<GroupMember>;
  deleteIncident?: Maybe<Incident>;
  deleteInstallation?: Maybe<Installation>;
  deleteIntegrationWebhook?: Maybe<IntegrationWebhook>;
  deleteInvite?: Maybe<Invite>;
  deleteMessage?: Maybe<IncidentMessage>;
  deletePublicKey?: Maybe<PublicKey>;
  deleteReaction?: Maybe<IncidentMessage>;
  deleteRecipe?: Maybe<Recipe>;
  deleteRepository?: Maybe<Repository>;
  deleteRole?: Maybe<Role>;
  deleteShell?: Maybe<CloudShell>;
  deleteTerraform?: Maybe<Terraform>;
  deleteToken?: Maybe<PersistedToken>;
  deleteUser?: Maybe<User>;
  deviceLogin?: Maybe<DeviceLogin>;
  externalToken?: Maybe<Scalars['String']>;
  followIncident?: Maybe<Follower>;
  impersonateServiceAccount?: Maybe<User>;
  installChart?: Maybe<ChartInstallation>;
  installRecipe?: Maybe<Array<Maybe<Installation>>>;
  installTerraform?: Maybe<TerraformInstallation>;
  linkPublisher?: Maybe<Publisher>;
  login?: Maybe<User>;
  loginToken?: Maybe<User>;
  oauthCallback?: Maybe<User>;
  oauthConsent?: Maybe<OauthResponse>;
  passwordlessLogin?: Maybe<User>;
  pingWebhook?: Maybe<WebhookResponse>;
  provisionDomain?: Maybe<DnsDomain>;
  publishLogs?: Maybe<TestStep>;
  readNotifications?: Maybe<Scalars['Int']>;
  realizeInvite?: Maybe<User>;
  realizeResetToken?: Maybe<Scalars['Boolean']>;
  rebootShell?: Maybe<CloudShell>;
  releaseLock?: Maybe<ApplyLock>;
  resetInstallations?: Maybe<Scalars['Int']>;
  signup?: Maybe<User>;
  ssoCallback?: Maybe<User>;
  unfollowIncident?: Maybe<Follower>;
  uninstallTerraform?: Maybe<TerraformInstallation>;
  unlockRepository?: Maybe<Scalars['Int']>;
  updateAccount?: Maybe<Account>;
  updateChart?: Maybe<Chart>;
  updateChartInstallation?: Maybe<ChartInstallation>;
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
  updatePublisher?: Maybe<Publisher>;
  updateRepository?: Maybe<Repository>;
  updateRole?: Maybe<Role>;
  updateServiceAccount?: Maybe<User>;
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
  id: Scalars['ID'];
};


export type RootMutationTypeAcceptLoginArgs = {
  challenge: Scalars['String'];
};


export type RootMutationTypeAcquireLockArgs = {
  repository: Scalars['String'];
};


export type RootMutationTypeCompleteIncidentArgs = {
  id: Scalars['ID'];
  postmortem: PostmortemAttributes;
};


export type RootMutationTypeCreateArtifactArgs = {
  attributes: ArtifactAttributes;
  repositoryId?: InputMaybe<Scalars['ID']>;
  repositoryName?: InputMaybe<Scalars['String']>;
};


export type RootMutationTypeCreateCardArgs = {
  source: Scalars['String'];
};


export type RootMutationTypeCreateCrdArgs = {
  attributes: CrdAttributes;
  chartId?: InputMaybe<Scalars['ID']>;
  chartName?: InputMaybe<ChartName>;
};


export type RootMutationTypeCreateDnsRecordArgs = {
  attributes: DnsRecordAttributes;
  cluster: Scalars['String'];
  provider: Provider;
};


export type RootMutationTypeCreateDomainArgs = {
  attributes: DnsDomainAttributes;
};


export type RootMutationTypeCreateGroupArgs = {
  attributes: GroupAttributes;
};


export type RootMutationTypeCreateGroupMemberArgs = {
  groupId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeCreateIncidentArgs = {
  attributes: IncidentAttributes;
  repository?: InputMaybe<Scalars['String']>;
  repositoryId?: InputMaybe<Scalars['ID']>;
};


export type RootMutationTypeCreateInstallationArgs = {
  repositoryId: Scalars['ID'];
};


export type RootMutationTypeCreateIntegrationArgs = {
  attributes: IntegrationAttributes;
  repositoryName: Scalars['String'];
};


export type RootMutationTypeCreateIntegrationWebhookArgs = {
  attributes: IntegrationWebhookAttributes;
};


export type RootMutationTypeCreateInviteArgs = {
  attributes: InviteAttributes;
};


export type RootMutationTypeCreateMessageArgs = {
  attributes: IncidentMessageAttributes;
  incidentId: Scalars['ID'];
};


export type RootMutationTypeCreateOauthIntegrationArgs = {
  attributes: OauthAttributes;
};


export type RootMutationTypeCreateOidcProviderArgs = {
  attributes: OidcAttributes;
  installationId: Scalars['ID'];
};


export type RootMutationTypeCreatePlanArgs = {
  attributes: PlanAttributes;
  repositoryId: Scalars['ID'];
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
  messageId: Scalars['ID'];
  name: Scalars['String'];
};


export type RootMutationTypeCreateRecipeArgs = {
  attributes: RecipeAttributes;
  repositoryId?: InputMaybe<Scalars['String']>;
  repositoryName?: InputMaybe<Scalars['String']>;
};


export type RootMutationTypeCreateRepositoryArgs = {
  attributes: RepositoryAttributes;
  id?: InputMaybe<Scalars['ID']>;
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


export type RootMutationTypeCreateSubscriptionArgs = {
  attributes?: InputMaybe<SubscriptionAttributes>;
  installationId: Scalars['ID'];
  planId: Scalars['ID'];
};


export type RootMutationTypeCreateTerraformArgs = {
  attributes: TerraformAttributes;
  repositoryId: Scalars['ID'];
};


export type RootMutationTypeCreateTestArgs = {
  attributes: TestAttributes;
  name?: InputMaybe<Scalars['String']>;
  repositoryId?: InputMaybe<Scalars['ID']>;
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


export type RootMutationTypeDeleteCardArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteDnsRecordArgs = {
  name: Scalars['String'];
  type: DnsRecordType;
};


export type RootMutationTypeDeleteDomainArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteEabKeyArgs = {
  cluster?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  provider?: InputMaybe<Provider>;
};


export type RootMutationTypeDeleteGroupArgs = {
  groupId: Scalars['ID'];
};


export type RootMutationTypeDeleteGroupMemberArgs = {
  groupId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeDeleteIncidentArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteInstallationArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteIntegrationWebhookArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteInviteArgs = {
  secureId: Scalars['String'];
};


export type RootMutationTypeDeleteMessageArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeletePublicKeyArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteReactionArgs = {
  messageId: Scalars['ID'];
  name: Scalars['String'];
};


export type RootMutationTypeDeleteRecipeArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteRepositoryArgs = {
  repositoryId: Scalars['ID'];
};


export type RootMutationTypeDeleteRoleArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteTerraformArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteTokenArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDeleteUserArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeFollowIncidentArgs = {
  attributes: FollowerAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeImpersonateServiceAccountArgs = {
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
};


export type RootMutationTypeInstallChartArgs = {
  attributes: ChartInstallationAttributes;
  installationId: Scalars['ID'];
};


export type RootMutationTypeInstallRecipeArgs = {
  context: Scalars['Map'];
  recipeId: Scalars['ID'];
};


export type RootMutationTypeInstallTerraformArgs = {
  attributes: TerraformInstallationAttributes;
  installationId: Scalars['ID'];
};


export type RootMutationTypeLinkPublisherArgs = {
  token: Scalars['String'];
};


export type RootMutationTypeLoginArgs = {
  deviceToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
};


export type RootMutationTypeLoginTokenArgs = {
  deviceToken?: InputMaybe<Scalars['String']>;
  token: Scalars['String'];
};


export type RootMutationTypeOauthCallbackArgs = {
  code: Scalars['String'];
  deviceToken?: InputMaybe<Scalars['String']>;
  host?: InputMaybe<Scalars['String']>;
  provider: OauthProvider;
};


export type RootMutationTypeOauthConsentArgs = {
  challenge: Scalars['String'];
  scopes?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type RootMutationTypePasswordlessLoginArgs = {
  token: Scalars['String'];
};


export type RootMutationTypePingWebhookArgs = {
  id: Scalars['ID'];
  message?: InputMaybe<Scalars['String']>;
  repo: Scalars['String'];
};


export type RootMutationTypeProvisionDomainArgs = {
  name: Scalars['String'];
};


export type RootMutationTypePublishLogsArgs = {
  id: Scalars['ID'];
  logs: Scalars['String'];
};


export type RootMutationTypeReadNotificationsArgs = {
  incidentId?: InputMaybe<Scalars['ID']>;
};


export type RootMutationTypeRealizeInviteArgs = {
  id: Scalars['String'];
};


export type RootMutationTypeRealizeResetTokenArgs = {
  attributes: ResetTokenRealization;
  id: Scalars['ID'];
};


export type RootMutationTypeReleaseLockArgs = {
  attributes: LockAttributes;
  repository: Scalars['String'];
};


export type RootMutationTypeSignupArgs = {
  account?: InputMaybe<AccountAttributes>;
  attributes: UserAttributes;
  deviceToken?: InputMaybe<Scalars['String']>;
  inviteId?: InputMaybe<Scalars['String']>;
};


export type RootMutationTypeSsoCallbackArgs = {
  code: Scalars['String'];
  deviceToken?: InputMaybe<Scalars['String']>;
};


export type RootMutationTypeUnfollowIncidentArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeUninstallTerraformArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeUnlockRepositoryArgs = {
  name: Scalars['String'];
};


export type RootMutationTypeUpdateAccountArgs = {
  attributes: AccountAttributes;
};


export type RootMutationTypeUpdateChartArgs = {
  attributes: ChartAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateChartInstallationArgs = {
  attributes: ChartInstallationAttributes;
  chartInstallationId: Scalars['ID'];
};


export type RootMutationTypeUpdateDockerRepositoryArgs = {
  attributes: DockerRepositoryAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateDomainArgs = {
  attributes: DnsDomainAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateGroupArgs = {
  attributes: GroupAttributes;
  groupId: Scalars['ID'];
};


export type RootMutationTypeUpdateIncidentArgs = {
  attributes: IncidentAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateInstallationArgs = {
  attributes: InstallationAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateIntegrationWebhookArgs = {
  attributes: IntegrationWebhookAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateLineItemArgs = {
  attributes: LimitAttributes;
  subscriptionId: Scalars['ID'];
};


export type RootMutationTypeUpdateMessageArgs = {
  attributes: IncidentMessageAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateOidcProviderArgs = {
  attributes: OidcAttributes;
  installationId: Scalars['ID'];
};


export type RootMutationTypeUpdatePlanArgs = {
  planId: Scalars['ID'];
  subscriptionId: Scalars['ID'];
};


export type RootMutationTypeUpdatePlanAttributesArgs = {
  attributes: UpdatablePlanAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdatePublisherArgs = {
  attributes: PublisherAttributes;
};


export type RootMutationTypeUpdateRepositoryArgs = {
  attributes: RepositoryAttributes;
  repositoryId?: InputMaybe<Scalars['ID']>;
  repositoryName?: InputMaybe<Scalars['String']>;
};


export type RootMutationTypeUpdateRoleArgs = {
  attributes: RoleAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateServiceAccountArgs = {
  attributes: ServiceAccountAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateStepArgs = {
  attributes: TestStepAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateTerraformArgs = {
  attributes: TerraformAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateTestArgs = {
  attributes: TestAttributes;
  id: Scalars['ID'];
};


export type RootMutationTypeUpdateUserArgs = {
  attributes: UserAttributes;
  id?: InputMaybe<Scalars['ID']>;
};


export type RootMutationTypeUpdateVersionArgs = {
  attributes: VersionAttributes;
  id?: InputMaybe<Scalars['ID']>;
  spec?: InputMaybe<VersionSpec>;
};


export type RootMutationTypeUploadTerraformArgs = {
  attributes: TerraformAttributes;
  name: Scalars['String'];
  repositoryName: Scalars['String'];
};


export type RootMutationTypeUpsertOidcProviderArgs = {
  attributes: OidcAttributes;
  installationId: Scalars['ID'];
};


export type RootMutationTypeUpsertRepositoryArgs = {
  attributes: RepositoryAttributes;
  name: Scalars['String'];
  publisher: Scalars['String'];
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  auditMetrics?: Maybe<Array<Maybe<GeoMetric>>>;
  audits?: Maybe<AuditConnection>;
  categories?: Maybe<Array<Maybe<CategoryInfo>>>;
  category?: Maybe<CategoryInfo>;
  chart?: Maybe<Chart>;
  chartInstallations?: Maybe<ChartInstallationConnection>;
  charts?: Maybe<ChartConnection>;
  closure?: Maybe<Array<Maybe<ClosureItem>>>;
  configuration?: Maybe<PluralConfiguration>;
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
  incident?: Maybe<Incident>;
  incidents?: Maybe<IncidentConnection>;
  installation?: Maybe<Installation>;
  installations?: Maybe<InstallationConnection>;
  integrationWebhook?: Maybe<IntegrationWebhook>;
  integrationWebhooks?: Maybe<IntegrationWebhookConnection>;
  integrations?: Maybe<IntegrationConnection>;
  invite?: Maybe<Invite>;
  invites?: Maybe<InviteConnection>;
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
  platformMetrics?: Maybe<PlatformMetrics>;
  publicKeys?: Maybe<PublicKeyConnection>;
  publisher?: Maybe<Publisher>;
  publishers?: Maybe<PublisherConnection>;
  recipe?: Maybe<Recipe>;
  recipes?: Maybe<RecipeConnection>;
  repositories?: Maybe<RepositoryConnection>;
  repository?: Maybe<Repository>;
  repositorySubscription?: Maybe<RepositorySubscription>;
  resetToken?: Maybe<ResetToken>;
  role?: Maybe<Role>;
  roles?: Maybe<RoleConnection>;
  rollouts?: Maybe<RolloutConnection>;
  scaffold?: Maybe<Array<Maybe<ScaffoldFile>>>;
  scmAuthorization?: Maybe<Array<Maybe<AuthorizationUrl>>>;
  scmToken?: Maybe<Scalars['String']>;
  searchRepositories?: Maybe<RepositoryConnection>;
  searchUsers?: Maybe<UserConnection>;
  shell?: Maybe<CloudShell>;
  subscriptions?: Maybe<RepositorySubscriptionConnection>;
  tags?: Maybe<GroupedTagConnection>;
  terraform?: Maybe<TerraformConnection>;
  terraformInstallations?: Maybe<TerraformInstallationConnection>;
  terraformModule?: Maybe<Terraform>;
  terraformProvider?: Maybe<TerraformProvider>;
  terraformProviders?: Maybe<Array<Maybe<Provider>>>;
  test?: Maybe<Test>;
  testLogs?: Maybe<Scalars['String']>;
  tests?: Maybe<TestConnection>;
  token?: Maybe<PersistedToken>;
  tokens?: Maybe<PersistedTokenConnection>;
  upgradeQueue?: Maybe<UpgradeQueue>;
  upgradeQueues?: Maybe<Array<Maybe<UpgradeQueue>>>;
  users?: Maybe<UserConnection>;
  versions?: Maybe<VersionConnection>;
  webhooks?: Maybe<WebhookConnection>;
};


export type RootQueryTypeAuditsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeCategoryArgs = {
  name: Category;
};


export type RootQueryTypeChartArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeChartInstallationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  repositoryId: Scalars['ID'];
};


export type RootQueryTypeChartsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  repositoryId: Scalars['ID'];
};


export type RootQueryTypeClosureArgs = {
  id: Scalars['ID'];
  type: DependencyType;
};


export type RootQueryTypeDeferredUpdatesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  chartInstallationId?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  terraformInstallationId?: InputMaybe<Scalars['ID']>;
};


export type RootQueryTypeDemoProjectArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeDnsDomainArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeDnsDomainsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeDnsRecordsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  cluster?: InputMaybe<Scalars['String']>;
  domainId?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  provider?: InputMaybe<Provider>;
};


export type RootQueryTypeDockerImageArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeDockerImagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  dockerRepositoryId: Scalars['ID'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeDockerRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  repositoryId: Scalars['ID'];
};


export type RootQueryTypeEabCredentialArgs = {
  cluster: Scalars['String'];
  provider: Provider;
};


export type RootQueryTypeGroupMembersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId: Scalars['ID'];
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  q?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeIncidentArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeIncidentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<Array<InputMaybe<IncidentFilter>>>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Order>;
  q?: InputMaybe<Scalars['String']>;
  repositoryId?: InputMaybe<Scalars['ID']>;
  sort?: InputMaybe<IncidentSort>;
  supports?: InputMaybe<Scalars['Boolean']>;
};


export type RootQueryTypeInstallationArgs = {
  id?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeInstallationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeIntegrationWebhookArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeIntegrationWebhooksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeIntegrationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  repositoryId?: InputMaybe<Scalars['ID']>;
  repositoryName?: InputMaybe<Scalars['String']>;
  tag?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeInviteArgs = {
  id: Scalars['String'];
};


export type RootQueryTypeInvitesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeLoginMethodArgs = {
  email: Scalars['String'];
  host?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeNotificationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  cli?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  incidentId?: InputMaybe<Scalars['ID']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeOauthConsentArgs = {
  challenge: Scalars['String'];
};


export type RootQueryTypeOauthLoginArgs = {
  challenge: Scalars['String'];
};


export type RootQueryTypeOauthUrlsArgs = {
  host?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeOidcConsentArgs = {
  challenge: Scalars['String'];
};


export type RootQueryTypeOidcLoginArgs = {
  challenge: Scalars['String'];
};


export type RootQueryTypeOidcLoginsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypePublicKeysArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypePublisherArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type RootQueryTypePublishersArgs = {
  accountId?: InputMaybe<Scalars['ID']>;
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  publishable?: InputMaybe<Scalars['Boolean']>;
};


export type RootQueryTypeRecipeArgs = {
  id?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
  repo?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeRecipesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  provider?: InputMaybe<Provider>;
  repositoryId?: InputMaybe<Scalars['ID']>;
  repositoryName?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  categories?: InputMaybe<Array<InputMaybe<Category>>>;
  category?: InputMaybe<Category>;
  first?: InputMaybe<Scalars['Int']>;
  installed?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  publisherId?: InputMaybe<Scalars['ID']>;
  publishers?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  q?: InputMaybe<Scalars['String']>;
  supports?: InputMaybe<Scalars['Boolean']>;
  tag?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type RootQueryTypeRepositoryArgs = {
  id?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeRepositorySubscriptionArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeResetTokenArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeRoleArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeRolesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  q?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['ID']>;
};


export type RootQueryTypeRolloutsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  repositoryId: Scalars['ID'];
};


export type RootQueryTypeScaffoldArgs = {
  application: Scalars['String'];
  category: Category;
  ingress?: InputMaybe<Scalars['Boolean']>;
  postgres?: InputMaybe<Scalars['Boolean']>;
  publisher: Scalars['String'];
};


export type RootQueryTypeScmTokenArgs = {
  code: Scalars['String'];
  provider: ScmProvider;
};


export type RootQueryTypeSearchRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
};


export type RootQueryTypeSearchUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  incidentId: Scalars['ID'];
  last?: InputMaybe<Scalars['Int']>;
  q: Scalars['String'];
};


export type RootQueryTypeSubscriptionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeTagsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['ID']>;
  last?: InputMaybe<Scalars['Int']>;
  q?: InputMaybe<Scalars['String']>;
  type: TagGroup;
};


export type RootQueryTypeTerraformArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  repositoryId: Scalars['ID'];
};


export type RootQueryTypeTerraformInstallationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  repositoryId: Scalars['ID'];
};


export type RootQueryTypeTerraformModuleArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeTerraformProviderArgs = {
  name: Provider;
  vsn?: InputMaybe<Scalars['String']>;
};


export type RootQueryTypeTestArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeTestLogsArgs = {
  id: Scalars['ID'];
  step: Scalars['ID'];
};


export type RootQueryTypeTestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  repositoryId?: InputMaybe<Scalars['ID']>;
  versionId?: InputMaybe<Scalars['ID']>;
};


export type RootQueryTypeTokenArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeTokensArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type RootQueryTypeUpgradeQueueArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type RootQueryTypeUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  all?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  q?: InputMaybe<Scalars['String']>;
  serviceAccount?: InputMaybe<Scalars['Boolean']>;
};


export type RootQueryTypeVersionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  chartId?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  terraformId?: InputMaybe<Scalars['ID']>;
};


export type RootQueryTypeWebhooksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
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
  incidentId?: InputMaybe<Scalars['ID']>;
  repositoryId?: InputMaybe<Scalars['ID']>;
};


export type RootSubscriptionTypeIncidentMessageDeltaArgs = {
  incidentId?: InputMaybe<Scalars['ID']>;
};


export type RootSubscriptionTypeRolloutDeltaArgs = {
  repositoryId: Scalars['ID'];
};


export type RootSubscriptionTypeTestDeltaArgs = {
  repositoryId: Scalars['ID'];
};


export type RootSubscriptionTypeTestLogsArgs = {
  testId: Scalars['ID'];
};


export type RootSubscriptionTypeUpgradeArgs = {
  id?: InputMaybe<Scalars['ID']>;
};

export type ScaffoldFile = {
  __typename?: 'ScaffoldFile';
  content?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
};

export type ScanError = {
  __typename?: 'ScanError';
  message?: Maybe<Scalars['String']>;
};

export type ScanViolation = {
  __typename?: 'ScanViolation';
  category?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  file?: Maybe<Scalars['String']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  line?: Maybe<Scalars['Int']>;
  resourceName?: Maybe<Scalars['String']>;
  resourceType?: Maybe<Scalars['String']>;
  ruleId?: Maybe<Scalars['String']>;
  ruleName?: Maybe<Scalars['String']>;
  severity?: Maybe<VulnGrade>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type ScmAttributes = {
  name: Scalars['String'];
  org?: InputMaybe<Scalars['String']>;
  provider?: InputMaybe<ScmProvider>;
  token: Scalars['String'];
};

export enum ScmProvider {
  Github = 'GITHUB',
  Gitlab = 'GITLAB'
}

export type ServiceAccountAttributes = {
  email?: InputMaybe<Scalars['String']>;
  impersonationPolicy?: InputMaybe<ImpersonationPolicyAttributes>;
  name?: InputMaybe<Scalars['String']>;
};

export type ServiceLevel = {
  __typename?: 'ServiceLevel';
  maxSeverity?: Maybe<Scalars['Int']>;
  minSeverity?: Maybe<Scalars['Int']>;
  responseTime?: Maybe<Scalars['Int']>;
};

export type ServiceLevelAttributes = {
  maxSeverity?: InputMaybe<Scalars['Int']>;
  minSeverity?: InputMaybe<Scalars['Int']>;
  responseTime?: InputMaybe<Scalars['Int']>;
};

export type ShellCredentialsAttributes = {
  aws?: InputMaybe<AwsShellCredentialsAttributes>;
  gcp?: InputMaybe<GcpShellCredentialsAttributes>;
};

export type ShellStatus = {
  __typename?: 'ShellStatus';
  containersReady?: Maybe<Scalars['Boolean']>;
  initialized?: Maybe<Scalars['Boolean']>;
  podScheduled?: Maybe<Scalars['Boolean']>;
  ready?: Maybe<Scalars['Boolean']>;
};

export type SlimSubscription = {
  __typename?: 'SlimSubscription';
  id: Scalars['ID'];
  lineItems?: Maybe<SubscriptionLineItems>;
  plan?: Maybe<Plan>;
};

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
  name: Scalars['String'];
  required?: InputMaybe<Scalars['Boolean']>;
  spec?: InputMaybe<Array<InputMaybe<SpecificationAttributes>>>;
  type: SpecDatatype;
};

export type StepLogs = {
  __typename?: 'StepLogs';
  logs?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  id: Scalars['ID'];
  tag: Scalars['String'];
};

export type TagAttributes = {
  tag: Scalars['String'];
};

export enum TagGroup {
  Integrations = 'INTEGRATIONS',
  Repositories = 'REPOSITORIES'
}

export type Terraform = {
  __typename?: 'Terraform';
  dependencies?: Maybe<Dependencies>;
  description?: Maybe<Scalars['String']>;
  editable?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  installation?: Maybe<TerraformInstallation>;
  latestVersion?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  package?: Maybe<Scalars['String']>;
  readme?: Maybe<Scalars['String']>;
  repository?: Maybe<Repository>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  valuesTemplate?: Maybe<Scalars['String']>;
};

export type TerraformAttributes = {
  dependencies?: InputMaybe<Scalars['Yaml']>;
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  package?: InputMaybe<Scalars['UploadOrUrl']>;
  version?: InputMaybe<Scalars['String']>;
};

export type TerraformConnection = {
  __typename?: 'TerraformConnection';
  edges?: Maybe<Array<Maybe<TerraformEdge>>>;
  pageInfo: PageInfo;
};

export type TerraformEdge = {
  __typename?: 'TerraformEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Terraform>;
};

export type TerraformInstallation = {
  __typename?: 'TerraformInstallation';
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  installation?: Maybe<Installation>;
  terraform?: Maybe<Terraform>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  version?: Maybe<Version>;
};

export type TerraformInstallationAttributes = {
  terraformId?: InputMaybe<Scalars['ID']>;
  versionId?: InputMaybe<Scalars['ID']>;
};

export type TerraformInstallationConnection = {
  __typename?: 'TerraformInstallationConnection';
  edges?: Maybe<Array<Maybe<TerraformInstallationEdge>>>;
  pageInfo: PageInfo;
};

export type TerraformInstallationEdge = {
  __typename?: 'TerraformInstallationEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<TerraformInstallation>;
};

export type TerraformProvider = {
  __typename?: 'TerraformProvider';
  content?: Maybe<Scalars['String']>;
  name?: Maybe<Provider>;
};

export type Test = {
  __typename?: 'Test';
  creator?: Maybe<User>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  promoteTag: Scalars['String'];
  repository?: Maybe<Repository>;
  sourceTag: Scalars['String'];
  status: TestStatus;
  steps?: Maybe<Array<Maybe<TestStep>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type TestArgument = {
  __typename?: 'TestArgument';
  key: Scalars['String'];
  name: Scalars['String'];
  repo: Scalars['String'];
};

export type TestArgumentAttributes = {
  key: Scalars['String'];
  name: Scalars['String'];
  repo: Scalars['String'];
};

export type TestAttributes = {
  name?: InputMaybe<Scalars['String']>;
  promoteTag?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<TestStatus>;
  steps?: InputMaybe<Array<InputMaybe<TestStepAttributes>>>;
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
  cursor?: Maybe<Scalars['String']>;
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
  description: Scalars['String'];
  hasLogs?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  status: TestStatus;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type TestStepAttributes = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  logs?: InputMaybe<Scalars['UploadOrUrl']>;
  name?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<TestStatus>;
};

export enum TestType {
  Git = 'GIT'
}

export type UpdatablePlanAttributes = {
  default?: InputMaybe<Scalars['Boolean']>;
  serviceLevels?: InputMaybe<Array<InputMaybe<ServiceLevelAttributes>>>;
};

export type Upgrade = {
  __typename?: 'Upgrade';
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  message?: Maybe<Scalars['String']>;
  repository?: Maybe<Repository>;
  type?: Maybe<UpgradeType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type UpgradeConnection = {
  __typename?: 'UpgradeConnection';
  edges?: Maybe<Array<Maybe<UpgradeEdge>>>;
  pageInfo: PageInfo;
};

export type UpgradeEdge = {
  __typename?: 'UpgradeEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Upgrade>;
};

export type UpgradeQueue = {
  __typename?: 'UpgradeQueue';
  acked?: Maybe<Scalars['ID']>;
  domain?: Maybe<Scalars['String']>;
  git?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  pingedAt?: Maybe<Scalars['DateTime']>;
  provider?: Maybe<Provider>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  upgrades?: Maybe<UpgradeConnection>;
  user: User;
};


export type UpgradeQueueUpgradesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type UpgradeQueueAttributes = {
  domain?: InputMaybe<Scalars['String']>;
  git?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
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
  Deploy = 'DEPLOY'
}

export type User = {
  __typename?: 'User';
  account?: Maybe<Account>;
  address?: Maybe<Address>;
  avatar?: Maybe<Scalars['String']>;
  backgroundColor?: Maybe<Scalars['String']>;
  cards?: Maybe<CardConnection>;
  defaultQueueId?: Maybe<Scalars['ID']>;
  email: Scalars['String'];
  emailConfirmBy?: Maybe<Scalars['DateTime']>;
  emailConfirmed?: Maybe<Scalars['Boolean']>;
  hasInstallations?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  impersonationPolicy?: Maybe<ImpersonationPolicy>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  jwt?: Maybe<Scalars['String']>;
  loginMethod?: Maybe<LoginMethod>;
  name: Scalars['String'];
  onboarding?: Maybe<OnboardingState>;
  phone?: Maybe<Scalars['String']>;
  provider?: Maybe<Provider>;
  publisher?: Maybe<Publisher>;
  roles?: Maybe<Roles>;
  serviceAccount?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type UserCardsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type UserAttributes = {
  avatar?: InputMaybe<Scalars['UploadOrUrl']>;
  email?: InputMaybe<Scalars['String']>;
  loginMethod?: InputMaybe<LoginMethod>;
  name?: InputMaybe<Scalars['String']>;
  onboarding?: InputMaybe<OnboardingState>;
  password?: InputMaybe<Scalars['String']>;
  roles?: InputMaybe<RolesAttributes>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  pageInfo: PageInfo;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<User>;
};

export type UserEventAttributes = {
  data?: InputMaybe<Scalars['String']>;
  event: Scalars['String'];
  status?: InputMaybe<UserEventStatus>;
};

export enum UserEventStatus {
  Error = 'ERROR',
  Ok = 'OK'
}

export enum ValidationType {
  Regex = 'REGEX'
}

export type Version = {
  __typename?: 'Version';
  chart?: Maybe<Chart>;
  crds?: Maybe<Array<Maybe<Crd>>>;
  dependencies?: Maybe<Dependencies>;
  helm?: Maybe<Scalars['Map']>;
  id: Scalars['ID'];
  imageDependencies?: Maybe<Array<Maybe<ImageDependency>>>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  package?: Maybe<Scalars['String']>;
  readme?: Maybe<Scalars['String']>;
  scan?: Maybe<PackageScan>;
  tags?: Maybe<Array<Maybe<VersionTag>>>;
  terraform?: Maybe<Terraform>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  valuesTemplate?: Maybe<Scalars['String']>;
  version: Scalars['String'];
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
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Version>;
};

export type VersionSpec = {
  chart?: InputMaybe<Scalars['String']>;
  repository?: InputMaybe<Scalars['String']>;
  terraform?: InputMaybe<Scalars['String']>;
  version?: InputMaybe<Scalars['String']>;
};

export type VersionTag = {
  __typename?: 'VersionTag';
  chart?: Maybe<Chart>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  tag: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
  version?: Maybe<Version>;
};

export type VersionTagAttributes = {
  tag: Scalars['String'];
  versionId?: InputMaybe<Scalars['ID']>;
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
  description?: Maybe<Scalars['String']>;
  fixedVersion?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  installedVersion?: Maybe<Scalars['String']>;
  layer?: Maybe<ImageLayer>;
  package?: Maybe<Scalars['String']>;
  score?: Maybe<Scalars['Float']>;
  severity?: Maybe<VulnGrade>;
  source?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  url?: Maybe<Scalars['String']>;
  vulnerabilityId?: Maybe<Scalars['String']>;
};

export type Webhook = {
  __typename?: 'Webhook';
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['DateTime']>;
  secret?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  url?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type WebhookAttributes = {
  url: Scalars['String'];
};

export type WebhookConnection = {
  __typename?: 'WebhookConnection';
  edges?: Maybe<Array<Maybe<WebhookEdge>>>;
  pageInfo: PageInfo;
};

export type WebhookEdge = {
  __typename?: 'WebhookEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Webhook>;
};

export type WebhookLog = {
  __typename?: 'WebhookLog';
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  payload?: Maybe<Scalars['Map']>;
  response?: Maybe<Scalars['String']>;
  state: WebhookLogState;
  status?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  webhook?: Maybe<IntegrationWebhook>;
};

export type WebhookLogConnection = {
  __typename?: 'WebhookLogConnection';
  edges?: Maybe<Array<Maybe<WebhookLogEdge>>>;
  pageInfo: PageInfo;
};

export type WebhookLogEdge = {
  __typename?: 'WebhookLogEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<WebhookLog>;
};

export enum WebhookLogState {
  Delivered = 'DELIVERED',
  Failed = 'FAILED',
  Sending = 'SENDING'
}

export type WebhookResponse = {
  __typename?: 'WebhookResponse';
  body?: Maybe<Scalars['String']>;
  headers?: Maybe<Scalars['Map']>;
  statusCode: Scalars['Int'];
};

export type Wirings = {
  __typename?: 'Wirings';
  helm?: Maybe<Scalars['Map']>;
  terraform?: Maybe<Scalars['Map']>;
};

export type WorkspaceAttributes = {
  bucketPrefix: Scalars['String'];
  cluster: Scalars['String'];
  project?: InputMaybe<Scalars['String']>;
  region: Scalars['String'];
  subdomain: Scalars['String'];
};

export type ZoomMeeting = {
  __typename?: 'ZoomMeeting';
  joinUrl: Scalars['String'];
  password?: Maybe<Scalars['String']>;
};
