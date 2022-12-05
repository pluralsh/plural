defmodule Core.Schema.CloudShell do
  use Piazza.Ecto.Schema
  alias Piazza.Ecto.EncryptedString
  alias Core.Schema.{User, Dependencies.Provider, DemoProject}

  defmodule Workspace do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :cluster,       :string
      field :project,       :string
      field :bucket_prefix, :string
      field :bucket,        :string
      field :region,        :string
      field :subdomain,     :string
      field :context,       :map
    end

    @valid ~w(cluster project bucket_prefix bucket region subdomain context)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> set_bucket()
      |> validate_required(~w(cluster bucket_prefix bucket region subdomain)a)
    end

    def set_bucket(changes) do
      case get_field(changes, :bucket) do
        nil -> put_change(changes, :bucket, "#{get_field(changes, :bucket_prefix)}-tf-state")
        _ -> changes
      end
    end
  end

  defmodule AWS do
    use Piazza.Ecto.Schema
    alias Piazza.Ecto.EncryptedString

    embedded_schema do
      field :access_key_id,     EncryptedString
      field :secret_access_key, EncryptedString
    end

    @valid ~w(access_key_id secret_access_key)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required(@valid)
    end
  end

  defmodule GCP do
    use Piazza.Ecto.Schema
    alias Piazza.Ecto.EncryptedString

    embedded_schema do
      field :application_credentials, EncryptedString
    end

    @valid ~w(application_credentials)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required(@valid)
    end
  end

  defmodule Azure do
    use Piazza.Ecto.Schema
    alias Piazza.Ecto.EncryptedString

    embedded_schema do
      field :tenant_id,       :string
      field :client_id,       :string
      field :client_secret,   EncryptedString
      field :storage_account, :string
      field :subscription_id, :string
    end

    @valid ~w(client_id client_secret tenant_id storage_account subscription_id)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required(@valid)
    end
  end

  defmodule Credentials do
    use Piazza.Ecto.Schema
    alias Core.Schema.CloudShell

    embedded_schema do
      embeds_one :aws, CloudShell.AWS, on_replace: :update
      embeds_one :gcp, CloudShell.GCP, on_replace: :update
      embeds_one :azure, CloudShell.Azure, on_replace: :update
    end

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, [])
      |> cast_embed(:aws)
      |> cast_embed(:gcp)
      |> cast_embed(:azure)
    end
  end

  defmodule GitInfo do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :username, :string
      field :email,    :string
    end

    @valid ~w(username email)a

    def changeset(model, attrs \\ %{}), do: cast(model, attrs, @valid)
  end

  schema "cloud_shells" do
    field :provider,        Provider
    field :git_url,         :string
    field :pod_name,        :string
    field :aes_key,         EncryptedString
    field :ssh_public_key,  EncryptedString
    field :ssh_private_key, EncryptedString
    field :bucket_prefix,   :string

    embeds_one :git_info,    GitInfo, on_replace: :update
    embeds_one :workspace,   Workspace, on_replace: :update
    embeds_one :credentials, Credentials, on_replace: :update

    belongs_to :user, User
    belongs_to :demo, DemoProject

    timestamps()
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(cs in query, where: cs.user_id == ^user_id)
  end

  @valid ~w(provider git_url ssh_public_key ssh_private_key demo_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:workspace)
    |> cast_embed(:credentials)
    |> cast_embed(:git_info)
    |> foreign_key_constraint(:demo_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:bucket_prefix)
    |> put_new_change(:pod_name, &pod_name/0)
    |> put_new_change(:aes_key, &aes_key/0)
    |> validate_required([:provider, :pod_name, :aes_key])
    |> mv_bucket_prefix()
  end

  def update_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [])
    |> cast_embed(:credentials)
  end

  def mv_bucket_prefix(changeset) do
    case apply_changes(changeset) do
      %{workspace: %{bucket_prefix: pre}} -> put_change(changeset, :bucket_prefix, pre)
      _ -> changeset
    end
  end

  defp pod_name(), do: "plrl-shell-#{Core.random_alphanum(6)}-#{Core.random_alphanum(6)}"

  defp aes_key() do
    :crypto.strong_rand_bytes(32)
    |> Base.encode64()
  end
end
