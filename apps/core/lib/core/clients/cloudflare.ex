defmodule Core.Clients.Cloudflare do
  @moduledoc false

  @api_prefix "/client/v4"

  for method <- [:get, :delete, :head] do
    def unquote(method)(path, opts \\ []) do
      apply(Cloudflare.Client, unquote(method), [absolute_path(path), opts])
    end
  end

  for method <- [:post, :put, :patch] do
    def unquote(method)(path, body, opts \\ []) do
      apply(Cloudflare.Client, unquote(method), [absolute_path(path), body, opts])
    end
  end

  defp absolute_path(path), do: @api_prefix <> "/" <> String.trim_leading(path, "/")
end
