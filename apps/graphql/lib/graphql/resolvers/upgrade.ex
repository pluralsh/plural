defmodule GraphQl.Resolvers.Upgrade do
  use GraphQl.Resolvers.Base, model: Core.Schema.Upgrade
  alias Core.Services.{Upgrades, Repositories}

  def resolve_queue(_, %{context: %{current_user: user}}) do
    %{queue: q} = Core.Repo.preload(user, [:queue])
    {:ok, q}
  end

  def list_upgrades(args, %{source: q}) do
    Upgrade.for_queue(q.id)
    |> Upgrade.ordered(desc: :id)
    |> paginate(args)
  end

  def create_upgrade(%{id: id, attributes: attrs}, %{context: %{current_user: user}}) when is_binary(id) do
    Map.put(attrs, :repository_id, id)
    |> Upgrades.create_upgrade(user)
  end

  def create_upgrade(%{name: name} = args, context) do
    repo = Repositories.get_repository_by_name!(name)

    Map.put(args, :id, repo.id)
    |> create_upgrade(context)
  end
end
