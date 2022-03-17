defmodule GraphQl.Schema.Scaffold do
  use GraphQl.Schema.Base

  alias GraphQl.Resolvers.Scaffolds

  object :terraform_provider do
    field :name,         :provider
    field :content,      :string
  end

  object :provider_queries do
    field :terraform_providers, list_of(:provider) do
      resolve &Scaffolds.list_providers/2
    end

    field :terraform_provider, :terraform_provider do
      arg :name,   non_null(:provider)
      arg :vsn,    :string

      resolve &Scaffolds.provider/2
    end
  end
end
