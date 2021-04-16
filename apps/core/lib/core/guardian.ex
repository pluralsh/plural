defmodule Core.Guardian do
  use Guardian, otp_app: :core
  use Nebulex.Caching
  alias Core.Schema.User
  alias Core.Services.Users

  @ttl Nebulex.Time.expiry_time(15, :minute)

  def subject_for_token(%User{id: id}, _claims),
    do: {:ok, "user:#{id}"}
  def subject_for_token(_, _), do: {:error, :invalid_argument}

  def resource_from_claims(%{"user" => user}), do: {:ok, user}
  def resource_from_claims(%{"sub" => "user:" <> id} = claims) do
    case fetch_user(id) do
      %User{} = user -> {:ok, externalize(user, claims)}
      _ -> {:error, :not_authorized}
    end
  end
  def resource_from_claims(_claims), do: {:error, :not_authorized}

  @decorate cacheable(cache: Core.Cache, key: {:login, id}, opts: [ttl: @ttl], match: &allow/1)
  def fetch_user(id) do
    Users.get_user(id)
    |> Core.Services.Rbac.preload()
  end

  def allow(%User{} = user), do: {true, user}
  def allow(_), do: false

  defp externalize(user, %{"external" => true}), do: %{user | external: true}
  defp externalize(user, _), do: user
end
