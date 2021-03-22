defmodule Core.Schema.Audit do
  use Piazza.Ecto.Schema
  alias Core.Schema

  schema "audit_logs" do
    field :action,  :string

    belongs_to :actor, Schema.User
    belongs_to :account, Schema.Account
    belongs_to :repository, Schema.Repository
    belongs_to :version, Schema.Version
    belongs_to :group, Schema.Group
    belongs_to :role, Schema.Role
    belongs_to :integration_webhook, Schema.IntegrationWebhook

    timestamps()
  end

  @valid ~w(action)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:actor_id)
    |> foreign_key_constraint(:account_id)
    |> foreign_key_constraint(:repository_id)
    |> foreign_key_constraint(:version_id)
    |> foreign_key_constraint(:group_id)
    |> foreign_key_constraint(:role_id)
    |> validate_required([:action, :actor_id])
  end
end
