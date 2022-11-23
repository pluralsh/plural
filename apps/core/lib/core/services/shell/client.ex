defmodule Core.Shell.Client do
  import Core.Services.Base, only: [ok: 1]
  alias Core.Schema.CloudShell
  alias Core.Services.Shell.Pods
  alias Core.Shell.Models
  require Logger

  @timeout 50_000
  @timeout_opts [timeout: @timeout, recv_timeout: @timeout]

  @headers [{"accept", "*/*"}, {"content-type", "application/json"}]

  def setup(%CloudShell{pod_name: name} = shell) do
    with {:ok, ip} <- Pods.ip(name),
         {:ok, req} <- request(shell) do
      case HTTPoison.post("http://#{ip}:8080/v1/setup", Poison.encode!(req), @headers, @timeout_opts) do
        {:ok, %HTTPoison.Response{status_code: 200}} -> {:ok, true}
        error ->
          Logger.error "Failed to setup shell: #{log(error)}"
          {:error, :failed}
      end
    end
  end

  def configuration(%CloudShell{} = shell), do: api(shell, :get, "/v1/configuration", "", as: Models.Configuration.as())

  def set_configuration(%CloudShell{} = shell, request),
    do: api(shell, :post, "/v1/context/configuration", Poison.encode!(request))

  def api(%CloudShell{pod_name: name}, method, path, body \\ "", opts \\ []) do
    with {:ok, ip} <- Pods.ip(name) do
      case HTTPoison.request(method, "http://#{ip}:8080#{path}", body, @headers, @timeout_opts) do
        {:ok, %HTTPoison.Response{status_code: 200, body: body}} -> handle_resp(body, opts)
        error ->
          Logger.error "failed to call shell api: #{inspect(error)}"
          {:error, :failed}
      end
    end
  end

  def request(%CloudShell{user: user} = shell) do
    %{demo: dem} = Core.Repo.preload(shell, [:demo])
    with {:ok, token} <- Core.Services.Users.access_token(user) do
      Piazza.Ecto.Schema.mapify(shell)
      |> Map.put(:user, %{name: user.name, email: user.email, access_token: token.token})
      |> Map.put(:is_demo, !!dem)
      |> ok()
    end
  end

  defp handle_resp(body, opts) do
    case Keyword.get(opts, :as) do
      nil -> {:ok, body}
      as -> Poison.decode(body, as: as)
    end
  end

  defp log({:error, %HTTPoison.Response{body: body, status_code: code}}),
    do: "http response #{code} body=#{body}"
  defp log({:error, _} = error), do: inspect(error)
  defp log(_), do: "unknown"
end
