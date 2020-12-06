defmodule Core.Schema.Publisher do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.{User, Address, Repository}

  @repo_sideload_limit 5

  schema "publishers" do
    field :name,               :string
    field :avatar_id,          :binary_id
    field :avatar,             Core.Storage.Type
    field :description,        :string
    field :billing_account_id, :string
    field :phone,              :string

    embeds_one :address, Address, on_replace: :update
    has_many :repositories, Repository
    belongs_to :owner, User

    timestamps()
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

  @valid ~w(name owner_id description phone)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:address)
    |> validate_required([:name, :owner_id])
    |> foreign_key_constraint(:owner_id)
    |> unique_constraint(:name)
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