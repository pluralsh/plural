defmodule Core.Schema.Invite do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account}

  schema "invites" do
    field :email,     :string
    field :secure_id, :string

    belongs_to :account, Account

    timestamps()
  end

  @valid ~w(email account_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:secure_id, &gen_external_id/0)
    |> foreign_key_constraint(:account_id)
    |> unique_constraint(:secure_id)
    |> unique_constraint(:email)
    |> validate_required([:email, :account_id,  :secure_id])
  end

  defp gen_external_id() do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64()
    |> String.replace("/", "")
  end
end
