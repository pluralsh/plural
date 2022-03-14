defmodule Core.Schema.DomainMapping do
  use Piazza.Ecto.Schema
  alias Core.Schema.Account

  schema "domain_mappings" do
    field :domain,       :string
    field :enable_sso,   :boolean
    belongs_to :account, Account

    timestamps()
  end

  @restricted ~w(gmail.com outlook.com hotmail.com yahoo.com)

  @valid ~w(domain account_id enable_sso)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:domain)
    |> validate_exclusion(:domain, @restricted, message: "cannot reserve any of [#{Enum.join(@restricted, ",")}]")
    |> foreign_key_constraint(:account_id)
    |> validate_required([:domain])
  end
end
