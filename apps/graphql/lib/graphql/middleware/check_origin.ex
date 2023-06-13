defmodule GraphQl.Middleware.CheckOrigin do
  @behaviour Absinthe.Middleware

  def call(%{context: %{origin: origin}} = res, _) when is_binary(origin) do
    with %URI{scheme: "https", host: h, port: p} when is_binary(h) <- URI.parse(origin),
         true <- valid_origin(h, p) do
      res
    else
      _ -> Absinthe.Resolution.put_result(res, {:error, "invalid request origin"})
    end
  end
  def call(res, _), do: res

  defp valid_origin("localhost", p) when p in [3000, 3001], do: true
  defp valid_origin("pluralsh--" <> _ = firebase, _), do: String.ends_with?(firebase, ".web.app")
  defp valid_origin(host, _), do: host == Core.conf(:hostname)
end
