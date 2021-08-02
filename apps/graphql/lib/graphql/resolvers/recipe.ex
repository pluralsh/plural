defmodule GraphQl.Resolvers.Recipe do
  use GraphQl.Resolvers.Base, model: Core.Schema.Recipe
  alias Core.Schema.{RecipeSection, RecipeItem}
  alias Core.Services.{Recipes, Repositories}

  def query(RecipeItem, _), do: RecipeItem
  def query(RecipeSection, _), do: RecipeSection
  def query(_, _), do: Recipe

  def list_recipes(args, %{context: %{repo: %{id: repo_id}}}) do
    Recipe.for_repository(repo_id)
    |> maybe_filter_provider(args)
    |> Recipe.ordered()
    |> paginate(args)
  end

  defp maybe_filter_provider(q, %{provider: p}) when not is_nil(p),
    do: Recipe.for_provider(q, p)
  defp maybe_filter_provider(q, _), do: q

  def resolve_recipe(%{id: id}, %{context: %{current_user: user}}) when is_binary(id) do
    Recipes.get!(id)
    |> Recipes.hydrate()
    |> accessible(user)
  end

  def resolve_recipe(%{name: name, repo: repo}, %{context: %{current_user: user}}) do
    %{id: repo_id} = Repositories.get_repository_by_name!(repo)

    Recipes.get_by_name(name, repo_id)
    |> Recipes.hydrate()
    |> accessible(user)
  end

  def accessible(recipe, user), do: Core.Policies.Recipe.allow(recipe, user, :access)

  def create_recipe(%{repository_id: repo_id, attributes: attrs}, %{context: %{current_user: user}})
    when is_binary(repo_id), do: Recipes.upsert(attrs, repo_id, user)
  def create_recipe(%{repository_name: name} = args, context) do
    repo = Repositories.get_repository_by_name!(name)

    Map.put(args, :repository_id, repo.id)
    |> create_recipe(context)
  end

  def delete_recipe(%{id: id}, %{context: %{current_user: user}}),
    do: Recipes.delete(id, user)

  def install_recipe(%{recipe_id: recipe_id, context: context}, %{context: %{current_user: user}}),
    do: Recipes.install(recipe_id, context, user)
end
