defmodule Core.Schema.UpgradeQueue do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  schema "upgrade_queues" do
    field :acked, :binary_id

    belongs_to :user, User

    timestamps()
  end

  @valid ~w(acked user_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:user_id])
    |> foreign_key_constraint(:user_id)
  end
end
