defmodule Core.OAuth do
  @providers ~w(github google gitlab)a

  def urls(redirect \\ nil) do
    Enum.map(@providers, & %{provider: &1, authorize_url: authorize_url(&1, redirect)})
  end

  def authorize_url(strat, redirect \\ nil), do: strategy(strat).authorize_url!(redirect)

  def callback(strat, redirect, code) do
    strategy = strategy(strat)
    client = strategy.get_token!(redirect, code)

    with {:ok, result} <- strategy.get_user(client),
      do: Core.Services.Users.bootstrap_user(strat, Map.delete(result, :avatar))
  end

  def strategy(:github), do: Core.OAuth.Github
  def strategy(:google), do: Core.OAuth.Google
  def strategy(:gitlab), do: Core.OAuth.Gitlab
end
