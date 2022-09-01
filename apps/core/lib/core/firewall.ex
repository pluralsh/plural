defmodule Core.Firewall do
  @cidrs Enum.map(~w(fd00::/8 fe80::/10 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16 169.254.0.0/16), &InetCidr.parse/1)

  @doc """
  Validates if either an ip address or dns hostname is within an allowed address space (eg non-internal ips)
  """
  @spec check(binary | URI.t) :: :ok | {:error, :blocked | term}
  def check(host) when is_binary(host) do
    URI.parse(host)
    |> check()
  end

  def check(%URI{host: host}) when is_binary(host), do: do_check(host)
  def check(%URI{host: nil, path: host}), do: do_check(host) # handle odd uri parse case

  def check(_), do: {:error, "invalid uri"}

  defp do_check(host) do
    with {:ok, ip} <- parse(host) do
      case blocked(ip) do
        true -> {:error, :blocked}
        _ -> :ok
      end
    end
  end

  defp parse(host) do
    String.to_charlist(host)
    |> :inet.parse_address()
    |> case do
      {:ok, address} -> {:ok, address}
      _ -> DNS.resolve(host)
    end
  end

  defp blocked(ip), do: Enum.any?(@cidrs, &InetCidr.contains?(&1, ip))
end
