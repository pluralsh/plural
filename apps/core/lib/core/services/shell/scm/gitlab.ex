defmodule Core.Shell.Scm.Gitlab do
  alias Core.OAuth.Gitlab
  require Logger

  def create_repository(access_token, name, org) do
    url("/projects")
    |> HTTPoison.post(Jason.encode!(create_repo_body(name, org)), headers(access_token))
    |> case do
      {:ok, %{status_code: code, body: body}} when code >= 200 and code < 300 -> Jason.decode(body)
      err ->
        Logger.error "Failed to create repository #{inspect(err)}"
        {:error, "could not create github repository, is #{name} already taken?"}
    end
  end

  def register_keys(access_token, public_key, %{"id" => id}) do
    url("/projects/#{id}/deploy_keys")
    |> HTTPoison.post(
      Jason.encode!(%{key: public_key, title: "plural key", can_push: true}),
      headers(access_token)
    )
    |> case do
      {:ok, %{status_code: code}} when code >= 200 and code < 300 -> :ok
      err ->
        Logger.error "Failed to register deploy keys #{inspect(err)}"
        {:error, "could not register deploy keys against gitlab project #{id}"}
    end
  end

  def authorize_url() do
    oauth_client()
    |> OAuth2.Client.authorize_url!(scope: "read_api write_repository email openid profile")
  end

  def get_token(code) do
    oauth_client()
    |> OAuth2.Client.get_token!(code: code)
    |> case do
      %OAuth2.Client{token: %OAuth2.AccessToken{access_token: tok}} -> {:ok, tok}
      err  ->
        Logger.error "unrecognized token #{inspect(err)}"
        {:error, "invalid access code"}
    end
  end

  def client(token), do: token

  def oauth_client(token) do
    client = oauth_client()
    %{client | headers: [], params: %{}, token: %OAuth2.AccessToken{access_token: token}}
  end

  defp oauth_client(), do: Gitlab.client(nil, "/shell")

  defp headers(token), do: [{"Authorization", "Bearer #{token}"}, {"accept", "application/json"}]

  defp url(p), do: "https://gitlab.com/api/v4#{p}"

  defp create_repo_body(name, nil) do
    %{name: name, visibility: "private", initialize_with_readme: true, description: "my plural installation repo"}
  end

  defp create_repo_body(name, org) when is_binary(org) do
    create_repo_body(name, nil)
    |> Map.put(:namespace_id, String.to_integer(org))
  end
end
