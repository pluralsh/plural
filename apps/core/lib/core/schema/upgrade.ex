defmodule Core.Schema.Upgrade do
  use Piazza.Ecto.Schema
  alias Core.Schema.{UpgradeQueue, Repository}
  alias Piazza.Ecto.UUID

  defenum Type, deploy: 0, approval: 1, bounce: 2, dedicated: 3, config: 4
  defenum ValueType, int: 0, string: 1, float: 2

  schema "upgrades" do
    field :type,    Type
    field :message, :string

    embeds_one :config, UpgradeConfig, on_replace: :update do
      embeds_many :paths, UpgradePath, on_replace: :delete do
        field :path,  :string
        field :value, :string
        field :type,  Core.Schema.Upgrade.ValueType
      end
    end

    belongs_to :queue,      UpgradeQueue
    belongs_to :repository, Repository

    timestamps()
  end

  def after_seq(query \\ __MODULE__, id)
  def after_seq(query, nil), do: query
  def after_seq(query, id) do
    from(u in query, where: u.id > ^id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :id]) do
    from(u in query, order_by: ^order)
  end

  def limit(query \\ __MODULE__, limit \\ 1) do
    from(u in query, limit: ^limit)
  end

  def for_queue(query \\ __MODULE__, id) do
    from(u in query, where: u.queue_id == ^id)
  end

  @valid ~w(type message repository_id queue_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:config, with: &config_changeset/2)
    |> put_change(:id, UUID.generate_monotonic())
    |> validate_length(:message, max: 10_000)
    |> foreign_key_constraint(:queue_id)
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:queue_id, :repository_id])
  end

  def config_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [])
    |> cast_embed(:paths, with: &path_changeset/2)
  end

  @path_valid ~w(path value type)a

  def path_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @path_valid)
    |> validate_required(@path_valid)
  end
end


defimpl Jason.Encoder, for: [
  Core.Schema.Upgrade.UpgradeConfig,
  Core.Schema.Upgrade.UpgradeConfig.UpgradePath
] do
  def encode(struct, opts) do
    Piazza.Ecto.Schema.mapify(struct)
    |> Jason.Encode.map(opts)
  end
end
