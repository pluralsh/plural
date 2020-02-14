defmodule WatchmanWeb.GraphQl.BuildSubscriptionTest do
  use WatchmanWeb.ChannelCase
  alias Watchman.Services.Builds
  use Mimic

  describe "buildDelta" do
    test "build create will broadcast deltas" do
      {:ok, socket} = establish_socket()
      expect(Watchman.Deployer, :wake, fn -> :ok end)

      ref = push_doc(socket, """
        subscription {
          buildDelta {
            delta
            payload {
              id
              repository
            }
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      {:ok, build} = Builds.create(%{repository: "repo"})
      assert_push("subscription:data", %{result: %{data: %{"buildDelta" => delta}}})
      assert delta["delta"] == "CREATE"
      assert delta["payload"]["id"] == build.id
      assert delta["payload"]["repository"] == build.repository
    end

    test "Build modify will send UPDATE deltas" do
      {:ok, socket} = establish_socket()
      build = insert(:build)

      ref = push_doc(socket, """
        subscription {
          buildDelta {
            delta
            payload {
              id
              repository
              status
            }
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})
      {:ok, build} = Builds.succeed(build)
      assert_push("subscription:data", %{result: %{data: %{"buildDelta" => delta}}})
      assert delta["delta"] == "UPDATE"
      assert delta["payload"]["id"] == build.id
      assert delta["payload"]["repository"] == build.repository
      assert delta["payload"]["status"] == "SUCCESSFUL"
    end
  end
end