defmodule Core.MCP.Jwt do
  use Joken.Config
  use Nebulex.Caching

  @alg "ES256"
  @ttl :timer.minutes(15)

  def exchange(jwt) do
    with {:ok, %{"keys" => [jws | _]}} <- get_jwks(),
     do: verify_and_validate(jwt, signer(jws))
  end

  def signer(jws), do: Joken.Signer.create(@alg, jws)

  @decorate cacheable(cache: Core.Cache, key: :console_jws, opts: [ttl: @ttl])
  defp get_jwks() do
    Path.join([Core.conf(:console_url), "mcp", ".well-known", "jwks.json"])
    |> HTTPoison.get()
    |> case do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} -> Jason.decode(body)
      _ -> {:error, "failed to fetch jwks"}
    end
  end
end
