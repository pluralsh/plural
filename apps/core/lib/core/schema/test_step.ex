defmodule Core.Schema.TestStep do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.Test

  schema "test_steps" do
    field :name,        :string
    field :description, :string
    field :status,      Test.Status
    field :logs,        Core.Storage.Type

    belongs_to :test, Test

    timestamps()
  end

  @valid ~w(name status description)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_attachments(attrs, [:logs], allow_paths: true)
    |> validate_required([:name, :status, :description])
    |> foreign_key_constraint(:test_id)
  end
end
