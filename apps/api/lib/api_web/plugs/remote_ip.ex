defmodule ApiWeb.Plugs.RemoteIp do
  alias RemoteIp

  def init(opts), do: RemoteIp.init(opts)

  def call(%{req_headers: headers} = conn, %RemoteIp.Config{headers: allowed}) do
    ips = RemoteIp.Headers.parse(headers, allowed) |> Enum.reverse()
    %{conn | remote_ip: find_ip(ips, conn.remote_ip)}
  end

  defp find_ip([_, ip | _], _), do: ip # assume spoof after 2 layers of proxy
  defp find_ip([ip], _), do: ip
  defp find_ip(_, ip), do: ip
end
