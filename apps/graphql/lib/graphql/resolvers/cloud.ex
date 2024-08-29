defmodule GraphQl.Resolvers.Cloud do
  use GraphQl.Resolvers.Base, model: Core.Schema.ConsoleInstance
  alias Core.Services.{Cloud, Clusters}

  def resolve_instance(%{id: id}, %{context: %{current_user: user}}),
    do: Cloud.visible(id, user)

  def resolve_cluster(%ConsoleInstance{url: url}, _, _) do
    ok(Clusters.get_cluster_by_url("https://#{url}") || Clusters.get_cluster_by_url(url))
  end

  def list_instances(args, %{context: %{current_user: user}}) do
    ConsoleInstance.for_account(user.account_id)
    |> ConsoleInstance.ordered()
    |> paginate(args)
  end

  def create_instance(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Cloud.create_instance(attrs, user)

  def update_instance(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Cloud.update_instance(attrs, id, user)

  def delete_instance(%{id: id}, %{context: %{current_user: user}}),
    do: Cloud.delete_instance(id, user)
end
