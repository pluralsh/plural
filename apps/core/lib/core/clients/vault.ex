defmodule Core.Clients.Vault do
  @moduledoc nil

  def read(path), do: call(:read, [vpath(path)])

  def write(path, value), do: call(:write, [vpath(path), value])

  def delete(path) do
    with {:ok, vault} <- client() do
      Vault.request(vault, :delete, v2_path(vpath(path), "metadata"))
    end
  end

  def client() do
    Vault.new(
      engine: Vault.Engine.KVV2,
      auth: Vault.Auth.Kubernetes,
      host: host()
    )
    |> Vault.auth(%{role: "plural", jwt: kube_jwt()})
  end

  defp call(fun, args) do
    with {:ok, vault} <- client(),
      do: apply(Vault, fun, [vault | args])
  end

  def vpath("/" <> path), do: vpath(path)
  def vpath(path), do: "plural/#{path}"

  defp host(), do: Core.conf(:vault)

  defp v2_path(path, prefix) do
    String.split(path, "/", parts: 2)
    |> Enum.join("/#{prefix}/")
  end

  defp kube_jwt() do
    Path.join("/var/run/secrets/kubernetes.io/serviceaccount", "token")
    |> File.read()
    |> case do
      {:ok, token} -> token
      _ -> ""
    end
  end
end
