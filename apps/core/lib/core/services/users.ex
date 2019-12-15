defmodule Core.Services.Users do
  use Core.Services.Base
  import Core.Policies.User
  alias Core.Schema.{
    PersistedToken,
    User,
    Publisher,
    Webhook
  }

  def get_user(user_id), do: Core.Repo.get(User, user_id)

  def get_user_by_email!(email),
    do: Core.Repo.get_by!(User, email: email)

  def get_publisher!(id),
    do: Core.Repo.get!(Publisher, id)

  def get_publisher_by_owner!(owner_id),
    do: Core.Repo.get_by!(Publisher, owner_id: owner_id)

  def get_publisher_by_owner(owner_id),
    do: Core.Repo.get_by(Publisher, owner_id: owner_id)

  def get_publisher_by_name!(name),
    do: Core.Repo.get_by!(Publisher, name: name)

  def get_persisted_token(token) do
    Core.Repo.get_by!(PersistedToken, token: token)
    |> Core.Repo.preload([:user])
  end

  def get_webhook!(id), do: Core.Repo.get!(Webhook, id)

  def login_user(email, password) do
    get_user_by_email!(email)
    |> Argon2.check_pass(password)
    |> case do
      {:ok, user} -> {:ok, user}
      _ -> {:error, :invalid_password}
    end
  end

  def create_persisted_token(%User{} = user) do
    %PersistedToken{}
    |> PersistedToken.changeset(%{user_id: user.id})
    |> Core.Repo.insert()
  end

  def delete_persisted_token(token_id, %User{} = user) do
    Core.Repo.get!(PersistedToken, token_id)
    |> allow(user, :edit)
    |> when_ok(:delete)
  end

  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Core.Repo.insert()
  end

  def update_user(attrs, %User{} = user) do
    user
    |> User.changeset(attrs)
    |> Core.Repo.update()
  end

  def create_publisher(attrs, %User{} = user) do
    %Publisher{owner_id: user.id}
    |> Publisher.changeset(attrs)
    |> Core.Repo.insert()
  end

  def update_publisher(attrs, %User{} = user) do
    get_publisher_by_owner!(user.id)
    |> Publisher.changeset(attrs)
    |> Core.Repo.update()
  end

  def upsert_webhook(url, %User{id: user_id}) do
    case Core.Repo.get_by(Webhook, url: url, user_id: user_id) do
      %Webhook{} = webhook -> {:ok, webhook}
      nil -> %Webhook{user_id: user_id} |> Webhook.changeset(%{url: url}) |> Core.Repo.insert()
    end
  end

  def post_webhook(repo, %Webhook{url: url, secret: secret}) do
    payload   = Jason.encode!(%{repo: repo})
    signature = hmac(secret, payload)
    headers   = [
      {"content-type", "application/json"},
      {"accept", "application/json"},
      {"x-watchman-signature", "sha1=#{signature}"}
    ]
    Mojito.post(sanitize(url), headers, payload)
  end

  defp sanitize("https://" <> _ = url), do: url
  defp sanitize("http://" <> rest), do: "https://#{rest}"
  defp sanitize(url), do: "https://" <> url

  def hmac(secret, payload) when is_binary(payload) do
    :crypto.hmac(:sha, secret, payload)
    |> Base.encode16(case: :lower)
  end
end