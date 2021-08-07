defmodule Api.Plugs.VerifyPersistedToken do
  import Plug.Conn
  alias Guardian.Plug.Pipeline
  alias Core.Services.Users

  def init(_), do: [realm: "Bearer"]

  def call(conn, opts) do
    key = storage_key(conn, opts)
    with {:ok, token} <- fetch_token(conn),
         %{} = persisted <- Users.get_persisted_token(token) do
      broadcast(persisted)
      conn
      |> Guardian.Plug.put_current_token(token, key: key)
      |> Guardian.Plug.put_current_claims(build_claims(persisted), key: key)
    else
      _ -> conn
    end
  end

  def fetch_token(conn) do
    get_req_header(conn, "authorization")
    |> fetch_token_from_header()
  end

  def broadcast(token) do
    Core.PubSub.Broadcaster.notify(%Core.PubSub.AccessTokenUsage{
      item: token,
      context: Core.Services.Audits.context()
    })
  end

  defp fetch_token_from_header(["plrl-" <> _ = match | _]), do: {:ok, String.trim(match)}
  defp fetch_token_from_header(["cmt-" <> _ = match | _]), do: {:ok, String.trim(match)}
  defp fetch_token_from_header([token | _tail]) do
    trimmed_token = String.trim(token)

    with :error <- match_and_extract(~r/^Bearer\:?\s+(.*)$/, trimmed_token),
      do: match_and_extract(~r/^Token\:?\s+(.*)$/, trimmed_token)
  end
  defp fetch_token_from_header(_), do: :error

  defp match_and_extract(regex, token) do
    case Regex.run(regex, token) do
      [_, "cmt-" <> _ = match] -> {:ok, String.trim(match)}
      [_, "plrl-" <> _ = match] -> {:ok, String.trim(match)}
      _ -> :error
    end
  end

  defp build_claims(persisted), do: %{"sub" => "user:#{persisted.user_id}"}

  defp storage_key(conn, opts), do: Pipeline.fetch_key(conn, opts)
end
