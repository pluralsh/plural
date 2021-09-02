defmodule Core.Schema.DnsAccessPolicy do
  use Piazza.Ecto.Schema
  alias Core.Schema.{DnsDomain, DnsAccessPolicyBinding}

  schema "dns_access_policies" do
    belongs_to :domain, DnsDomain

    has_many :bindings, DnsAccessPolicyBinding,
      on_replace: :delete,
      foreign_key: :policy_id

    timestamps()
  end

  @valid ~w(domain_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:bindings)
    |> unique_constraint(:domain_id)
    |> foreign_key_constraint(:domain_id)
  end
end
