defmodule Core.Clients.Vault do
  @moduledoc nil

  def read(path), do: call(:read, [vpath(path)])

  def write(path, value), do: call(:write, [vpath(path), value])

  def delete(path), do: call(:delete, [vpath(path)])

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

  defp kube_jwt() do
    Path.join("/var/run/secrets/kubernetes.io/serviceaccount", "token")
    |> File.read()
    |> case do
      {:ok, token} -> token
      _ -> ""
    end
  end
end
