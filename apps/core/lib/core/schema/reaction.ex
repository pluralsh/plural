defmodule Core.Schema.Reaction do
  use Piazza.Ecto.Schema
  alias Core.Schema.{IncidentMessage, User}

  schema "reactions" do
    field :name, :string

    belongs_to :creator, User
    belongs_to :message, IncidentMessage

    timestamps()
  end

  @valid ~w(name)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:name, :creator_id, :message_id])
  end
end
