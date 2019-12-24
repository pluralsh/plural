defmodule Core.Services.Recipes do
  use Core.Services.Base
  import Core.Policies.Recipe
  alias Core.Schema.{Recipe, RecipeSection, RecipeItem, Installation, Terraform, Chart, User}
  alias Core.Services.{Repositories, Charts}
  alias Core.Services.Terraform, as: TfSvc

  def get!(recipe_id), do: Core.Repo.get!(Recipe, recipe_id)

  def get_by_name(name, repo_id),
    do: Core.Repo.get_by(Recipe, name: name, repository_id: repo_id)

  def create(%{sections: sections} = attrs, repository_id, user) do
    start_transaction()
    |> add_operation(:recipe, fn _ ->
      %Recipe{repository_id: repository_id}
      |> Recipe.changeset(attrs)
      |> allow(user, :edit)
      |> when_ok(:insert)
    end)
    |> build_sections(sections)
    |> execute(extract: :recipe)
    |> when_ok(&hydrate/1)
  end

  def delete(id, user) do
    get!(id)
    |> allow(user, :edit)
    |> when_ok(:delete)
  end

  def install(%Recipe{} = recipe, context, user) do
    hydrate(recipe)
    |> Map.get(:recipe_sections)
    |> Enum.reduce(start_transaction(), fn %{id: id, repository_id: repo_id} = section, acc ->
      add_operation(acc, id, fn _ ->
        installation_ctx = Map.get(context, repo_id, %{})
        case Repositories.get_installation(user.id, repo_id) do
          %Installation{id: id, context: ctx} ->
            Repositories.update_installation(%{context: Map.merge(ctx, installation_ctx)}, id, user)
          _ -> Repositories.create_installation(%{context: installation_ctx}, repo_id, user)
        end
      end)
      |> install_items(section.recipe_items, id, user)
    end)
    |> execute()
    |> case do
      {:ok, result} ->
        Enum.map(result, fn
          {_, %Installation{} = inst} -> inst
          _ -> nil
        end)
        |> Enum.filter(& &1)
        |> ok()
      error -> error
    end
  end
  def install(recipe_id, ctx, user) when is_binary(recipe_id),
    do: get!(recipe_id) |> install(ctx, user)

  def upsert(%{name: name} = attrs, repo_id, user) do
    start_transaction()
    |> add_operation(:wipe, fn _ ->
      case get_by_name(name, repo_id) do
        %Recipe{} = recipe -> Core.Repo.delete(recipe)
        _ -> {:ok, nil}
      end
    end)
    |> add_operation(:create, fn _ -> create(attrs, repo_id, user) end)
    |> execute(extract: :create)
  end

  @preloads [recipe_sections: [recipe_items: [:terraform, :chart]]]

  def hydrate(%Recipe{} = recipe) do
    %{recipe_sections: sections} = recipe = Core.Repo.preload(recipe, @preloads)
    sections = Enum.map(sections, fn %{recipe_items: items} = section ->
      %{section | recipe_items: topsort(items)}
    end) |> Enum.sort_by(& &1.index)

    %{recipe | recipe_sections: sections}
  end

  defp install_items(transaction, items, id, user) do
    Enum.reduce(items, transaction, fn item, acc ->
      add_operation(acc, item.id, fn %{^id => installation} ->
        case item do
          %{terraform: %Terraform{} = tf} -> upsert_terraform(tf, installation, user)
          %{chart: %Chart{} = chart} -> upsert_chart(chart, installation, user)
        end
      end)
    end)
  end

  defp upsert_terraform(%Terraform{id: id}, installation, %User{id: uid} = user) do
    case TfSvc.get_terraform_installation(id, uid) do
      %{id: _} = tfinst -> {:ok, tfinst}
      _ -> TfSvc.create_terraform_installation(%{terraform_id: id}, installation.id, user)
    end
  end

  defp upsert_chart(%Chart{id: id, latest_version: v}, installation, %User{id: uid} = user) do
    version = Charts.get_chart_version(id, v)
    case Charts.get_chart_installation(id, uid) do
      %{id: cinst_id} -> Charts.update_chart_installation(%{version_id: version.id}, cinst_id, user)
      _ -> Charts.create_chart_installation(%{chart_id: id, version_id: version.id}, installation.id, user)
    end
  end

  defp topsort(recipe_items) do
    graph = :digraph.new()
    nodes = Enum.into(recipe_items, %{}, fn item -> {as_node(item), item} end)

    try do
      Enum.each(recipe_items, fn item ->
        :digraph.add_vertex(graph, as_node(item))
      end)

      Enum.map(recipe_items, fn item -> {item, dependencies(item)} end)
      |> Enum.each(fn {item, deps} ->
        deps
        |> Enum.filter(&Map.has_key?(nodes, {&1.type, &1.name}))
        |> Enum.each(fn dep ->
          :digraph.add_edge(graph, {dep.type, dep.name}, as_node(item))
        end)
      end)

      if sorted = :digraph_utils.topsort(graph) do
        Enum.map(sorted, &Map.get(nodes, &1))
      else
        raise ArgumentError, message: "dependency cycle detected"
      end
    after
      :digraph.delete(graph)
    end
  end

  defp as_node(%RecipeItem{terraform: %Terraform{name: name}}), do: {:terraform, name}
  defp as_node(%RecipeItem{chart: %Chart{name: name}}), do: {:helm, name}

  defp dependencies(%RecipeItem{terraform: %Terraform{dependencies: %{dependencies: deps}}}),
    do: deps
  defp dependencies(%RecipeItem{chart: %Chart{dependencies: %{dependencies: deps}}}),
    do: deps
  defp dependencies(_), do: []

  defp build_sections(transaction, sections) when is_list(sections) do
    sections
    |> Enum.with_index()
    |> Enum.reduce(transaction, fn {%{name: repo_name, items: items}, ind}, acc ->
      repo = Repositories.get_repository_by_name!(repo_name)
      add_operation(acc, {:section, repo_name}, fn %{recipe: %{id: id}} ->
        %RecipeSection{recipe_id: id}
        |> RecipeSection.changeset(%{repository_id: repo.id, index: ind})
        |> Core.Repo.insert()
      end)
      |> build_items({:section, repo_name}, repo, items)
    end)
  end

  defp build_items(transaction, section_key, repo, items) when is_list(items) do
    Enum.reduce(items, transaction, fn %{name: name} = item, acc ->
      add_operation(acc, {:item, repo.id, name}, fn %{^section_key => %{id: section_id}} ->
        %RecipeItem{recipe_section_id: section_id}
        |> RecipeItem.changeset(Map.merge(item, item_reference(item, repo)))
        |> Core.Repo.insert()
      end)
    end)
  end

  defp item_reference(%{type: :helm, name: name}, %{id: id}),
    do: %{chart_id: Charts.get_chart_by_name!(id, name).id}
  defp item_reference(%{type: :terraform, name: name}, %{id: id}),
    do: %{terraform_id: TfSvc.get_terraform_by_name!(id, name).id}
end