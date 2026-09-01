defmodule ApiWeb.Plugs.RemoteIp do
  @headers ~w[forwarded x-forwarded-for x-client-ip x-real-ip]

  def init(opts), do: opts

  def call(%{req_headers: headers} = conn, _opts) do
    ips =
      headers
      |> RemoteIp.Headers.take(@headers)
      |> RemoteIp.Headers.parse()
      |> Enum.reverse()

    %{conn | remote_ip: find_ip(ips, conn.remote_ip)}
  end

  defp find_ip([_, ip | _], _), do: ip
  defp find_ip([ip], _), do: ip
  defp find_ip(_, ip), do: ip
end
