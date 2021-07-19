defmodule Core.Schema.ResetToken do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User}

  defenum Type, password: 0, email: 1

  schema "reset_tokens" do
    field :type, Type
    field :external_id, :binary

    belongs_to :user, User,
      foreign_key: :email,
      references: :email,
      type: :string

    timestamps()
  end

  @valid ~w(type email)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:external_id, &gen_token/0)
    |> unique_constraint(:external_id)
    |> validate_required([:type, :external_id, :email])
  end

  defp gen_token() do
    "tok_" <>
    (:crypto.strong_rand_bytes(64)
    |> Base.url_encode64())
  end
end
