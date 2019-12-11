defmodule Watchman.Storage.GitTest do
  use ExUnit.Case, async: true
  alias Watchman.Storage.Git

  describe "#init/0" do
    @tag :skip
    test "It will clone a repository" do
      :ok = Git.init()
      dir = Application.get_env(:watchman, :workspace_root)

      assert Path.join(dir, "chartmart-installations") |> File.dir?()
    end
  end
end