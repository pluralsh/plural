defmodule Core.Schema.AccountDirectory do
  use Piazza.Ecto.Schema
  alias Core.Schema.Account

  schema "account_directories" do
    field :directory_id, :string

    belongs_to :account, Account

    timestamps()
  end

  @valid ~w(directory_id account_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:directory_id)
    |> foreign_key_constraint(:account_id)
    |> validate_required(@valid)
  end
end
