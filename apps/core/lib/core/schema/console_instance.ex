defmodule Core.Schema.ConsoleInstance do
  use Piazza.Ecto.Schema
  alias Piazza.Ecto.EncryptedString
  alias Core.Schema.{CockroachCluster, CloudCluster, User}

  defenum Size, small: 0, medium: 1, large: 2
  defenum Status,
    pending: 0,
    database_created: 1,
    deployment_created: 2,
    provisioned: 3,
    deployment_deleted: 4,
    database_deleted: 5

  @region_map %{
    aws: ~w(us-east-1)
  }

  schema "console_instances" do
    field :name,          :string
    field :status,        Status
    field :subdomain,     :string
    field :url,           :string
    field :external_id,   :string
    field :cloud,         CloudCluster.Cloud
    field :size,          Size
    field :region,        :string

    field :deleted_at,    :utc_datetime_usec

    embeds_one :instance_status, InstanceStatus, on_replace: :update do
      field :db,  :boolean, default: false
      field :svc, :boolean, default: false
    end

    embeds_one :configuration, Configuration, on_replace: :update do
      field :database,       :string
      field :dbuser,         :string
      field :dbpassword,     EncryptedString
      field :subdomain,      :string
      field :jwt_secret,     EncryptedString
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
    end

    belongs_to :cockroach, CockroachCluster
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

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(c in query, order_by: ^order)
  end

  def regions(), do: @region_map

  @valid ~w(name cloud size region status subdomain url external_id cockroach_id cluster_id owner_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:configuration, with: &configuration_changeset/2)
    |> cast_embed(:instance_status, with: &status_changeset/2)
    |> validate_required(@valid -- [:external_id])
    |> unique_constraint(:subdomain)
    |> unique_constraint(:name)
    |> validate_format(:name, ~r/[a-z][a-z0-9]{5,10}/, message: "must be an alphanumeric string between 5 and 10 characters")
    |> validate_region()
  end

  defp validate_region(cs) do
    cloud = get_field(cs, :cloud)
    regions = @region_map[cloud]
    validate_change(cs, :region, fn :region, reg ->
      case reg in regions do
        true -> []
        _ -> [region: "Invalid region #{reg} for cloud #{cloud}"]
      end
    end)
  end

  @conf_valid ~w(
    database dbuser dbpassword
    subdomain jwt_secret owner_name owner_email admin_password aes_key
    encryption_key client_id client_secret plural_token
    kas_api kas_private kas_redis
  )a

  defp configuration_changeset(model, attrs) do
    model
    |> cast(attrs, @conf_valid)
    |> validate_required(@conf_valid)
  end

  defp status_changeset(model, attrs) do
    model
    |> cast(attrs, ~w(db svc)a)
  end
end
