defmodule Core.Schema.Shell do
  use Piazza.Ecto.Schema
  alias Core.Schema.Repository

  schema "shells" do
    field :target,  :string
    field :command, :string
    field :args,    {:array, :string}

    belongs_to :repository, Repository

    timestamps()
  end

  @valid ~w(command target args repository_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:target])
  end
end