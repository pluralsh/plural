defmodule Core.Backfill.Hydra do
  alias Core.Schema.OIDCProvider
  alias Core.Services.Repositories

  def providers() do
    # there aren't that many
    Core.Repo.all(OIDCProvider)
    |> Enum.each(fn oidc ->
      %{installation: inst} = Core.Repo.preload(oidc, [installation: :user])
      {:ok, _} = Repositories.update_oidc_provider(%{}, inst.id, inst.user)
    end)
  end
end
