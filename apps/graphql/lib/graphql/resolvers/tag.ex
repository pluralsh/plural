defmodule GraphQl.Resolvers.Tag do
  use GraphQl.Resolvers.Base, model: Core.Schema.Tag

  def query(_, _), do: Tag

  def grouped_tags(%{id: repo_id, type: :integrations} = args, _) do
    Tag.integration_tags(repo_id)
    |> Tag.ordered()
    |> Tag.grouped()
    |> maybe_search(Tag, args)
    |> paginate(args)
  end

  def grouped_tags(%{type: :repositories} = args, _) do
    Tag.repository_tags()
    |> Tag.ordered()
    |> Tag.grouped()
    |> maybe_search(Tag, args)
    |> paginate(args)
  end

  def category_tags(args, %{source: %{category: category}}) do
    Tag.category_tags(category)
    |> Tag.ordered()
    |> Tag.grouped()
    |> maybe_search(Tag, args)
    |> paginate(args)
  end
end
