defmodule Core.Schema.Account do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.{User}

  schema "accounts" do
    field :name,                :string
    field :icon_id,             :binary_id
    field :icon,                Core.Storage.Type
    field :billing_customer_id, :string

    belongs_to :root_user, User

    timestamps()
  end

  @valid ~w(name)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name)
    |> validate_required([:name])
    |> generate_uuid(:icon_id)
    |> cast_attachments(attrs, [:icon], allow_urls: true)
  end

  @payment ~w(billing_customer_id)a

  def payment_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @payment)
  end
end
