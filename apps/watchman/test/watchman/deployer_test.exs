defmodule Watchman.DeployerTest do
  use ExUnit.Case
  alias Watchman.Chartmart
  alias Watchman.Storage.Git

  import Mock

  describe "#deploy/1" do
    @tag :skip
    test "It can deploy a given repo" do
      :ok = Watchman.Deployer.deploy_sync("chartmart")
    end

    test "It will properly deploy a repo" do
      myself = self()
      echo = fn msg ->
        send myself, msg
        :ok
      end

      with_mocks [
        {Chartmart, [], [
          build: fn repo -> echo.({:build, repo}) end,
          deploy: fn repo -> echo.({:deploy, repo}) end
        ]},
        {Git, [], [
          init: fn -> echo.(:git_init) end,
          revise: fn msg -> echo.({:commit, msg}) end,
          push: fn -> echo.(:git_push) end,
          pull: fn -> echo.(:git_pull) end]}
      ] do
        repo = "chartmart"
        :ok = Watchman.Deployer.deploy(repo)

        assert_receive :git_init
        assert_receive {:build, repo}
        assert_receive {:deploy, repo}
        assert_receive :git_push

        assert_receive {:commit, msg}

        assert msg =~ repo
      end
    end
  end
end