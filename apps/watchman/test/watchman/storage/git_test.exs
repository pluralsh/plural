defmodule Watchman.Storage.GitTest do
  use ExUnit.Case
  use Mimic
  alias Watchman.Storage.Git
  alias Watchman.Commands.{Command, Chartmart}

  setup :set_mimic_global

  describe "#init/0" do
    @tag :skip
    test "It will clone a repository" do
      :ok = Git.init()
      dir = Application.get_env(:watchman, :workspace_root)

      assert Path.join(dir, "chartmart-installations") |> File.dir?()
    end

    @tag :skip
    test "It will properly initialize a workspace" do
      myself = self()
      echo = fn val ->
        send myself, val
        :ok
      end
      git_fn = fn "git", args, _ -> echo.({:git, args}) end

      expect(Command, :cmd, git_fn)
      |> expect(:cmd, fn "git", args -> git_fn.("git", args, "rest") end)
      expect(Chartmart, :unlock, fn -> echo.(:unlock) end)

      :ok = Git.init()

      assert_receive {:git, ["clone" | _]}
      assert_receive {:git, ["config", "user.name" | _]}
      assert_receive {:git, ["config", "user.email" | _]}
      assert_receive :unlock
    end
  end
end