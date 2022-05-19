defmodule Core.Shell.Scm do
  alias Core.Shell.Scm.{Github, Gitlab}

  @providers ~w(github gitlab)a

  @type provider :: :github | :gitlab
  @type error :: {:error, term}

  @doc """
  Generates an ssh-encoded rsa keypair for use with git
  """
  @spec keypair(binary) :: {:ok, binary, binary} | error
  def keypair(email) do
    with {_, _, _, params, public} = private <- :public_key.generate_key({:namedCurve, :secp256r1}),
         entry <- :public_key.pem_entry_encode(:ECPrivateKey, private),
         pem_private <- :public_key.pem_encode([entry]),
         ssh_public <- :public_key.ssh_encode([{{{:ECPoint, public}, params}, [{:comment, email}]}], :openssh_public_key),
      do: {:ok, pem_private, ssh_public}
  end

  @doc """
  Lists supported authorize urls for SCM OAuth
  """
  @spec authorize_urls() :: [%{provider: provider, url: binary}]
  def authorize_urls() do
    Enum.map(@providers, & %{provider: &1, url: authorize_url(&1)})
  end

  @doc """
  Sets up a repository against a common SCM system for use in the shell
  """
  @spec setup_repository(provider, binary, binary, binary, binary) :: {:ok, binary, binary, binary, map} | error
  def setup_repository(:github, email, token, org, name) do
    client = Github.client(token)
    with {:ok, private, public} <- keypair(email),
         {:ok, %{"ssh_url" => url} = repo} <- Github.create_repository(client, name, org),
         :ok <- Core.retry(fn -> Github.register_keys(client, public, repo) end),
         {:ok, user} <- Github.oauth_client(client) |> Core.OAuth.Github.get_user(),
      do: {:ok, url, public, private, git_info(user)}
  end

  def setup_repository(:gitlab, email, token, org, name) do
    client = Gitlab.client(token)
    with {:ok, private, public} <- keypair(email),
         {:ok, %{"ssh_url_to_repo" => url} = repo} <- Gitlab.create_repository(client, name, org),
         :ok <- Gitlab.register_keys(client, public, repo),
         {:ok, user} <- Gitlab.oauth_client(client) |> Core.OAuth.Gitlab.get_user(),
      do: {:ok, url, public, private, git_info(user)}
  end

  @doc """
  Fetches an access token for a scm provider
  """
  @spec get_token(provider, binary) :: {:ok, binary} | error
  def get_token(:github, code), do: Github.get_token(code)
  def get_token(:gitlab, code), do: Gitlab.get_token(code)

  defp authorize_url(:github), do: Github.authorize_url()
  defp authorize_url(:gitlab), do: Gitlab.authorize_url()

  defp git_info(%{email: email} = user), do: %{username: user[:name], email: email}
  defp git_info(_), do: nil
end
