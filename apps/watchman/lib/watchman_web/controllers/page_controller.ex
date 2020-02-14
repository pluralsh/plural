defmodule WatchmanWeb.PageController do
  use WatchmanWeb, :controller

  def index(conn, _params) do
    html(conn, File.read!(Path.join(:code.priv_dir(:watchman), "static/index.html")))
  end
end
