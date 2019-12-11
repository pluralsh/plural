defmodule WatchmanWeb.PageController do
  use WatchmanWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
