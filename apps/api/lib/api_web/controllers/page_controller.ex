defmodule ApiWeb.PageController do
  use ApiWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
