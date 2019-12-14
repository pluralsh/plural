defmodule Watchman.Storage.Git do
  import Watchman
  import Watchman.Command, only: [cmd: 2, cmd: 3]
  alias Watchman.Chartmart

  def init() do
    unless File.exists?(workspace()) do
      with :ok <- cmd("git", ["clone", conf(:git_url)]),
        do: Chartmart.unlock()
    else
      pull()
    end
  end

  def push(retry \\ 0) do
    case {git("push", ["origin/master"]), retry} do
      {:ok, _} -> :ok
      {_, retries} when retries >= 3 -> {:error, :exhausted_retries}
      {_, retry} ->
        :ok = git("pull", "--rebase")
        push(retry + 1)
    end
  end

  def pull() do
    with :ok <- git("reset", ["--hard", "origin/master"]),
      do: git("pull")
  end

  def revise(msg) do
    with :ok <- git("add", ["."]),
      do: git("commit", ["-m", msg])
  end

  def git(cmd, args \\ []), do: cmd("git", [cmd | args], workspace())
end