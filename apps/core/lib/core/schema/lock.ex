defmodule Core.Schema.Lock do
  use Piazza.Ecto.Schema

  schema "locks" do
    field :name,  :string
    field :owner, :binary_id

    timestamps()
  end

  def with_lock(query \\ __MODULE__) do
    from(l in query, lock: "FOR UPDATE")
  end

  def aquirable(query \\ __MODULE__, owner) do
    from(l in query, where: is_nil(l.owner) and l.owner == ^owner)
  end

  @valid ~w(name owner)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name)
    |> validate_required([:name])
  end
end
