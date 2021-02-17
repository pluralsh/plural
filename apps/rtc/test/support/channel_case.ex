defmodule RtcWeb.ChannelCase do
  @moduledoc """
  This module defines the test case to be used by
  channel tests.

  Such tests rely on `Phoenix.ChannelTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.

  Finally, if the test case interacts with the database,
  we enable the SQL sandbox, so changes done to the database
  are reverted at the end of every test. If you are using
  PostgreSQL, you can even run database tests asynchronously
  by setting `use RtcWeb.ChannelCase, async: true`, although
  this option is not recommended for other databases.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with channels
      import Phoenix.ChannelTest
      import RtcWeb.ChannelCase
      use Absinthe.Phoenix.SubscriptionTest, schema: GraphQl
      import Core.Factory
      import Core.TestHelpers

      # The default endpoint for testing
      @endpoint RtcWeb.Endpoint

      def establish_socket(user) do
        {:ok, socket} = mk_socket(user)
        Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)
      end

      def mk_socket(user) do
        connect(RtcWeb.UserSocket, %{"token" => Rtc.TestUtils.jwt(user)}, %{})
      end
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Core.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Core.Repo, {:shared, self()})
    end

    :ok
  end

  def publish_event(event), do: Rtc.Conduit.Subscriber.publish_event(event)
end
