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
      with_mock Chartmart, [
        build: fn repo ->
          send myself, {:build, repo}
          :ok
        end,
        deploy: fn repo ->
          send myself, {:deploy, repo}
          :ok
        end
      ] do
        with_mock Git, [
          init: fn ->
            send(myself, :git_init)
            :ok
          end,
          revise: fn msg ->
            send(myself, {:commit, msg})
            :ok
          end,
          push: fn ->
            send(myself, :git_push)
            :ok
          end,
          pull: fn ->
            send(myself, :git_pull)
            :ok
          end
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
end