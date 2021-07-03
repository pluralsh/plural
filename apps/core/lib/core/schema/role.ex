defmodule Core.Schema.Role do
  use Piazza.Ecto.Schema
  alias Core.Schema.{RoleBinding, Account}

  def permissions(), do: __MODULE__.Permissions.__schema__(:fields) -- [:id]

  schema "roles" do
    field :name,         :string
    field :description,  :string
    field :repositories, {:array, :string}

    embeds_one :permissions, Permissions, on_replace: :update do
      boolean_fields [:install, :publish, :billing, :users, :support, :integrations]
    end

    belongs_to :account, Account
    has_many :role_bindings, RoleBinding, on_replace: :delete

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(r in query, where: r.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(r in query, order_by: ^order)
  end

  def search(query \\ __MODULE__, name) do
    from(r in query, where: like(r.name, ^"#{name}%"))
  end

  def permissions(%__MODULE__{permissions: perms}) do
    permissions()
    |> Enum.filter(&Map.get(perms, &1))
  end

  @valid ~w(name description repositories)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:role_bindings)
    |> cast_embed(:permissions, with: &permission_changeset/2)
    |> foreign_key_constraint(:account_id)
    |> unique_constraint(:name, name: index_name(:roles, [:account_id, :name]))
    |> validate_required([:name, :permissions])
  end

  def permission_changeset(model, attrs) do
    model
    |> cast(attrs, permissions())
  end
end
