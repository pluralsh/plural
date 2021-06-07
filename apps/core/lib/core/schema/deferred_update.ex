defmodule Core.Schema.DeferredUpdate do
  use Piazza.Ecto.Schema
  alias Core.Schema.{
    ChartInstallation,
    TerraformInstallation,
    Version,
    User
  }
  alias Piazza.Ecto.UUID

  defmodule Reason do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :message, :string
      field :repo,    :string
      field :package, :string
    end

    @valid ~w(message repo package)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:message, :repo, :package])
    end
  end

  schema "deferred_updates" do
    field :attempts,   :integer, default: 0
    field :dequeue_at, :utc_datetime_usec

    belongs_to :chart_installation,     ChartInstallation
    belongs_to :terraform_installation, TerraformInstallation
    belongs_to :version,                Version
    belongs_to :user,                   User

    embeds_many :reasons, Reason

    timestamps()
  end

  def wait_time(%__MODULE__{attempts: attempts}), do: max(attempts + 1, 24)

  def for_chart_installation(query \\ __MODULE__, id) do
    from(u in query, where: u.chart_installation_id == ^id)
  end

  def for_terraform_installation(query \\ __MODULE__, id) do
    from(u in query, where: u.terraform_installation_id == ^id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :id]) do
    from(u in query, order_by: ^order)
  end

  def dequeue(query \\ __MODULE__, col, limit) do
    now = Timex.now()
    from(d in query,
      join: d2 in subquery(can_dequeue(query, col)),
        on: d2.first == d.id,
      where: d.dequeue_at <= ^now,
      limit: ^limit
    )
  end

  def can_dequeue(query \\ __MODULE__, col) do
    from(d in query,
      where: not is_nil(field(d, ^col)),
      group_by: field(d, ^col),
      select: %{group_id: field(d, ^col), first: min(d.id)}
    )
  end

  def dequeue_order(query \\ __MODULE__) do
    from(d in query, order_by: [asc: :dequeue_at])
  end

  @valid ~w(chart_installation_id terraform_installation_id version_id user_id dequeue_at attempts)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_change(:id, UUID.generate_monotonic())
    |> cast_embed(:reasons)
    |> foreign_key_constraint(:chart_installation_id)
    |> foreign_key_constraint(:terraform_installation_id)
    |> foreign_key_constraint(:version_id)
    |> foreign_key_constraint(:user_id)
    |> validate_required([:version_id, :user_id, :dequeue_at])
  end
end
