defmodule Core.Shell.Scm.Github do
  import System, only: [get_env: 1]
  require Logger

  def create_repository(access_token, name, org) do
    create_repo_url(org)
    |> HTTPoison.post(Jason.encode!(create_repo_body(name)), headers(access_token))
    |> case do
      {:ok, %{status_code: 200, body: body}} -> Jason.decode(body)
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
      {:ok, %{status_code: 200}} -> :ok
      err ->
        Logger.error "Failed to register deploy keys #{inspect(err)}"
        {:error, "could not register deploy keys against github repository #{n}"}
    end
  end

  defp headers(token), do: [{"Authorization", "Bearer #{token}", "accept", "application/vnd.github.v3+json"}]

  defp create_repo_url(nil), do: url("/user/repos")
  defp create_repo_url(org), do: url("/orgs/#{org}/repos")

  defp url(p), do: "https://api.github.com#{p}"

  defp create_repo_body(name), do: %{name: name, private: true, auto_init: true}

  def client(token), do: token
end
