defmodule Watchman.DeployerTest do
  use Watchman.DataCase, async: false
  alias Watchman.Commands.Forge
  alias Watchman.Storage.Git
  use Mimic

  setup :set_mimic_global

  describe "#wake/0" do
    test "It will dequeue and deploy a repo" do
      myself = self()
      echo = fn msg ->
        send myself, msg
        {:ok, msg}
      end

      expect(Git, :init, fn -> echo.(:git_init) end)
      |> expect(:revise, & echo.({:commit, &1}))
      |> expect(:push, fn -> echo.(:git_push) end)

      expect(Forge, :build, & echo.({:build, &1}))
      |> expect(:deploy, & echo.({:deploy, &1}))


      repo = "forge"
      build = insert(:build, repository: repo)
      :ok = Watchman.Deployer.wake()

      assert_receive :git_init
      assert_receive {:build, ^repo}
      assert_receive {:deploy, ^repo}
      assert_receive :git_push

      assert_receive {:commit, msg}
      :timer.sleep(100)
      assert msg =~ repo

      refetched = refetch(build)
      assert refetched.status == :successful
      assert refetched.completed_at
    end

    test "It can handle bounce deploys" do
      bounce = insert(:build, type: :bounce)
      myself = self()
      echo = fn msg ->
        send myself, msg
        {:ok, msg}
      end

      expect(Git, :init, fn -> echo.(:git_init) end)
      expect(Forge, :bounce, fn repo -> echo.({:bounce, repo}) end)

      :ok = Watchman.Deployer.wake()

      assert_receive :git_init
      assert_receive {:bounce, repo}
      assert bounce.repository == repo
      :timer.sleep(100)

      assert refetch(bounce).status == :successful
    end
  end

  describe "update/2" do
    @tag :skip
    test "It can push an update to a values.yaml file" do
      expect(Git, :init, fn -> {:ok, :init} end)
      |> expect(:revise, fn _ -> {:ok, :commit} end)
      |> expect(:push, fn -> {:ok, :push} end)

      expect(File, :write, fn _, _ -> :ok end)

      {:ok, "content"} = Watchman.Deployer.update("repo", "content")
    end
  end
end