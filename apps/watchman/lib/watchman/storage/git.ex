defmodule Watchman.Storage.Git do
  import Watchman
  import Watchman.Command, only: [cmd: 2, cmd: 3]
  alias Watchman.Chartmart

  def init() do
    unless File.exists?(workspace()) do
      with :ok <- cmd("git", ["clone", conf(:git_url)]),
          :ok <- Chartmart.init(),
        do: Chartmart.unlock()
    else
      pull()
    end
  end

  def push(), do: git("push", ["origin/master"])

  def pull() do
    with :ok <- git("reset", ["--hard", "origin/master"]),
      do: git("pull")
  end

  def git(cmd, args \\ []), do: cmd("git", [cmd | args], workspace())
end