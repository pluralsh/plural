defmodule Core.Schema.Chart do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository}

  schema "charts" do
    field :name,           :string
    field :latest_version, :string
    field :description,    :string

    belongs_to :repository, Repository

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(c in query, order_by: ^order)

  def for_repository(query \\ __MODULE__, repo_id) do
    from(c in query, where: c.repository_id == ^repo_id)
  end

  @valid ~w(name latest_version description repository_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name, name: index_name(:charts, [:repository_id, :name]))
    |> bump_version(model)
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:name, :latest_version])
    |> validate_length(:name, max: 255)
  end

  def bump_version(cs, %{latest_version: nil}), do: cs
  def bump_version(cs, %{latest_version: v}) do
    with changed_version when not is_nil(changed_version) <- get_change(cs, :latest_version),
         :lt <- Elixir.Version.compare(changed_version, v) do
      delete_change(cs, :latest_version)
    else
      _ -> cs
    end
  end
end