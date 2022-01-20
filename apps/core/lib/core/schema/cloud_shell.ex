defmodule Core.Schema.CloudShell do
  use Piazza.Ecto.Schema
  alias Piazza.Ecto.EncryptedString
  alias Core.Schema.{User, Dependencies.Provider}

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

  defmodule Credentials do
    use Piazza.Ecto.Schema
    alias Core.Schema.CloudShell

    embedded_schema do
      embeds_one :aws, CloudShell.AWS
    end

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, [])
      |> cast_embed(:aws)
    end
  end

  schema "cloud_shells" do
    field :provider,        Provider
    field :git_url,         :string
    field :pod_name,        :string
    field :aes_key,         EncryptedString
    field :ssh_public_key,  EncryptedString
    field :ssh_private_key, EncryptedString

    embeds_one :workspace,   Workspace
    embeds_one :credentials, Credentials

    belongs_to :user, User

    timestamps()
  end

  @valid ~w(provider git_url ssh_public_key ssh_private_key)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:workspace)
    |> cast_embed(:credentials)
    |> put_new_change(:pod_name, &pod_name/0)
    |> put_new_change(:aes_key, &aes_key/0)
    |> validate_required([:provider, :pod_name, :aes_key])
  end

  defp pod_name(), do: "plrl-shell-#{Core.random_alphanum(6)}-#{Core.random_alphanum(6)}"

  defp aes_key(), do: Core.random_string(32)
end
