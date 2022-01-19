defmodule Core.Shell.Scm do
  alias Core.Shell.Scm.Github

  @doc """
  Generates an ssh-encoded rsa keypair for use with git
  """
  @spec keypair(binary) :: {:ok, binary, binary} | {:error, term}
  def keypair(email) do
    with {:ok, {private, public}} <- Piazza.Crypto.RSA.generate_keypair(),
         {:ok, pem_private} <- ExPublicKey.pem_encode(private),
         {:ok, pub_key} <- ExPublicKey.RSAPublicKey.as_sequence(public),
         ssh_public <- :public_key.ssh_encode([{pub_key, [{:comment, email}]}], :openssh_public_key),
      do: {:ok, pem_private, ssh_public}
  end


  @doc """
  Sets up a repository against a common SCM system for use in the shell
  """
  @spec setup_repository(:github, binary, binary, binary, binary) :: {:ok, binary, binary, binary} | {:error, term}
  def setup_repository(:github, email, token, org, name) do
    client = Github.client(token)
    with {:ok, private, public} <- keypair(email),
         {:ok, %{"ssh_url" => url} = repo} <- Github.create_repository(client, name, org),
         :ok <- Github.register_keys(client, public, repo),
      do: {:ok, url, public, private}
  end
end
