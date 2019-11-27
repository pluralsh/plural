defmodule ApiWeb.Parsers.ApplicationJson do
  def init(opts), do: Plug.Parsers.JSON.init(opts)

  def parse(conn, "application", type, params, opts) do
    case String.split(type, "+") do
      [_, "json"] -> Plug.Parsers.JSON.parse(conn, "application", "json", params, opts)
      ["json"] -> Plug.Parsers.JSON.parse(conn, "application", "json", params, opts)
      _ -> {:next, conn}
    end
  end

  def parse(conn, _type, _subtype, _params, _opts), do: {:next, conn}
end