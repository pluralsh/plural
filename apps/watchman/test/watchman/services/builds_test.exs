defmodule Watchman.Services.BuildsTest do
  use Watchman.DataCase, async: true
  alias Watchman.Services.Builds

  describe "Command Collectable" do
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