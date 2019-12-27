defmodule GraphQl.Resolvers.Tag do
  use GraphQl.Resolvers.Base, model: Core.Schema.Tag

  def query(_, _), do: Tag

  def grouped_tags(%{id: repo_id, type: :integrations} = args, _) do
    Tag.integration_tags(repo_id)
    |> Tag.ordered()
    |> Tag.grouped()
    |> paginate(args)
  end
end