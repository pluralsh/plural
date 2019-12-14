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
      with_mock Command, [
        cmd: fn "git", ["clone" | _] ->
          send myself, :git_clone
          :ok
        end
      ] do
        with_mock Chartmart, [
          unlock: fn ->
            send myself, :unlock
            :ok
          end
        ] do
          :ok = Git.init()

          assert_receive :git_clone
          assert_receive :unlock
        end
      end
    end
  end
end