defmodule Core.Schema.AccountOrganization do
  use Piazza.Ecto.Schema
  alias Core.Schema.Account

  schema "account_organizations" do
    field :organization_id, :string

    belongs_to :account, Account

    timestamps()
  end

  @valid ~w(organization_id account_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:organization_id)
    |> foreign_key_constraint(:account_id)
    |> validate_required(@valid)
  end
end
