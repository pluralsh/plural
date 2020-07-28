defmodule WatchmanWeb.GraphQl.BuildSubscriptionTest do
  use WatchmanWeb.ChannelCase, async: false
  alias Watchman.Services.Builds
  use Mimic

  describe "buildDelta" do
    test "build create will broadcast deltas" do
      user = insert(:user)
      {:ok, socket} = establish_socket(user)
      expect(Watchman.Deployer, :wake, fn -> :ok end)
      expect(Watchman.Forge.Repositories, :list_installations, fn _, _ ->
        {:ok, %{edges: [%{node: %{repository: %{name: "repo"}}}]}}
      end)

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
      user = insert(:user)
      {:ok, socket} = establish_socket(user)
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

  describe "commandDelta" do
    test "command creates send CREATE deltas" do
      build = insert(:build)
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription Delta($buildId: ID!) {
          commandDelta(buildId: $buildId) {
            delta
            payload {
              id
              command
            }
          }
        }
      """, variables: %{"buildId" => build.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      {:ok, command} = Builds.create_command(%{command: "echo 'hello world'"}, build)
      assert_push("subscription:data", %{result: %{data: %{"commandDelta" => delta}}})
      assert delta["delta"] == "CREATE"
      assert delta["payload"]["id"] == command.id
      assert delta["payload"]["command"] == "echo 'hello world'"
    end

    test "command completion sends UPDATE deltas" do
      build = insert(:build)
      command = insert(:command, build: build)
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription Delta($buildId: ID!) {
          commandDelta(buildId: $buildId) {
            delta
            payload {
              id
              exitCode
            }
          }
        }
      """, variables: %{"buildId" => build.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      {:ok, command} = Builds.complete(command, 0)
      assert_push("subscription:data", %{result: %{data: %{"commandDelta" => delta}}})
      assert delta["delta"] == "UPDATE"
      assert delta["payload"]["id"] == command.id
      assert delta["payload"]["exitCode"] == 0
    end
  end
end