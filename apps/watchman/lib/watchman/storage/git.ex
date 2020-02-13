defmodule Watchman.Storage.Git do
  import Watchman
  import Watchman.Commands.Command, only: [cmd: 2, cmd: 3]
  alias Watchman.Commands.Chartmart

  def init() do
    unless File.exists?(workspace()) do
      with :ok <- cmd("git", ["clone", conf(:git_url)]),
           :ok <- git("config", ["user.name", conf(:git_user_name)]),
           :ok <- git("config", ["user.email", conf(:git_user_email)]),
        do: Chartmart.unlock()
    else
      pull()
    end
  end

  def push(retry \\ 0) do
    case {git("push", []), retry} do
      {:ok, _} -> :ok
      {_, retries} when retries >= 3 -> {:error, :exhausted_retries}
      {_, retry} ->
        with :ok <- git("pull", "--rebase"),
          do: push(retry + 1)
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