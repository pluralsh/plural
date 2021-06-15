defmodule Core.Services.Versions do
  use Core.Services.Base
  import Core.Policies.Version

  alias Core.PubSub
  alias Core.Services.{Charts, Terraform}
  alias Core.Schema.{Version, User, VersionTag}

  @type tool_type :: :helm | :terraform
  @type version_resp :: {:ok, Version.t} | {:error, term}

  def get_version(:helm, id, version),
    do: Core.Repo.get_by(Version, chart_id: id, version: version)
  def get_version(:terraform, id, version),
    do: Core.Repo.get_by(Version, terraform_id: id, version: version)

  def get_tag(:helm, id, tag),
    do: Core.Repo.get_by(VersionTag, chart_id: id, tag: tag)
  def get_tag(:terraform, id, tag),
    do: Core.Repo.get_by(VersionTag, terraform_id: id, tag: tag)

  @doc """
  Creates a new version for a chart.  Fails if the user is not the publisher
  """
  @spec create_version(map, tool_type, binary, User.t) :: version_resp
  def create_version(attrs, tool, id, %User{} = user) do
    version = stringish_fetch(attrs, :version)
    tool_id = tool_id(tool)

    start_transaction()
    |> add_operation(:version, fn _ ->
      case get_version(tool, id, version) do
        %Version{} = v -> v
        _ -> struct(Version, %{tool_id => id, inserted: true})
      end
      |> Version.changeset(attrs)
      |> allow(user, :create)
      |> when_ok(&Core.Repo.insert_or_update/1)
    end)
    |> add_operation(:bump, fn %{version: %{version: v}} ->
      update_latest_version(tool, id, v)
    end)
    |> add_operation(:tag, fn %{version: %{id: version_id}} ->
      case get_tag(tool, id, "latest") do
        %VersionTag{} = tag -> tag
        _ -> struct(VersionTag, %{tool_id => id, tag: "latest"})
      end
      |> VersionTag.changeset(%{version_id: version_id})
      |> Core.Repo.insert_or_update()
    end)
    |> execute()
    |> case do
      {:ok, %{version: v, bump: r}} -> {:ok, %{v | tool => r}}
      error -> error
    end
  end

  def update_latest_version(:helm, id, version) do
    Charts.get_chart(id)
    |> Charts.update_latest_version(version)
  end

  def update_latest_version(:terraform, id, version) do
    Terraform.get_tf!(id)
    |> Terraform.update_latest_version(version)
  end

  def update_version(attrs, version_id, %User{} = user) do
    start_transaction()
    |> add_operation(:version, fn _ ->
      Core.Repo.get!(Version, version_id)
      |> allow(user, :edit)
    end)
    |> maybe_insert_tags(attrs)
    |> add_operation(:update, fn %{version: version} ->
      version
      |> Version.changeset(Map.delete(attrs, :tags))
      |> Core.Repo.update()
      |> when_ok(&Core.Repo.preload(&1, [:tags]))
    end)
    |> execute(extract: :update)
    |> notify(:update, user)
  end

  defp maybe_insert_tags(transaction, %{tags: tags}) do
    tags
    |> Enum.filter(& &1.tag != "latest")
    |> Enum.reduce(transaction, fn tag, xaction ->
      add_operation(xaction, {:tag, tag.tag}, fn %{version: version} ->
        tool = derive_tool(version)
        tool_id = tool_id(tool)
        id = Map.get(version, tool_id)
        case get_tag(tool, id, tag.tag) do
          %VersionTag{} = tag -> tag
          _ -> struct(VersionTag, %{tool_id => id, tag: tag.tag})
        end
        |> VersionTag.changeset(%{version_id: version.id})
        |> Core.Repo.insert_or_update()
      end)
    end)
  end

  defp maybe_clean_tags(transaction, %{tags: tags}) do
    add_operation(transaction, :clean, fn %{version: %{id: id} = version} ->
      tool = derive_tool(version)
      tool_id = Map.get(version, tool_id(tool))
      version_tags(tool, tool_id)
      |> VersionTag.for_tags(Enum.map(tags, & &1.tag))
      |> VersionTag.ignore_version(id)
      |> Core.Repo.delete_all()
      |> elem(0)
      |> ok()
    end)
  end
  defp maybe_clean_tags(transaction, _), do: transaction

  defp tool_id(:helm), do: :chart_id
  defp tool_id(:terraform), do: :terraform_id

  defp derive_tool(%Version{chart_id: id}) when not is_nil(id), do: :helm
  defp derive_tool(%Version{terraform_id: id}) when not is_nil(id), do: :terraform

  defp version_tags(:helm, id), do: VersionTag.for_chart(id)
  defp version_tags(:terraform, id), do: VersionTag.for_terraform(id)

  defp sanitize_tags(%{tags: tags} = attrs, tool, version) do
    tool_id = tool_id(tool)
    Map.put(attrs, :tags, Enum.map(tags, &Map.put(&1, tool_id(tool), Map.get(version, tool_id))))
  end
  defp sanitize_tags(attrs, _, _), do: attrs

  def notify(%Version{} = v, :create, user),
    do: handle_notify(PubSub.VersionCreated, v, actor: user)
  def notify({:ok, %Version{inserted: true} = v}, :upsert, user),
    do: handle_notify(PubSub.VersionCreated, v, actor: user)
  def notify({:ok, %Version{} = v}, :upsert, user),
    do: handle_notify(PubSub.VersionUpdated, v, actor: user)
  def notify({:ok, %Version{} = v}, :create, user),
    do: handle_notify(PubSub.VersionCreated, v, actor: user)
  def notify({:ok, %Version{} = v}, :update, user),
    do: handle_notify(PubSub.VersionUpdated, v, actor: user)
  def notify(error, _, _), do: error
end
