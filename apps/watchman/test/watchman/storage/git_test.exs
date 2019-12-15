defmodule Watchman.Storage.GitTest do
  use ExUnit.Case
  import Mock
  alias Watchman.Storage.Git
  alias Watchman.{Command, Chartmart}

  describe "#init/0" do
    @tag :skip
    test "It will clone a repository" do
      :ok = Git.init()
      dir = Application.get_env(:watchman, :workspace_root)

      assert Path.join(dir, "chartmart-installations") |> File.dir?()
    end

    test "It will properly initialize a workspace" do
      myself = self()
      git_fn = fn "git", args, _ ->
        send myself, {:git, args}
        :ok
      end

      with_mocks [
        {Command, [], [cmd: git_fn, cmd: fn "git", args -> git_fn.("git", args, "path") end]},
        {Chartmart, [], [unlock: fn ->
          send myself, :unlock
          :ok
        end]}] do
        :ok = Git.init()

        assert_receive {:git, ["clone" | _]}
        assert_receive {:git, ["config", "user.name" | _]}
        assert_receive {:git, ["config", "user.email" | _]}
        assert_receive :unlock
      end
    end
  end
end