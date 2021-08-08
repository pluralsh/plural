defmodule Core.Schema.Audit do
  use Piazza.Ecto.Schema
  alias Core.Schema

  schema "audit_logs" do
    field :action,    :string
    field :ip,        :string
    field :country,   :string
    field :city,      :string
    field :latitude,  :string
    field :longitude, :string

    belongs_to :actor, Schema.User
    belongs_to :account, Schema.Account
    belongs_to :repository, Schema.Repository
    belongs_to :version, Schema.Version
    belongs_to :group, Schema.Group
    belongs_to :role, Schema.Role
    belongs_to :integration_webhook, Schema.IntegrationWebhook
    belongs_to :image, Schema.DockerImage

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(a in query, where: a.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(a in query, order_by: ^order)
  end

  def created_after(query \\ __MODULE__, dt) do
    from(a in query, where: a.inserted_at >= ^dt)
  end

  def aggregate(query \\ __MODULE__) do
    from(a in query,
      where: not is_nil(a.country),
      group_by: a.country,
      select: %{country: a.country, count: count(a.id)}
    )
  end

  @valid ~w(action country city latitude longitude ip)a

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
