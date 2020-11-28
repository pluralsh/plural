defmodule GraphQl.Resolvers.Tag do
  use GraphQl.Resolvers.Base, model: Core.Schema.Tag

  def query(_, _), do: Tag

  def grouped_tags(%{id: repo_id, type: :integrations} = args, _) do
    Tag.integration_tags(repo_id)
    |> Tag.ordered()
    |> Tag.grouped()
    |> maybe_search(args)
    |> paginate(args)
  end
  def grouped_tags(%{type: :repositories} = args, _) do
    Tag.repository_tags()
    |> Tag.ordered()
    |> Tag.grouped()
    |> maybe_search(args)
    |> paginate(args)
  end

  defp maybe_search(query, %{q: q}) when is_binary(q),
    do: Tag.search(query, q)
  defp maybe_search(query, _), do: query
end