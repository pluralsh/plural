defimpl Core.PubSub.Auditable, for: [Core.PubSub.VersionCreated, Core.PubSub.VersionUpdated] do
  alias Core.Schema.{Audit, Version}
  alias Core.PubSub

  def audit(%{item: version, actor: %{id: actor_id, account_id: account_id}}) do
    %Audit{
      action: "version:#{action(@for)}",
      actor_id: actor_id,
      account_id: account_id,
      version_id: version.id,
      repository_id: fetch_repository_id(version)
    }
  end

  defp action(PubSub.VersionCreated), do: :created
  defp action(PubSub.VersionUpdated), do: :updated

  defp fetch_repository_id(%Version{chart_id: id} = v) when is_binary(id) do
    %{chart: %{repository_id: repo_id}} = Core.Repo.preload(v, [:chart])
    repo_id
  end

  defp fetch_repository_id(%Version{terraform: id} = v) when is_binary(id) do
    %{terraform: %{repository_id: repo_id}} = Core.Repo.preload(v, [:terraform])
    repo_id
  end
end
