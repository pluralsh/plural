defmodule Core.Schema.KeyBackup do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  schema "key_backups" do
    field :name, :string
    field :repositories, {:array, :string}
    field :vault_path, :string

    belongs_to :user, User

    timestamps()
  end

  def for_user(query \\ __MODULE__, user_id), do: from(k in query, where: k.user_id == ^user_id)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]), do: from(k in query, order_by: ^order)

  @valid ~w(name repositories vault_path)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name, name: index_name(:key_backups, [:user_id, :name]))
    |> unique_constraint(:vault_path)
    |> foreign_key_constraint(:user_id)
    |> validate_required([:name, :vault_path])
  end
end
