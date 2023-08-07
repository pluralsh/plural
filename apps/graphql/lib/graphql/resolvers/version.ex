defmodule GraphQl.Resolvers.Version do
  use GraphQl.Resolvers.Base, model: Core.Schema.Version
  alias Core.Services.{Versions, Terraform, Charts}
  alias Core.Schema.{VersionTag, PackageScan, ScanViolation, ScanError}

  def query(VersionTag, _), do: VersionTag
  def query(PackageScan, _), do: PackageScan
  def query(ScanViolation, _), do: ScanViolation
  def query(ScanError, _), do: ScanError
  def query(_, _), do: Version

  def list_versions(%{chart_id: chart_id} = args, _) when not is_nil(chart_id) do
    Version.for_chart(chart_id)
    |> Version.ordered()
    |> paginate(args)
  end

  def list_versions(%{terraform_id: tf_id} = args, _) when not is_nil(tf_id) do
    Version.for_terraform(tf_id)
    |> Version.ordered()
    |> paginate(args)
  end

  def list_versions(_, _), do: {:error, "requires at least a terraformId or chartId"}

  def release(%{tags: tags}, %{context: %{repo: repo, current_user: user}}) do
    case Versions.release(repo, tags, user) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  def update_version(%{attributes: attrs, spec: %{} = spec}, %{context: %{current_user: user}}) do
    with {:ok, %{id: id}} <- find_version(spec),
      do: Versions.update_version(attrs, id, user)
  end

  def update_version(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Versions.update_version(attrs, id, user)

  def install_version(%{repository: repo, vsn: vsn, package: package, type: type}, %{context: %{current_user: user}}) do
    case do_install(type, vsn, package, repo, user) do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  defp do_install(:helm, vsn, package, repo, user),
    do: Charts.install_chart_version(vsn, package, repo, user)
  defp do_install(:terraform, vsn, package, repo, user),
    do: Terraform.install_terraform_version(vsn, package, repo, user)

  def find_version(%{version: v} = args) do
    with {tool, %{id: id}} <- get_resource(args),
         %{} = v <- Versions.get_version(tool, id, v) do
      {:ok, v}
    else
      _ -> {:error, :not_found}
    end
  end

  def get_resource(%{repository: r, chart: c}) when is_binary(c),
    do: {:helm, GraphQl.Resolvers.Chart.get_by_chart_name(r, c)}
  def get_resource(%{repository: r, terraform: tf}) when is_binary(tf),
    do: {:terraform, GraphQl.Resolvers.Terraform.get_tf_by_name(r, tf)}
end
