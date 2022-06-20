defmodule Core.Schema.Group do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account, RoleBinding, GroupMember}

  schema "groups" do
    field :name, :string
    field :description, :string
    field :global, :boolean, default: false
    field :globalized, :boolean, virtual: true
    field :external_id, :string

    belongs_to :account, Account
    has_many :role_bindings, RoleBinding
    has_many :group_members, GroupMember

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(g in query, where: g.account_id == ^account_id)
  end

  def search(query \\ __MODULE__, name) do
    from(g in query, where: like(g.name, ^"#{name}%"))
  end

  def global(query \\ __MODULE__) do
    from(g in query, where: g.global)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(q in query, order_by: ^order)
  end

  @valid ~w(name description account_id global)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:account_id)
    |> unique_constraint(:external_id)
    |> unique_constraint(:name, name: index_name(:groups, [:account_id, :name]))
    |> validate_required([:name, :account_id])
    |> set_globalized(model)
  end

  def set_globalized(cs, model) do
    case {get_change(cs, :global), !!model.global} do
      {true, false} -> put_change(cs, :globalized, true)
      _ -> cs
    end
  end
end
