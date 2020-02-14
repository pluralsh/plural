defmodule Watchman.Factory do
  use ExMachina.Ecto, repo: Watchman.Repo
  alias Watchman.Schema

  def build_factory do
    %Schema.Build{
      repository: sequence(:repo, &"repo-#{&1}"),
      status: :queued,
      type: :deploy
    }
  end

  def command_factory do
    %Schema.Command{
      build: build(:build),
      command: "some command"
    }
  end
end