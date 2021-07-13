defmodule GraphQl.Schema.OAuth do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.OAuth

  object :oauth_response do
    field :redirect_to, non_null(:string)
  end

  object :ouath_configuration do
    field :issuer,                 :string
    field :authorization_endpoint, :string
    field :token_endpoint,         :string
    field :jwks_uri,               :string
    field :userinfo_endpoint,      :string
  end

  object :oauth_queries do
    field :oauth_login, :repository do
      arg :challenge, non_null(:string)

      resolve &OAuth.resolve_login/2
    end

    field :oauth_consent, :repository do
      arg :challenge, non_null(:string)

      resolve &OAuth.resolve_consent/2
    end
  end

  object :oauth_mutations do
    field :accept_login, :oauth_response do
      middleware Authenticated
      arg :challenge, non_null(:string)

      resolve &OAuth.accept_login/2
    end

    field :oauth_consent, :oauth_response do
      middleware Authenticated
      arg :challenge, non_null(:string)
      arg :scopes, list_of(:string)

      resolve &OAuth.accept_consent/2
    end
  end
end
