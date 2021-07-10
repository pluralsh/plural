import { gql } from "apollo-boost";
import { GroupFragment, UserFragment } from "./user";

export const OIDCProvider = gql`
  fragment OIDCProvider on OidcProvider {
    id
    clientId
    clientSecret
    redirectUris
    bindings {
      id
      user { ...UserFragment }
      group { ...GroupFragment }
    }
  }
  ${UserFragment}
  ${GroupFragment}
`;