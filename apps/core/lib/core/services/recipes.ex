defmodule Core.Services.Recipes do
  use Core.Services.Base
  import Core.Policies.Recipe
  alias Core.Schema.{Recipe, RecipeSection, RecipeItem, Installation, Terraform, Chart, User}
  alias Core.Services.{Repositories, Charts, Versions}
  alias Core.Services.Terraform, as: TfSvc

  @spec get!(binary) :: Recipe.t
  def get!(recipe_id), do: Core.Repo.get!(Recipe, recipe_id)

  @spec get_by_name(binary, binary) :: Recipe.t | nil
  def get_by_name(name, repo_id),
    do: Core.Repo.get_by(Recipe, name: name, repository_id: repo_id)

  @spec get_by_name!(binary, binary) :: Recipe.t
  def get_by_name!(name, repo_id),
    do: Core.Repo.get_by!(Recipe, name: name, repository_id: repo_id)

  @doc """
  Will persist the given recipe for repository `repository_id`

  Fails if the user is not the publisher
  """
  @spec create(map, binary, User.t) :: {:ok, Recipe.t} | {:error, term}
  def create(%{sections: sections} = attrs, repository_id, user) do
    start_transaction()
    |> add_operation(:recipe, fn _ ->
      %Recipe{repository_id: repository_id, id: attrs[:id]}
      |> Recipe.changeset(build_dependencies(attrs))
      |> allow(user, :edit)
      |> when_ok(:insert)
    end)
    |> build_sections(sections)
    |> execute(extract: :recipe)
    |> when_ok(&hydrate/1)
  end

  @doc """
  Deletes the recipe.  Fails if the user is not the publisher
  """
  @spec delete(binary, User.t) :: {:ok, Recipe.t} | {:error, term}
  def delete(id, user) do
    get!(id)
    |> allow(user, :edit)
    |> when_ok(:delete)
  end

  @doc """
  Evaluates each section of the recipe, given the provided context, and installs
  the repository for each section and any chart/terraform items per section. Returns
  the created installations.
  """
  @spec install(Recipe.t | binary, map, User.t) :: {:ok, [Installation.t]} | {:error, term}
  def install(%Recipe{} = recipe, context, user) do
    with {:ok, user} <- register_provider(recipe, user) do
      hydrate(recipe)
      |> Map.get(:recipe_sections)
      |> Enum.reduce(start_transaction(), fn %{id: id, repository_id: repo_id} = section, acc ->
        add_operation(acc, id, fn _ ->
          installation_ctx = Map.get(context, repo_id, %{})
          case Repositories.get_installation(user.id, repo_id) do
            %Installation{id: id, context: ctx} ->
              Repositories.update_installation(%{context: Map.merge(ctx || %{}, installation_ctx)}, id, user)
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
  end
  def install(recipe_id, ctx, user) when is_binary(recipe_id),
    do: get!(recipe_id) |> install(ctx, user)

  def register_provider(%Recipe{provider: prov}, %User{provider: nil} = user) when prov in ~w(gcp aws azure)a do
    Ecto.Changeset.change(user, %{provider: prov})
    |> Core.Repo.update()
    |> case do
      {:ok, user} -> handle_notify(Core.PubSub.UserUpdated, user)
      error -> error
    end
  end
  def register_provider(_, user), do: {:ok, user}

  @doc """
  Either creates a new recipe, or deletes the entire old recipe and
  recreates it.
  """
  @spec upsert(map, binary, User.t) :: {:ok, Recipe.t} | {:error, term}
  def upsert(%{name: name} = attrs, repo_id, user) do
    start_transaction()
    |> add_operation(:wipe, fn _ ->
      case get_by_name(name, repo_id) do
        %Recipe{} = recipe -> Core.Repo.delete(recipe)
        _ -> {:ok, %{id: nil}}
      end
    end)
    |> add_operation(:create, fn %{wipe: %{id: id}} ->
      Map.put(attrs, :id, id)
      |> create(repo_id, user)
    end)
    |> execute(extract: :create)
  end

  @recipe_preloads [recipe_sections: [:repository, [recipe_items: [:terraform, :chart]]]]
  @preloads [dependencies: [dependent_recipe: @recipe_preloads]] ++ @recipe_preloads

  @doc """
  Preloads a recipe, and properly topsorts the sections according to their
  dependency maps.
  """
  @spec hydrate(Recipe.t) :: Recipe.t
  def hydrate(%Recipe{} = recipe) do
    recursive_sections = resolve_dependencies([], recipe)
    deduped = Enum.reduce(recursive_sections, %{}, fn %{repository_id: repository_id, recipe_items: items} = section, acc ->
      case Map.get(acc, repository_id) do
        %{recipe_items: moar} = section ->
          Map.put(acc, repository_id, %{section | recipe_items: items ++ moar})
        _ -> Map.put(acc, repository_id, section)
      end
    end)

    sections =
      Map.values(deduped)
      |> topsort_sections()
      |> Enum.map(fn %{recipe_items: items} = section ->
        %{section | recipe_items: topsort(Enum.dedup_by(items, &as_node/1))}
      end)

    %{recipe | recipe_sections: Enum.map(sections, &fix_configuration/1)}
  end
  def hydrate(nil), do: nil

  defp fix_configuration(%RecipeSection{configuration: conf, recipe_items: items} = section) do
    configuration =
      Enum.flat_map(items, & (&1.configuration || []))
      |> Enum.concat(conf || [])
      |> Enum.dedup_by(& &1.name)

    %{section | configuration: configuration}
  end

  defp resolve_dependencies(prev, %Recipe{} = recipe) do
    case Core.Repo.preload(recipe, @preloads) do
      %{recipe_sections: sections, dependencies: [_ | _] = deps} ->
        Enum.flat_map(deps, &resolve_dependencies([], &1.dependent_recipe))
        |> Enum.concat(prev)
        |> Enum.concat(sections)
      %{recipe_sections: sections} -> sections ++ prev
    end
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

  defp upsert_terraform(%Terraform{id: id, latest_version: v}, installation, %User{id: uid} = user) do
    version = Versions.get_version(:terraform, id, v)
    case TfSvc.get_terraform_installation(id, uid) do
      %{id: id} -> TfSvc.update_terraform_installation(%{version_id: version.id}, id, user)
      _ -> TfSvc.create_terraform_installation(%{terraform_id: id, version_id: version.id}, installation.id, user)
    end
  end

  defp upsert_chart(%Chart{id: id, latest_version: v}, installation, %User{id: uid} = user) do
    version = Charts.get_chart_version(id, v)
    case Charts.get_chart_installation(id, uid) do
      %{id: cinst_id} -> Charts.update_chart_installation(%{version_id: version.id}, cinst_id, user)
      _ -> Charts.create_chart_installation(%{chart_id: id, version_id: version.id}, installation.id, user)
    end
  end

  defp topsort_sections(sections) do
    graph = :digraph.new()
    by_name = Enum.into(sections, %{}, & {&1.repository.name, &1})

    try do
      Enum.each(sections, fn %{repository: %{name: name}} ->
        :digraph.add_vertex(graph, name)
      end)

      Enum.reduce(sections, MapSet.new(), fn %{recipe_items: items, repository: %{name: out_repo}}, seen ->
        Enum.flat_map(items, &dependencies/1)
        |> Enum.map(fn %{repo: in_repo} -> {in_repo, out_repo} end)
        |> Enum.reject(&MapSet.member?(seen, &1))
        |> Enum.into(seen, fn {in_repo, out_repo} = pair ->
          :digraph.add_edge(graph, in_repo, out_repo)
          pair
        end)
      end)

      if sorted = :digraph_utils.topsort(graph) do
        Enum.map(sorted, &Map.get(by_name, &1))
      else
        raise ArgumentError, message: "dependency cycle detected"
      end
    after
      :digraph.delete(graph)
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
    |> Enum.reduce(transaction, fn {%{name: repo_name, items: items} = attrs, ind}, acc ->
      repo = Repositories.get_repository_by_name!(repo_name)
      add_operation(acc, {:section, repo_name}, fn %{recipe: %{id: id}} ->
        attrs = Map.drop(attrs, [:name, :items])
        %RecipeSection{recipe_id: id}
        |> RecipeSection.changeset(Map.merge(attrs, %{repository_id: repo.id, index: ind}))
        |> Core.Repo.insert()
      end)
      |> build_items({:section, repo_name}, repo, items)
    end)
  end

  defp build_dependencies(%{dependencies: [_ | _] = deps} = attrs) do
    dependencies =
      Enum.with_index(deps)
      |> Enum.map(fn {%{repo: repo, name: recipe}, ind} ->
        repo = Repositories.get_repository_by_name!(repo)
        recipe = get_by_name!(recipe, repo.id)
        %{dependent_recipe_id: recipe.id, index: ind}
      end)
    %{attrs | dependencies: dependencies}
  end
  defp build_dependencies(attrs), do: attrs

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
