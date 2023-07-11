defmodule Core.Services.Clusters.Transfer do
  use Core.Services.Base
  alias Core.Services.{Repositories, Charts, Terraform}
  alias Core.Schema.{
    User,
    Installation,
    ChartInstallation,
    TerraformInstallation,
    OIDCProvider,
    DnsRecord,
    Cluster
  }

  @type error :: {:error, term}
  @type sync_resp :: {:ok, map} | error

  def transfer_domains(%User{id: id}, %User{id: to_id}, %Cluster{provider: p, name: n}) do
    DnsRecord.for_cluster(n)
    |> DnsRecord.for_provider(p)
    |> DnsRecord.for_creator(id)
    |> Core.Repo.update_all(set: [creator_id: to_id])
  end

  @doc """
  Replicates all installations from one user to another
  """
  @spec sync_installations(User.t, User.t) :: sync_resp
  def sync_installations(%User{id: id}, %User{id: to_id} = to) do
    Installation.for_user(id)
    |> Core.Repo.all()
    |> Core.Repo.preload([:repository])
    |> Enum.reduce(start_transaction(), fn %{id: inst_id, repository: repo, oidc_provider: provider} = inst, xact ->
      add_operation(xact, inst_id, fn _ ->
        case Repositories.get_installation(to_id, inst.repository_id) do
          nil ->
            Repositories.create_installation(%{
              track_tag: inst.track_tag,
              auto_upgrade: inst.auto_upgrade,
              source: inst.source,
            }, repo, to)
          inst -> {:ok, inst}
        end
        |> when_ok(&Core.Repo.preload(&1, [:user]))
      end)
      |> add_operation({:helm, inst_id}, fn %{^inst_id => inst} -> transfer(:helm, inst_id, inst) end)
      |> add_operation({:tf, inst_id}, fn %{^inst_id => inst} -> transfer(:terraform, inst_id, inst) end)
    end)
    |> execute()
  end

  @doc """
  Transfers all installations to another user, including OIDC providers
  """
  @spec transfer_installations(User.t, User.t) :: sync_resp
  def transfer_installations(%User{id: id}, %User{id: to_id} = to) do
    Installation.for_user(id)
    |> Core.Repo.all()
    |> Core.Repo.preload([:repository, :oidc_provider])
    |> Enum.reduce(start_transaction(), fn %{id: inst_id, repository: repo, oidc_provider: provider} = inst, xact ->
      add_operation(xact, inst_id, fn _ ->
        case Repositories.get_installation(to_id, inst.repository_id) do
          nil ->
            Repositories.create_installation(%{
              track_tag: inst.track_tag,
              auto_upgrade: inst.auto_upgrade,
              source: inst.source,
            }, repo, to)
          inst -> {:ok, inst}
        end
        |> when_ok(&Core.Repo.preload(&1, [:user]))
      end)
      |> maybe_reparent_provider(provider)
      |> add_operation({:helm, inst_id}, fn %{^inst_id => inst} -> transfer(:helm, inst_id, inst) end)
      |> add_operation({:tf, inst_id}, fn %{^inst_id => inst} -> transfer(:terraform, inst_id, inst) end)
    end)
    |> execute()
  end

  defp maybe_reparent_provider(xact, %OIDCProvider{installation_id: inst_id} = provider) do
    add_operation(xact, {:oidc, inst_id}, fn %{^inst_id => inst} ->
      OIDCProvider.changeset(provider, %{installation_id: inst.id})
      |> Core.Repo.update()
    end)
  end
  defp maybe_reparent_provider(xact, _), do: xact

  defp transfer(:helm, %ChartInstallation{} = c, %Installation{id: id, user: user}) do
    case Core.Repo.get_by(ChartInstallation, installation_id: id, chart_id: c.chart_id) do
      nil -> Charts.create_chart_installation(%{chart_id: c.chart_id, version_id: c.version_id}, id, user)
      %{id: id, version_id: vid} -> Charts.update_chart_installation(%{version_id: vid}, id, user)
    end
  end

  defp transfer(:terraform, %TerraformInstallation{} = tf, %Installation{id: id, user: user}) do
    case Core.Repo.get_by(TerraformInstallation, installation_id: id, terraform_id: tf.terraform_id) do
      nil -> Terraform.create_terraform_installation(%{terraform_id: tf.terraform_id, version_id: tf.version_id}, id, user)
      %{id: id, version_id: vid} -> Terraform.update_terraform_installation(%{version_id: vid}, id, user)
    end
  end

  defp transfer(tool, id, inst) do
    schema(tool).for_installation(id)
    |> Core.Repo.all()
    |> Enum.reduce(short_circuit(), fn pkg, s ->
      short(s, pkg.id, fn -> transfer(tool, pkg, inst) end)
    end)
    |> execute()
  end

  defp schema(:helm), do: ChartInstallation
  defp schema(:terraform), do: TerraformInstallation
end
