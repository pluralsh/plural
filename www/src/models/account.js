import gql from "graphql-tag";
import { VersionFragment } from "./chart";
import { IntegrationWebhookFragment } from "./integrations";
import { RepoFragment } from "./repo";
import { GroupFragment, RoleFragment, UserFragment } from "./user";

export const AuditFragment = gql`
  fragment AuditFragment on Audit {
    id
    action
    actor { ...UserFragment }
    repository { ...RepoFragment }
    group { ...GroupFragment }
    integrationWebhook { ...IntegrationWebhookFragment }
    role { ...RoleFragment }
    version { ...VersionFragment }
    image { id tag dockerRepository { name } }
    insertedAt
  }
  ${UserFragment}
  ${RepoFragment}
  ${GroupFragment}
  ${IntegrationWebhookFragment}
  ${RoleFragment}
  ${VersionFragment}
`