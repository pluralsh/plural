defmodule Core.Schema.DockerImage do
  use Piazza.Ecto.Schema
  alias Core.Schema.{DockerRepository, Vulnerability}

  defenum Grade, a: 0, b: 1, c: 2, d: 3, f: 4

  schema "docker_images" do
    field :tag,               :string
    field :digest,            :string
    field :grade,             Grade
    field :scanned_at,        :utc_datetime_usec
    field :scan_completed_at, :utc_datetime_usec

    has_many   :vulnerabilities,   Vulnerability, foreign_key: :image_id, on_replace: :delete
    belongs_to :docker_repository, DockerRepository

    timestamps()
  end

  def for_repositories(query \\ __MODULE__, q) do
    from(di in query,
      join: dr in ^subquery(q),
      where: di.docker_repository_id == dr.id
    )
  end

  def search(query \\ __MODULE__, s), do: from(di in query, where: like(di.tag, ^"#{s}%"))

  def for_tag(query \\ __MODULE__, tag) do
    from(di in query, where: di.tag == ^tag)
  end

  def scanned_before(query \\ __MODULE__, days) do
    prior = Timex.now() |> Timex.shift(days: -days)
    from(di in query, where: di.scanned_at < ^prior or is_nil(di.scanned_at) or di.scan_completed_at < ^prior or is_nil(di.scan_completed_at))
  end

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(di in query, where: di.docker_repository_id == ^repo_id)

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(di in query, order_by: ^order)

  def with_limit(query \\ __MODULE__, limit), do: from(di in query, limit: ^limit)

  @valid ~w(tag digest)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, name: index_name(:docker_images, [:docker_repository_id, :tag]))
    |> validate_required([:docker_repository_id])
  end

  def vulnerability_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [:scan_completed_at, :grade])
    |> cast_assoc(:vulnerabilities)
    |> validate_required([:scan_completed_at, :grade])
  end
end
