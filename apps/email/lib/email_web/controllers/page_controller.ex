defmodule EmailWeb.PageController do
  use EmailWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
