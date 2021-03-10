defmodule Core.Clients.Zoom do
  require Logger

  def create_token(code, redirect_uri) do
    query = URI.encode_query(%{code: code, redirect_uri: redirect_uri, grant_type: :authorization_code})

    HTTPoison.post("https://zoom.us/oauth/token?#{query}", "", [{"Authorization", "Basic #{basic_auth()}"}])
    |> IO.inspect()
    |> case do
      {:ok, %{status_code: 200, body: body}} -> {:ok, Jason.decode!(body)}
      failed ->
        Logger.error "Failed to call zoom: #{inspect(failed)}"
        {:error, :unauthorized}
    end
  end

  def refresh_token(token) do
    query = URI.encode_query(%{refresh_token: token, grant_type: :refresh_token})

    case HTTPoison.post("https://zoom.us/oauth/token?#{query}", "", [{"Authorization", "Basic #{basic_auth()}"}]) do
      {:ok, %{status_code: 200, body: body}} -> {:ok, Jason.decode!(body)}
      failed ->
        Logger.error "Failed to call zoom: #{inspect(failed)}"
        {:error, :unauthorized}
    end
  end

  def create_meeting(%{access_token: token}, topic, host, password) do
    body = Jason.encode!(%{
      topic: topic,
      type: 0,
      password: password,
      settings: %{participant_video: true, alternate_hosts: host}
    })

    headers = [
      {"Authorization", "Bearer #{token}"},
      {"Content-Type", "application/json"}
    ]

    case HTTPoison.post("https://api.zoom.us/v2/users/me/meetings", body, headers) do
      {:ok, %{status_code: 200, body: body}} -> {:ok, Jason.decode!(body)}
      failed ->
        Logger.error "Failed to call zoom: #{inspect(failed)}"
        {:error, :unauthorized}
    end
  end

  def basic_auth() do
    Base.encode64("#{conf(:client_id)}:#{conf(:client_secret)}")
  end

  defp conf(key), do: Application.get_env(:core, __MODULE__)[key]
end
