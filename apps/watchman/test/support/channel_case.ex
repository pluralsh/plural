defmodule WatchmanWeb.ChannelCase do
  @moduledoc """
  This module defines the test case to be used by
  channel tests.

  Such tests rely on `Phoenix.ChannelTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with channels
      use Phoenix.ChannelTest
      use Absinthe.Phoenix.SubscriptionTest, schema: Watchman.GraphQl
      import Watchman.Factory
      import Watchman.TestHelpers

      # The default endpoint for testing
      @endpoint WatchmanWeb.Endpoint

      def establish_socket(user) do
        {:ok, socket} = mk_socket(user)
        Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)
      end

      def mk_socket(user) do
        {:ok, token, _} = Watchman.Guardian.encode_and_sign(user)
        connect(WatchmanWeb.UserSocket, %{"token" => "Bearer #{token}"}, %{})
      end
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Watchman.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Watchman.Repo, {:shared, self()})
    end
    :ok
  end
end
