defmodule Core.Schema.LicenseToken do
  use Piazza.Ecto.Schema
  alias Core.Schema.Installation

  schema "license_tokens" do
    field :token, :string

    belongs_to :installation, Installation

    timestamps()
  end

  @valid ~w(installation_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:token, &gen_token/0)
    |> foreign_key_constraint(:installation_id)
    |> unique_constraint(:token)
    |> unique_constraint(:installation_id)
    |> validate_required([:token, :installation_id])
  end

  defp gen_token() do
    "license-" <>
    (:crypto.strong_rand_bytes(64)
    |> Base.url_encode64())
  end
end