defmodule Core.Clients.Cloudflare do
  @moduledoc false

  @api_prefix "/client/v4"

  def get(path, opts \\ []) do
    Cloudflare.Client.get(absolute_path(path), opts)
  end

  def delete(path, opts \\ []) do
    Cloudflare.Client.delete(absolute_path(path), opts)
  end

  def head(path, opts \\ []) do
    Cloudflare.Client.head(absolute_path(path), opts)
  end

  def post(path, body, opts \\ []) do
    Cloudflare.Client.post(absolute_path(path), body, opts)
  end

  def put(path, body, opts \\ []) do
    Cloudflare.Client.put(absolute_path(path), body, opts)
  end

  def patch(path, body, opts \\ []) do
    Cloudflare.Client.patch(absolute_path(path), body, opts)
  end

  defp absolute_path(path), do: @api_prefix <> "/" <> String.trim_leading(path, "/")
end
