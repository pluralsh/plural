defmodule Core.Schema.DnsDomain do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account, User, DnsAccessPolicy}

  schema "dns_domains" do
    field :name, :string

    belongs_to :creator, User
    belongs_to :account, Account
    has_one :access_policy, DnsAccessPolicy,
      on_replace: :delete,
      foreign_key: :domain_id

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(d in query, where: d.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(d in query, order_by: ^order)
  end

  @valid ~w(name creator_id account_id)a
  @required ~w(name creator_id account_id)a

  def changeset(model, attrs \\ %{}) do
    domain = Core.conf(:onplural_domain)

    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name)
    |> cast_assoc(:access_policy)
    |> foreign_key_constraint(:creator_id)
    |> foreign_key_constraint(:account_id)
    |> validate_format(:name, regex(domain), message: "must be a dns complaint domain one level below #{domain}")
    |> validate_required(@required)
  end

  def update_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [])
    |> cast_assoc(:access_policy)
  end

  def regex(base_domain) do
    ~r/^[a-z0-9-]+\.#{base_domain}$/
  end

  def search(query \\ __MODULE__, name) do
    from(d in query, where: ilike(d.name, ^"%#{name}%"))
  end
end
