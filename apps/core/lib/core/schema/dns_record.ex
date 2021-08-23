defmodule Core.Schema.DnsRecord do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, DnsDomain, Recipe.Provider}

  defenum Type, a: 0, aaaa: 1, txt: 2, cname: 3

  schema "dns_records" do
    field :name,        :string
    field :records,     {:array, :string}
    field :type,        Type
    field :external_id, :string
    field :cluster,     :string
    field :provider,    Provider

    belongs_to :creator, User
    belongs_to :domain, DnsDomain

    timestamps()
  end

  def for_domain(query \\ __MODULE__, domain_id) do
    from(r in query, where: r.domain_id == ^domain_id)
  end

  def for_creator(query \\ __MODULE__, user_id) do
    from(r in query, where: r.creator_id == ^user_id)
  end

  def for_cluster(query \\ __MODULE__, cluster) do
    from(r in query, where: r.cluster == ^cluster)
  end

  def for_provider(query \\ __MODULE__, provider) do
    from(r in query, where: r.provider == ^provider)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(r in query, order_by: ^order)
  end

  @valid ~w(name records type external_id creator_id domain_id cluster provider)a
  @required ~w(name records type creator_id domain_id cluster provider)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:domain_id)
    |> foreign_key_constraint(:creator_id)
    |> unique_constraint(:name, name: index_name(:dns_domains, [:name, :type]))
    |> unique_constraint(:external_id)
    |> validate_required(@required)
  end

  def dns_valid(cs, domain) do
    validate_format(
      cs,
      :name,
      regex(domain),
      message: "must be validly formatted and end with #{domain}"
    )
  end

  def regex(base_domain) do
    ~r/([a-z0-9-]+\.)#{base_domain}/
  end
end
