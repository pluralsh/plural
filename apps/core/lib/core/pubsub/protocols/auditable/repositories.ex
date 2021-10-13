defimpl Core.PubSub.Auditable, for: [Core.PubSub.RepositoryCreated, Core.PubSub.RepositoryUpdated] do
  alias Core.Schema.Audit
  alias Core.PubSub

  def audit(%{item: repository, actor: %{id: actor_id, account_id: account_id}}) do
    %Audit{
      action: "repository:#{action(@for)}",
      actor_id: actor_id,
      account_id: account_id,
      repository_id: repository.id
    }
  end

  defp action(PubSub.RepositoryCreated), do: :created
  defp action(PubSub.RepositoryUpdated), do: :updated
end

defimpl Core.PubSub.Auditable, for: [Core.PubSub.InstallationCreated, Core.PubSub.InstallationUpdated, Core.PubSub.InstallationDeleted] do
  alias Core.Schema.Audit
  alias Core.PubSub

  def audit(%{item: inst, actor: %{id: actor_id, account_id: account_id}}) do
    %Audit{
      action: "repository:installation:#{action(@for)}",
      actor_id: actor_id,
      account_id: account_id,
      repository_id: inst.repository_id
    }
  end

  defp action(PubSub.InstallationCreated), do: :created
  defp action(PubSub.InstallationUpdated), do: :updated
  defp action(PubSub.InstallationDeleted), do: :deleted
end

defimpl Core.PubSub.Auditable, for: Core.PubSub.DockerImageCreated do
  alias Core.Schema.Audit

  def audit(%{item: image, actor: %{id: actor_id, account_id: account_id}}) do
    %Audit{
      action: "dkr:pushed",
      actor_id: actor_id,
      account_id: account_id,
      image_id: image.id
    }
  end
end
