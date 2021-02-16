defmodule RtcWeb.PageController do
  use RtcWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
