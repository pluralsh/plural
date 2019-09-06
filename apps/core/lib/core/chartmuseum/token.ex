defmodule Core.ChartMuseum.Token do
  use Joken.Config, default_signer: :chartmuseum
  alias Core.Schema.Chart

  @impl true
  def token_config do
    default_claims(iss: "chartmart")
  end

  def claims_for_chart(%Chart{name: name} = chart, scopes) do
    %{publisher: %{name: pub_name}} = Core.Repo.preload(chart, [:publisher])
    %{access: %{
      type: "artifact-repository",
      name: "#{pub_name}/#{name}",
      actions: scopes
    }}
  end
end