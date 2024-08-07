defmodule Core.Services.Cloud.Workflow do
  use Core.Services.Base
  alias Core.Clients.Console
  alias Core.Services.Cloud
  alias Core.Services.Cloud.{Poller, Configuration}
  alias Core.Schema.{ConsoleInstance, CockroachCluster}
  alias Core.Repo

  require Logger

  def sync(%ConsoleInstance{external_id: id} = instance) when is_binary(id) do
    instance = Repo.preload(instance, [:cluster, :cockroach])
    Console.update_service(console(), %{
      size: instance.size,
      configuration: Configuration.build(instance)
    }, id)
  end
  def sync(_), do: :ok

  def provision(%ConsoleInstance{} = instance) do
    instance = Repo.preload(instance, [:cockroach, :cluster])

    Enum.reduce_while(0..10, instance, fn _, acc ->
      case up(acc) do
        {:ok, %ConsoleInstance{status: :deployment_created} = inst} -> {:halt, inst}
        {:ok, inst} -> {:cont, inst}
        err ->
          :timer.sleep(:timer.seconds(1))
          Logger.error "failed to transition provisioning console: #{inspect(err)}"
          {:cont, acc}
      end
    end)
    |> finalize(:up)
  end

  def deprovision(%ConsoleInstance{} = instance) do
    instance = Repo.preload(instance, [:cockroach, :cluster])

    Enum.reduce_while(0..10, instance, fn _, acc ->
      case down(acc) do
        {:ok, %ConsoleInstance{status: :database_deleted} = inst} -> {:halt, inst}
        {:ok, inst} -> {:cont, inst}
        err ->
          :timer.sleep(:timer.seconds(1))
          Logger.error "failed to transition deprovisioning console: #{inspect(err)}"
          {:cont, acc}
      end
    end)
    |> finalize(:down)
  end

  defp up(%ConsoleInstance{status: :pending, cockroach: roach, configuration: conf} = inst) do
    with {:ok, pid} <- connect(roach),
         {:ok, _} <- Postgrex.transaction(pid, fn conn ->
                       Postgrex.query!(conn, "CREATE DATABASE #{conf.database}", [])
                       Postgrex.query!(conn, "CREATE USER #{conf.dbuser} WITH PASSWORD $1", [conf.dbpassword])
                       Postgrex.query!(conn, "GRANT ALL ON DATABASE #{conf.database} TO #{conf.dbuser}", [])
                     end) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{db: true},
        status: :database_created,
      })
      |> Repo.update()
    end
  end

  defp up(%ConsoleInstance{instance_status: %{db: true}, name: name, cluster: cluster} = inst) do
      with {:ok, id} <- Poller.repository(),
           {:ok, svc_id} <- Console.create_service(console(), cluster.external_id, %{
                              name: "console-cloud-#{name}",
                              namespace: "plrl-cloud-#{name}",
                              helm: %{
                                url: "https://pluralsh.github.io/console",
                                chart: "console",
                                version: "x.x.x",
                                valuesFiles: ["console.yaml.liquid"]
                              },
                              repository_id: id,
                              git: %{ref: "main", folder: "helm"},
                              configuration: Configuration.build(inst),
                            }) do
      ConsoleInstance.changeset(inst, %{
        external_id: svc_id,
        instance_status: %{svc: true},
        status: :deployment_created
      })
      |> Repo.update()
    end
  end

  defp down(%ConsoleInstance{instance_status: %{svc: false, db: true}, configuration: conf, cockroach: roach} = inst) do
    with {:ok, pid} <- connect(roach),
         {:ok, _} <-  Postgrex.transaction(pid, fn conn ->
                        Postgrex.query!(conn, "DROP DATABASE #{conf.database}", [])
                        Postgrex.query!(conn, "DROP USER #{conf.dbuser}", [])
                      end) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{db: false},
        status: :database_deleted,
      })
      |> Repo.update()
    end
  end

  defp down(%ConsoleInstance{instance_status: %{svc: true}} = inst) do
    with {:ok, _} <- Console.delete_service(console(), inst.external_id) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{svc: false},
        status: :deployment_deleted,
      })
      |> Repo.update()
    end
  end

  defp finalize(%ConsoleInstance{status: :deployment_created} = inst, :up) do
    ConsoleInstance.changeset(inst, %{status: :provisioned})
    |> Repo.update()
  end

  defp finalize(%ConsoleInstance{status: :database_deleted, cluster: cluster, cockroach: roach} = inst, :down) do
    start_transaction()
    |> add_operation(:inst, fn _ -> Repo.delete(inst) end)
    |> add_operation(:cluster, fn _ -> Cloud.dec(cluster) end)
    |> add_operation(:roach, fn _ -> Cloud.dec(roach) end)
    |> execute(extract: :inst)
  end

  defp finalize(inst, _) do
    Logger.warn "failed to finalize console instance: #{inst.id}"
    {:ok, inst}
  end

  defp connect(%CockroachCluster{certificate: cert_pem} = roach) do
    with [cert | _] <- :public_key.pem_decode(cert_pem) do
      uri = URI.parse(roach.url)
      user = userinfo(uri)
      Postgrex.start_link(
        database: uri.path && String.trim_leading(uri.path, "/"),
        username: user[:username],
        password: user[:password],
        hostname: uri.host,
        port: uri.port,
        ssl: true,
        ssl_opts: [cacerts: [:public_key.pem_entry_decode(cert)]]
      )
    end
  end

  defp userinfo(%URI{userinfo: info}) when is_binary(info) do
    case String.split(info, ":") do
      [user, pwd] -> %{username: user, password: pwd}
      [user] -> %{username: user}
      _ -> %{}
    end
  end
  defp userinfo(_), do: %{}

  defp console(), do: Console.new(Core.conf(:console_url), Core.conf(:console_token))
end
