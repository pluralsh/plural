defmodule Core.Schema.Database do
  use Piazza.Ecto.Schema
  alias Core.Schema.Repository

  defenum Engine, postgres: 0

  schema "databases" do
    field :engine, Engine
    field :target, :string
    field :port,   :integer

    belongs_to :repository, Repository

    timestamps()
  end

  @valid ~w(engine target port repository_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:engine, :port, :target])
  end
end