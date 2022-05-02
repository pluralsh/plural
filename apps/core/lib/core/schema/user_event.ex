defmodule Core.Schema.UserEvent do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User}

  defenum Status, ok: 0, error: 1

  schema "user_events" do
    field :event, :string
    field :data,  :binary
    field :status, Status

    belongs_to :user, User

    timestamps()
  end

  @valid ~w(user_id event data status)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> validate_required([:user_id, :event])
  end
end
