import { gql } from 'apollo-boost'
import { AuditFragment } from '../../models/account';
import { PageInfo } from '../../models/misc';
import { AccountFragment, GroupFragment, GroupMemberFragment, InviteFragment, RoleFragment, UserFragment } from '../../models/user';

export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($attributes: AccountAttributes!) {
    updateAccount(attributes: $attributes) {
      ...AccountFragment
    }
  }
  ${AccountFragment}
`;

export const USERS_Q = gql`
  query Users($q: String, $ursor: String) {
    users(q: $q, first: 20, after: $ursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...UserFragment }
      }
    }
  }
  ${PageInfo}
  ${UserFragment}
`;

export const GROUPS_Q = gql`
  query Groups($q: String, $cursor: String) {
    groups(q: $q, first: 20, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...GroupFragment }
      }
    }
  }
  ${PageInfo}
  ${GroupFragment}
`;

export const SEARCH_USERS = gql`
  query SearchUsers($q: String, $cursor: String) {
    users(q: $q, after: $cursor, first: 5) {
      pageInfo { ...PageInfo }
      edges {
        node { ...UserFragment }
      }
    }
  }
  ${PageInfo}
  ${UserFragment}
`

export const SEARCH_GROUPS = gql`
  query SearchGroups($q: String, $cursor: String) {
    groups(q: $q, after: $cursor, first: 5) {
      pageInfo { ...PageInfo }
      edges {
        node { ...GroupFragment }
      }
    }
  }
  ${PageInfo}
  ${GroupFragment}
`

export const GROUP_MEMBERS = gql`
  query GroupMembers($cursor: String, $id: ID!) {
    groupMembers(groupId: $id, after: $cursor, first: 20) {
      pageInfo { ...PageInfo }
      edges {
        node { ...GroupMemberFragment }
      }
    }
  }
  ${PageInfo}
  ${GroupMemberFragment}
`;

export const CREATE_GROUP_MEMBERS = gql`
  mutation CreateGroupMember($groupId: ID!, $userId: ID!) {
    createGroupMember(groupId: $groupId, userId: $userId) {
      ...GroupMemberFragment
    }
  }
  ${GroupMemberFragment}
`;

export const EDIT_USER = gql`
  mutation UpdateUser($id: ID, $attributes: UserAttributes!) {
    updateUser(id: $id, attributes: $attributes) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const CREATE_GROUP = gql`
  mutation CreateGroup($attributes: GroupAttributes!) {
    createGroup(attributes: $attributes) {
      ...GroupFragment
    }
  }
  ${GroupFragment}
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($id: ID!, $attributes: GroupAttributes!) {
    updateGroup(groupId: $id, attributes: $attributes) {
      ...GroupFragment
    }
  }
  ${GroupFragment}
`;

export const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    deleteGroup(groupId: $id) {
      ...GroupFragment
    }
  }
  ${GroupFragment}
`;

export const CREATE_INVITE = gql`
  mutation CreateInvite($attributes: InviteAttributes!) {
    createInvite(attributes: $attributes) {
      ...InviteFragment
    }
  }
  ${InviteFragment}
`;


export const CREATE_ROLE = gql`
  mutation CreateRole($attributes: RoleAttributes!) {
    createRole(attributes: $attributes) {
      ...RoleFragment
    }
  }
  ${RoleFragment}
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $attributes: RoleAttributes!) {
    updateRole(id: $id, attributes: $attributes) {
      ...RoleFragment
    }
  }
  ${RoleFragment}
`;

export const DELETE_ROLE = gql`
  mutation DeleteRow($id: ID!) {
    deleteRole(id: $id) {
      ...RoleFragment
    }
  }
  ${RoleFragment}
`;


export const ROLES_Q = gql`
  query Roles($cursor: String) {
    roles(first: 20, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...RoleFragment }
      }
    }
  }
  ${PageInfo}
  ${RoleFragment}
`;

export const AUDITS_Q = gql`
  query Audits($cursor: String) {
    audits(first: 50, after: $cursor) {
      pageInfo { ...PageInfo }
      edges { node { ...AuditFragment } }
    }
  }
  ${PageInfo}
  ${AuditFragment}
`