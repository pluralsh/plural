defmodule GraphQl.Resolvers.Version do
  use GraphQl.Resolvers.Base, model: Core.Schema.Version
  alias Core.Services.Versions
  alias Core.Schema.VersionTag

  def query(VersionTag, _), do: VersionTag
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

  def update_version(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Versions.update_version(attrs, id, user)
end