defmodule Core.Schema.Publisher do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.{User, Address, Repository, Account}

  @repo_sideload_limit 5

  schema "publishers" do
    field :name,               :string
    field :avatar_id,          :binary_id
    field :avatar,             Core.Storage.Type
    field :description,        :string
    field :billing_account_id, :string
    field :phone,              :string

    has_many :repositories, Repository
    belongs_to :owner, User
    belongs_to :account, Account

    embeds_one :address, Address, on_replace: :update

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(p in query, where: p.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  def repositories(query \\ __MODULE__) do
    from(p in query,
      inner_lateral_join: r in fragment("""
        (select *
        from repositories as r
        where r.publisher_id = ?
        order by r.inserted_at desc
        limit ?)
      """, p.id, @repo_sideload_limit),
      inner_join: rs in Repository,
        on: rs.id == r.id,
      select: rs
    )
  end

  def publishable(query \\ __MODULE__, user)
  def publishable(query, %User{id: id, account: %{root_user_id: id}}), do: query
  def publishable(query, %User{} = user) do
    subquery =
      user
      |> User.roles()
      |> Enum.filter(& &1.permissions.publish)
      |> Enum.reduce(dynamic([p], p.name == "~~never-used~~"), fn %{repositories: repos}, acc ->
        Enum.reduce(repos, acc, fn repo, q ->
          like = String.replace(repo, "*", "%")
          dynamic([p], ilike(p.name, ^like) or ^q)
        end)
      end)

    from(r in query, where: ^subquery)
  end

  @valid ~w(name owner_id description phone)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:address)
    |> validate_required([:name, :owner_id])
    |> foreign_key_constraint(:owner_id)
    |> unique_constraint(:name)
    |> unique_constraint(:owner_id)
    |> validate_length(:name, max: 255)
    |> generate_uuid(:avatar_id)
    |> cast_attachments(attrs, [:avatar], allow_urls: true)
  end

  @stripe_valid ~w(billing_account_id)a

  def stripe_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @stripe_valid)
    |> unique_constraint(:billing_account_id)
  end
end
