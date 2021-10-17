defmodule Core.OAuth do
  @providers ~w(github)a

  def urls() do
    Enum.map(@providers, & %{provider: &1, authorize_url: authorize_url(&1)})
  end

  def authorize_url(strat), do: strategy(strat).authorize_url!()

  def callback(strat, code) do
    strategy = strategy(strat)
    client = strategy.get_token!(code)

    with {:ok, result} <- strategy.get_user(client),
      do: Core.Services.Users.bootstrap_user(result)
  end

  def strategy(:github), do: Core.OAuth.Github
end
