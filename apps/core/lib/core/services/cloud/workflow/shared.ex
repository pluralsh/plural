defmodule Core.Services.Cloud.Workflow.Shared do
  use Core.Services.Base
  import Core.Services.Cloud.Utils

  alias Core.Clients.Console
  alias Core.Services.{Cloud, Users}
  alias Core.Services.Cloud.{Poller, Configuration}
  alias Core.Schema.{ConsoleInstance, PostgresCluster, User}
  alias Core.Repo

  @behaviour Core.Services.Cloud.Workflow

  def sync(%ConsoleInstance{external_id: id} = instance) when is_binary(id) do
    instance = Repo.preload(instance, [:cluster, :postgres])
    Console.update_service(console(), id, %{
      configuration: Configuration.build(instance)
    })
  end

  def sync(_), do: :ok

  def up(%ConsoleInstance{status: :deployment_created, url: url} = inst) do
    :timer.sleep(:timer.seconds(10))
    Core.Retry.retry(fn ->
      case {DNS.resolve(url), DNS.resolve(url, :cname)} do
        {{:ok, [_ | _]}, _} -> mark_provisioned(inst)
        {_, {:ok, [_ | _]}} -> mark_provisioned(inst)
        {{:error, err}, _} -> {:error, "cannot resolve #{url}: #{inspect(err)}"}
      end
    end, wait: :timer.seconds(30), max: 4)
    |> case do
      {:ok, _} = res -> res
      {:error, err} ->
        Logger.info "failed to resolve dns, error: #{inspect(err)}, just going to mark anyways and assume it's a negative caching bug"
        mark_provisioned(inst)
    end
  end

  def up(%ConsoleInstance{status: :pending, postgres: pg, configuration: conf} = inst) do
    with {:ok, pid} <- connect(pg),
         {:ok, _} <- Postgrex.query(pid, "CREATE DATABASE #{conf.database}", []),
         {:ok, _} <- Postgrex.transaction(pid, fn conn ->
                       Postgrex.query!(conn, "CREATE USER #{conf.dbuser} WITH PASSWORD '#{conf.dbpassword}'", [])
                       Postgrex.query!(conn, "GRANT ALL ON DATABASE #{conf.database} TO #{conf.dbuser}", [])
                     end) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{db: true},
        status: :database_created,
      })
      |> Repo.update()
    end
  end

  def up(%ConsoleInstance{instance_status: %{db: true}, name: name, cluster: cluster} = inst) do
      with {:ok, id} <- Poller.repository(),
           {:ok, svc_id} <- Console.create_service(console(), cluster.external_id, %{
                              name: "console-cloud-#{name}",
                              namespace: "plrl-cloud-#{name}",
                              helm: %{
                                url: "https://pluralsh.github.io/console",
                                chart: "console-rapid",
                                release: "console",
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

  def up(inst), do: {:ok, inst}

  def down(%ConsoleInstance{instance_status: %{svc: false, db: true}, configuration: conf, postgres: pg} = inst) do
    with {:ok, pid} <- connect(pg),
         {:ok, _} <- Postgrex.query(pid, "DROP DATABASE IF EXISTS #{conf.database}", []),
         {:ok, _} <-  Postgrex.transaction(pid, fn conn ->
                        Postgrex.query!(conn, "DROP USER IF EXISTS #{conf.dbuser}", [])
                      end) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{db: false},
        status: :database_deleted,
      })
      |> Repo.update()
    end
  end

  def down(%ConsoleInstance{instance_status: %{svc: true}} = inst) do
    with {:ok, _} <- Console.delete_service(console(), inst.external_id) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{svc: false, db: true},
        status: :deployment_deleted,
      })
      |> Repo.update()
    end
  end

  def down(inst), do: {:ok, inst}

  def finalize(%ConsoleInstance{status: s, cluster: cluster, postgres: pg} = inst, :down) when s in ~w(database_deleted pending)a do
    start_transaction()
    |> add_operation(:inst, fn _ -> Repo.delete(inst) end)
    |> add_operation(:cluster, fn _ -> Cloud.dec(cluster) end)
    |> add_operation(:pg, fn _ -> Cloud.dec(pg) end)
    |> add_operation(:sa, fn %{inst: %{name: name}} ->
      case Users.get_user_by_email("#{name}-cloud-sa@srv.plural.sh") do
        %User{} = u -> Repo.delete(u)
        _ -> {:ok, nil}
      end
    end)
    |> execute(extract: :inst)
  end

  def finalize(inst, _), do: {:ok, inst}

  defp connect(%PostgresCluster{} = roach) do
    uri = URI.parse(roach.url)
    user = userinfo(uri)
    Postgrex.start_link(
      database: uri.path && String.trim_leading(uri.path, "/"),
      username: user[:username],
      password: user[:password],
      hostname: uri.host,
      port: uri.port,
      ssl: Core.conf(:bootstrap_ssl)
    )
  end

  defp userinfo(%URI{userinfo: info}) when is_binary(info) do
    case String.split(info, ":") do
      [user, pwd] -> %{username: user, password: pwd}
      [user] -> %{username: user}
      _ -> %{}
    end
  end
  defp userinfo(_), do: %{}
end
