defmodule Core.Services.Cloud.Workflow do
  use Core.Services.Base
  alias Core.Clients.Console
  alias Core.Services.{Cloud, Users}
  alias Core.Services.Cloud.{Poller, Configuration}
  alias Core.Schema.{ConsoleInstance, PostgresCluster, User}
  alias Core.Repo

  require Logger

  def sync(%ConsoleInstance{type: :dedicated, external_id: id} = inst) when is_binary(id) do
    with {:ok, project_id} <- Poller.project(),
         {:ok, repo_id} <- Poller.repository(),
         {:ok, actor} <- Console.me(dedicated_console()),
         attrs = %{actor_id: actor, project_id: project_id, repository_id: repo_id},
      do: Console.update_stack(dedicated_console(), id, Configuration.stack_attributes(inst, attrs))
  end

  def sync(%ConsoleInstance{external_id: id} = instance) when is_binary(id) do
    instance = Repo.preload(instance, [:cluster, :postgres])
    Console.update_service(console(), id, %{
      configuration: Configuration.build(instance)
    })
  end
  def sync(_), do: :ok

  def provision(%ConsoleInstance{} = instance) do
    instance = Repo.preload(instance, [:postgres, :cluster])

    Enum.reduce_while(0..10, instance, fn _, acc ->
      case up(acc) do
        {:ok, %ConsoleInstance{status: :provisioned} = inst} -> {:halt, inst}
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
    instance = Repo.preload(instance, [:postgres, :cluster])

    Enum.reduce_while(0..20, instance, fn _, acc ->
      case down(acc) do
        {:ok, %ConsoleInstance{status: :pending} = inst} -> {:halt, inst}
        {:ok, %ConsoleInstance{status: :database_deleted} = inst} -> {:halt, inst}
        {:ok, %ConsoleInstance{status: :stack_deleted} = inst} -> {:halt, inst}
        {:ok, inst} -> {:cont, inst}
        err ->
          :timer.sleep(:timer.seconds(10))
          Logger.error "failed to transition deprovisioning console: #{inspect(err)}"
          {:cont, acc}
      end
    end)
    |> finalize(:down)
  end

  defp up(%ConsoleInstance{status: :pending, type: :dedicated} = inst) do
    with {:ok, id} <- Poller.project(),
         {:ok, repo_id} <- Poller.repository(),
         {:ok, actor} <- Console.me(dedicated_console()),
         attrs = %{actor_id: actor, project_id: id, repository_id: repo_id},
         {:ok, stack_id} <- Console.create_stack(dedicated_console(), Configuration.stack_attributes(inst, attrs)) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{stack: true},
        status: :stack_created,
        external_id: stack_id
      })
      |> Repo.update()
    end
  end

  defp up(%ConsoleInstance{type: :dedicated, status: :stack_created, external_id: id} = inst) do
    Enum.reduce_while(0..120, inst, fn _, inst ->
      dedicated_console()
      |> Console.stack(id)
      |> case do
        {:ok, %{"status" => "SUCCESSFUL"}} ->
          ConsoleInstance.changeset(inst, %{status: :provisioned})
          |> Repo.update()
        status ->
          Logger.info "stack not ready yet, sleeping: #{inspect(status)}"
          :timer.sleep(:timer.minutes(1))
          {:ok, inst}
      end
    end)
  end

  defp up(%ConsoleInstance{status: :deployment_created, url: url} = inst) do
    case {DNS.resolve(url), DNS.resolve(url, :cname)} do
      {{:ok, [_ | _]}, _} -> mark_provisioned(inst)
      {_, {:ok, [_ | _]}} -> mark_provisioned(inst)
      {{:error, err}, _} -> {:error, "cannot resolve #{url}: #{inspect(err)}"}
    end
  end

  defp up(%ConsoleInstance{status: :pending, postgres: pg, configuration: conf} = inst) do
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

  defp up(%ConsoleInstance{instance_status: %{db: true}, name: name, cluster: cluster} = inst) do
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

  defp up(inst), do: {:ok, inst}

  defp down(%ConsoleInstance{type: :dedicated, instance_status: %{stack: true}, external_id: id} = inst) do
    with {:ok, _} <- Console.delete_stack(dedicated_console(), id) do
      ConsoleInstance.changeset(inst, %{status: :stack_deleted})
      |> Repo.update()
    end
  end

  defp down(%ConsoleInstance{instance_status: %{svc: false, db: true}, configuration: conf, postgres: pg} = inst) do
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

  defp down(%ConsoleInstance{instance_status: %{svc: true}} = inst) do
    with {:ok, _} <- Console.delete_service(console(), inst.external_id) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{svc: false, db: true},
        status: :deployment_deleted,
      })
      |> Repo.update()
    end
  end

  defp down(inst), do: {:ok, inst}

  defp finalize(%ConsoleInstance{status: :provisioned} = inst, :up), do: {:ok, inst}

  defp finalize(%ConsoleInstance{status: :database_deleted, cluster: cluster, postgres: pg} = inst, :down) do
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

  defp finalize(%ConsoleInstance{type: :dedicated} = inst, :down) do
    start_transaction()
    |> add_operation(:inst, fn _ -> Repo.delete(inst) end)
    |> add_operation(:sa, fn %{inst: %{name: name}} ->
      case Users.get_user_by_email("#{name}-cloud-sa@srv.plural.sh") do
        %User{} = u -> Repo.delete(u)
        _ -> {:ok, nil}
      end
    end)
    |> execute(extract: :inst)
  end

  defp finalize(inst, _) do
    Logger.warn "failed to finalize console instance: #{inst.id}"
    {:ok, inst}
  end

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

  defp mark_provisioned(inst) do
    ConsoleInstance.changeset(inst, %{status: :provisioned})
    |> Repo.update()
  end

  defp console(), do: Console.new(Core.conf(:console_url), Core.conf(:console_token))

  defp dedicated_console(), do: Console.new(Core.conf(:console_url), Core.conf(:dedicated_console_token))
end
