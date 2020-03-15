defmodule WatchmanWeb.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.

  Such tests rely on `Phoenix.ConnTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate
  import Plug.Conn
  alias Watchman.Schema.User

  using do
    quote do
      # Import conveniences for testing with connections
      use Phoenix.ConnTest
      alias WatchmanWeb.Router.Helpers, as: Routes
      import Watchman.Factory
      import Watchman.TestHelpers
      import WatchmanWeb.ConnCase

      # The default endpoint for testing
      @endpoint WatchmanWeb.Endpoint
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Watchman.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Watchman.Repo, {:shared, self()})
    end

    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

  def add_auth_headers(conn, %User{} = user) do
    {:ok, token, _} = Watchman.Guardian.encode_and_sign(user)
    put_req_header(conn, "authorization", "Bearer #{token}")
  end
end
