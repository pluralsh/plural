defmodule Core.Conduit.Plug.Echo do
  use Conduit.Plug.Builder

  def init(opts), do: opts

  def call(message, next, _opts) do
    IO.inspect(message)
    |> next.()
  end
end
