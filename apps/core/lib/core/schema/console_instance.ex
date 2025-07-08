defmodule Core.Schema.ConsoleInstance do
  use Piazza.Ecto.Schema
  alias Piazza.Ecto.EncryptedString
  alias Core.Schema.{PostgresCluster, CloudCluster, User}

  defenum Type, shared: 0, dedicated: 1
  defenum Size, small: 0, medium: 1, large: 2
  defenum Status,
    pending: 0,
    database_created: 1,
    deployment_created: 2,
    provisioned: 3,
    deployment_deleted: 4,
    database_deleted: 5,
    stack_created: 6,
    stack_deleted: 7

  @region_map %{
    shared: %{
      aws: ~w(us-east-1)
    },
    dedicated: %{
      aws: ~w(us-east-1 me-central-1)
    }
  }

  schema "console_instances" do
    field :type,          Type, default: :shared
    field :name,          :string
    field :status,        Status
    field :subdomain,     :string
    field :url,           :string
    field :external_id,   :string
    field :cloud,         CloudCluster.Cloud
    field :size,          Size
    field :region,        :string

    field :first_notif_at,  :utc_datetime_usec
    field :second_notif_at, :utc_datetime_usec
    field :deleted_at,      :utc_datetime_usec

    embeds_one :instance_status, InstanceStatus, on_replace: :update do
      field :db,  :boolean, default: false
      field :svc, :boolean, default: false
      field :stack, :boolean, default: false
    end

    embeds_one :network, Network, on_replace: :update do
      field :allowed_cidrs, {:array, :string}
    end

    embeds_one :oidc, OIDC, on_replace: :update do
      field :issuer,        :string
      field :client_id,     :string
      field :client_secret, EncryptedString
    end

    embeds_one :configuration, Configuration, on_replace: :update do
      field :database,       :string
      field :dbuser,         :string
      field :dbpassword,     EncryptedString
      field :subdomain,      :string
      field :jwt_secret,     EncryptedString
      field :erlang_secret,  EncryptedString
      field :owner_name,     :string
      field :owner_email,    :string
      field :admin_password, EncryptedString
      field :aes_key,        EncryptedString
      field :encryption_key, EncryptedString
      field :client_id,      :string
      field :client_secret,  EncryptedString
      field :plural_token,   EncryptedString
      field :kas_api,        EncryptedString
      field :kas_private,    EncryptedString
      field :kas_redis,      EncryptedString
      field :github_app_pem, EncryptedString
      field :es_password,    EncryptedString
      field :prom_password,  EncryptedString
    end

    belongs_to :postgres,  PostgresCluster
    belongs_to :cluster,   CloudCluster
    belongs_to :owner,     User

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(c in query,
      join: u in assoc(c, :owner),
      where: u.account_id == ^account_id
    )
  end

  def unpaid(query \\ __MODULE__) do
    from(c in query,
      join: u in assoc(c, :owner),
      join: a in assoc(u, :account),
      left_join: s in assoc(a, :subscription),
      where: not is_nil(a.delinquent_at) or is_nil(s.id)
    )
  end

  def reapable(query \\ __MODULE__) do
    week_ago = Timex.now() |> Timex.shift(weeks: -1)
    default = Timex.shift(week_ago, weeks: -1)
    from(c in query,
      where: coalesce(coalesce(c.second_notif_at, c.first_notif_at), ^default) < ^week_ago
    )
  end

  def for_type(query \\ __MODULE__, type) do
    from(c in query, where: c.type == ^type)
  end

  def stream(query \\ __MODULE__) do
    from(c in query, order_by: [asc: :id])
  end

  def provisioned(query \\ __MODULE__) do
    from(c in query, where: c.status == ^:provisioned)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(c in query, order_by: ^order)
  end

  def regions(), do: @region_map

  @valid ~w(name type cloud size region status subdomain url external_id postgres_id cluster_id owner_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:configuration, with: &configuration_changeset/2)
    |> cast_embed(:instance_status, with: &status_changeset/2)
    |> cast_embed(:network, with: &network_changeset/2)
    |> cast_embed(:oidc, with: &oidc_changeset/2)
    |> validate_required(@valid -- ~w(external_id name postgres_id cluster_id)a)
    |> foreign_key_constraint(:cluster_id)
    |> foreign_key_constraint(:postgres_id)
    |> foreign_key_constraint(:owner_id)
    |> unique_constraint(:subdomain)
    |> unique_constraint(:name)
    |> validate_format(:name, ~r/^[a-z][a-z0-9]{4,14}$/, message: "must be an alphanumeric string between 5 and 15 characters")
    |> validate_region()
  end

  def create_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required(~w(name region status cloud size)a)
    |> validate_region()
    |> foreign_key_constraint(:cluster_id)
    |> foreign_key_constraint(:postgres_id)
    |> foreign_key_constraint(:owner_id)
    |> unique_constraint(:subdomain)
    |> unique_constraint(:name)
    |> validate_format(:name, ~r/^[a-z][a-z0-9-]{4,14}$/, message: "must be an alphanumeric string between 5 and 15 characters, hyphens allowed")
    |> validate_region()
  end

  defp validate_region(cs) do
    cloud = get_field(cs, :cloud)
    type = get_field(cs, :type)
    regions = @region_map[type][cloud]
    validate_change(cs, :region, fn :region, reg ->
      case reg in regions do
        true -> []
        _ -> [region: "Invalid region #{reg} for cloud #{cloud}"]
      end
    end)
  end

  @conf_valid ~w(
    database dbuser dbpassword erlang_secret
    subdomain jwt_secret owner_name owner_email admin_password aes_key
    encryption_key client_id client_secret plural_token
    kas_api kas_private kas_redis github_app_pem es_password prom_password
  )a

  defp configuration_changeset(model, attrs) do
    model
    |> cast(attrs, @conf_valid)
    |> validate_required(@conf_valid -- ~w(github_app_pem es_password prom_password)a)
  end

  defp status_changeset(model, attrs) do
    model
    |> cast(attrs, ~w(db svc stack)a)
  end

  defp network_changeset(model, attrs) do
    model
    |> cast(attrs, ~w(allowed_cidrs)a)
  end

  defp oidc_changeset(model, attrs) do
    model
    |> cast(attrs, ~w(issuer client_id client_secret)a)
    |> validate_required(~w(issuer client_id client_secret)a)
  end
end
