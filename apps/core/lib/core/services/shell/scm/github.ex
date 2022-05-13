defmodule Core.Shell.Scm.Github do
  alias Core.OAuth.Github
  require Logger

  def create_repository(access_token, name, org) do
    create_repo_url(org)
    |> HTTPoison.post(Jason.encode!(create_repo_body(name)), headers(access_token))
    |> case do
      {:ok, %{status_code: code, body: body}} when code >= 200 and code < 300 -> Jason.decode(body)
      err ->
        Logger.error "Failed to create repository #{inspect(err)}"
        {:error, "could not create github repository"}
    end
  end

  def register_keys(access_token, public_key, %{"full_name" => n}) do
    url("/repos/#{n}/keys")
    |> HTTPoison.post(
      Jason.encode!(%{key: public_key, title: "plural key", read_only: false}),
      headers(access_token)
    )
    |> case do
      {:ok, %{status_code: code}} when code >= 200 and code < 300 -> :ok
      err ->
        Logger.error "Failed to register deploy keys #{inspect(err)}"
        {:error, "could not register deploy keys against github repository #{n}"}
    end
  end

  def authorize_url() do
    oauth_client()
    |> OAuth2.Client.authorize_url!(scope: "user user:email user:name repo read:org")
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

  defp oauth_client(), do: Github.client(nil, "/shell")

  defp headers(token), do: [{"Authorization", "Bearer #{token}"}, {"accept", "application/vnd.github.v3+json"}]

  defp create_repo_url(nil), do: url("/user/repos")
  defp create_repo_url(org), do: url("/orgs/#{org}/repos")

  defp url(p), do: "https://api.github.com#{p}"

  defp create_repo_body(name), do: %{name: name, private: true, auto_init: true}
end
