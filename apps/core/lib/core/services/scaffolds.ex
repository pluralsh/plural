defmodule Core.Services.Scaffolds do
  import EEx, only: [eval_file: 2]
  @providers ~w(aws gcp azure)

  def generate(application, ctx) do
    repo_scaffolds(application, ctx) ++
    helm_scaffolds(application, ctx) ++
    recipe_scaffolds(application, ctx) ++
    terraform_scaffolds(application, ctx)
  end

  defp repo_scaffolds(application, ctx) do
    [
      {"Pluralfile", eval("Pluralfile.eex", application, "AWS", ctx)},
      {"repository.yaml", eval("repository.yaml.eex", application, "AWS", ctx)}
    ]
  end

  defp helm_scaffolds(application, ctx) do
    [
      {"helm/#{application}/deps.yaml", eval("helm/deps.yaml.eex", application, "AWS", ctx)}
    ]
  end

  defp recipe_scaffolds(app, ctx) do
    Enum.map(@providers, fn prov ->
      {"plural/recipes/#{app}-#{prov}.yaml", eval("recipe.yaml.eex", app, prov, ctx)}
    end)
  end

  defp terraform_scaffolds(app, ctx) do
    Enum.flat_map(@providers, fn prov ->
      [
        {"terraform/#{prov}/deps.yaml", eval("terraform/deps.yaml.eex", app, prov, ctx)},
        {"terraform/#{prov}/main.tf", eval("terraform/main.tf.eex", app, prov, ctx)},
        {"terraform/#{prov}/terraform.tfvars", eval("terraform/terraform.tfvars.eex", app, prov, ctx)},
        {"terraform/#{prov}/variables.tf", eval("terraform/variables.tf.eex", app, prov, ctx)}
      ]
    end)
  end

  defp eval(file, application, provider, ctx) do
    scaffold_file(file)
    |> eval_file(
      application: application,
      provider: provider,
      ingress: !!ctx[:ingress],
      postgres: !!ctx[:postgres],
      publisher: ctx[:publisher],
      category: ctx[:category]
    )
  end

  defp scaffold_file(file), do: Path.join([:code.priv_dir(:core), "scaffolds", file])
end
