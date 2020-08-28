defmodule Watchman.Services.BuildsTest do
  use Watchman.DataCase, async: true
  alias Watchman.Services.Builds
  alias Watchman.PubSub

  describe "Command implements Collectable" do
    test "A command can accumulate a string stream" do
      command = insert(:command)

      command = ["some", "string", "stream"] |> Enum.into(command)

      assert command.stdout == "somestringstream"
    end
  end

  describe "create_command/2" do
    test "It will create a command record for a build" do
      build = insert(:build)

      exec = "echo 'hello world'"
      {:ok, command} = Builds.create_command(%{command: exec}, build)

      assert command.command == exec
      assert command.build_id == build.id
    end
  end

  describe "#cancel/1" do
    test "It will cancel a build by id and send an event" do
      build = insert(:build)

      {:ok, cancelled} = Builds.cancel(build.id)

      assert cancelled.status == :failed

      assert_receive {:event, %PubSub.BuildDeleted{item: ^cancelled}}
    end
  end

  describe "fail/1" do
    test "Failed builds broadcast" do
      build = insert(:build)

      {:ok, failed} = Builds.fail(build)

      assert failed.status == :failed
      assert_receive {:event, %PubSub.BuildFailed{item: ^failed}}
    end
  end

  describe "succeed/1" do
    test "Succeded builds broadcast" do
      build = insert(:build)
      {:ok, succeed} = Builds.succeed(build)

      assert succeed.status == :successful
      assert_receive {:event, %PubSub.BuildSucceeded{item: ^succeed}}
    end
  end

  describe "complete" do
    test "Commands can be finalized" do
      command = insert(:command)

      {:ok, completed} = Builds.complete(%{command | stdout: "some output"}, 0)

      assert completed.exit_code == 0
      assert completed.completed_at
      assert completed.stdout == "some output"
    end
  end
end