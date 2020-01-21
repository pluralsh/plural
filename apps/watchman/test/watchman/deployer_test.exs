defmodule Watchman.DeployerTest do
  use ExUnit.Case, async: false
  alias Watchman.Chartmart
  alias Watchman.Storage.Git
  use Mimic

  setup :set_mimic_global


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

      expect(Git, :init, fn -> echo.(:git_init) end)
      |> expect(:revise, & echo.({:commit, &1}))
      |> expect(:push, fn -> echo.(:git_push) end)

      expect(Chartmart, :build, & echo.({:build, &1}))
      |> expect(:deploy, & echo.({:deploy, &1}))


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