defmodule Core.Influx do
  @moduledoc false

  def child_spec(_opts) do
    %{
      id: __MODULE__,
      start: {Agent, :start_link, [fn -> :ok end, [name: __MODULE__]]}
    }
  end

  def config(keys \\ nil) do
    cfg = Application.get_env(:core, __MODULE__, [])
    if keys, do: Access.get(cfg, keys), else: cfg
  end

  def write(payload, opts \\ []) do
    cfg = config()
    query = Instream.Data.Write.query(payload, opts)
    points = query.payload[:points] || []
    body = Instream.Encoder.Line.encode(points)
    db = Keyword.get(opts, :database) || cfg[:database]
    url = "#{base_url(cfg)}/write?#{URI.encode_query(%{"db" => db})}"

    case Req.post(url, headers: headers(cfg, [{"content-type", "text/plain"}]), body: body, retry: false) do
      {:ok, %Req.Response{status: status}} when status in 200..299 -> :ok
      {:ok, %Req.Response{status: status, body: resp}} -> {:error, {status, resp}}
      {:error, reason} -> {:error, reason}
    end
  end

  def query(sql, opts \\ []) when is_binary(sql) do
    cfg = config()
    db = Keyword.get(opts, :database) || cfg[:database]
    method = Keyword.get(opts, :method, :get)

    params =
      %{"db" => db, "q" => sql}
      |> maybe_put_json_params(Keyword.get(opts, :params))

    url = "#{base_url(cfg)}/query?#{URI.encode_query(params)}"
    req_opts = [headers: headers(cfg), retry: false]

    result =
      case method do
        :post -> Req.post(url, req_opts)
        _ -> Req.get(url, req_opts)
      end

    case result do
      {:ok, %Req.Response{status: status, body: body}} when status in 200..299 ->
        decode_body(body)

      {:ok, %Req.Response{status: status, body: body}} ->
        {:error, {status, body}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp maybe_put_json_params(params, map) when is_map(map) do
    Map.put(params, "params", Jason.encode!(map))
  end
  defp maybe_put_json_params(params, _), do: params

  defp decode_body(body) when is_map(body) do
    body
    |> Jason.encode!()
    |> Jason.decode!(keys: :atoms)
  end
  defp decode_body(body) when is_binary(body) and body != "" do
    Jason.decode!(body, keys: :atoms)
  end
  defp decode_body(_), do: :ok

  defp base_url(cfg) do
    scheme = cfg[:scheme] || "http"
    host = cfg[:host] || "localhost"
    port = cfg[:port] || 8086
    "#{scheme}://#{host}:#{port}"
  end

  defp headers(cfg, extra \\ []) do
    Instream.Query.Headers.assemble(cfg)
    |> Kernel.++(extra)
    |> Enum.map(fn {k, v} -> {String.downcase(to_string(k)), v} end)
  end
end
