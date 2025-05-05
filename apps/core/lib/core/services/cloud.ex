defmodule Core.Services.Cloud do
  use Core.Services.Base
  import Core.Policies.Cloud
  alias Core.Repo
  alias Core.PubSub
  alias Core.Services.{Accounts, Users, Repositories, Shell, OAuth}
  alias Core.Schema.{CloudCluster, PostgresCluster, ConsoleInstance, User, OIDCProvider, Installation}

  @type error :: {:error, term}
  @type console_resp :: {:ok, ConsoleInstance.t} | error
  @type cluster_resp :: {:ok, CloudCluster.t} | error
  @type postgres_resp :: {:ok, PostgresCluster.t} | error

  def get_instance!(id), do: Repo.get!(ConsoleInstance, id)

  def get_instance_by_name(name), do: Repo.get_by(ConsoleInstance, name: name)

  @spec upsert_cluster(map, binary) :: cluster_resp
  def upsert_cluster(attrs, name) do
    case Repo.get_by(CloudCluster, name: name) do
      %CloudCluster{} = cluster -> cluster
      nil -> %CloudCluster{name: name}
    end
    |> CloudCluster.changeset(attrs)
    |> Repo.insert_or_update()
  end

  @spec upsert_postgres(map, binary) :: postgres_resp
  def upsert_postgres(attrs, name) do
    case Repo.get_by(PostgresCluster, name: name) do
      %PostgresCluster{} = cluster -> cluster
      nil -> %PostgresCluster{name: name}
    end
    |> PostgresCluster.changeset(attrs)
    |> Repo.insert_or_update()
  end

  @doc """
  Creates a new Cloud instance of the Plural console
  """
  @spec create_instance(map, User.t) :: console_resp
  def create_instance(%{name: name} = attrs, %User{} = user) do
    start_transaction()
    |> add_operation(:inst, fn _ ->
      %ConsoleInstance{status: :pending}
      |> ConsoleInstance.create_changeset(attrs)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:cluster, fn
      %{inst: %ConsoleInstance{type: :dedicated}} -> {:ok, %{id: nil}}
      _ -> select_cluster(attrs[:cloud], attrs[:region])
    end)
    |> add_operation(:postgres, fn
      %{inst: %ConsoleInstance{type: :dedicated}} -> {:ok, %{id: nil}}
      _ -> select_roach(attrs[:cloud])
    end)
    |> add_operation(:sa, fn _ ->
      Accounts.create_service_account(%{
        name: "#{name}-cloud-sa",
        email: "#{name}-cloud-sa@srv.plural.sh",
        impersonation_policy: %{
          bindings: [%{user_id: user.id}]
        }
      }, user)
    end)
    |> add_operation(:token, fn %{sa: sa} -> Users.create_persisted_token(sa) end)
    |> add_operation(:install, fn %{sa: sa} ->
      repo = Repositories.get_repository_by_name!("console")
      case Repositories.get_installation(sa.id, repo.id) do
        nil -> Repositories.create_installation(%{}, repo, sa)
        inst -> {:ok, inst}
      end
    end)
    |> add_operation(:oidc, fn %{install: inst, sa: sa} ->
      inst = Core.Repo.preload(inst, [oidc_provider: :bindings])
      Repositories.upsert_oidc_provider(%{
        auth_method: :post,
        bindings: Shell.oidc_bindings(inst.oidc_provider, user),
        redirect_uris: Shell.merge_uris(["https://console.#{name}.#{domain()}/oauth/callback"], inst.oidc_provider)
      }, inst.id, sa)
    end)
    |> add_operation(:instance, fn %{inst: inst, oidc: oidc, token: token, cluster: cluster, postgres: roach, sa: sa} ->
      ConsoleInstance.changeset(inst, Map.merge(
        %{cluster_id: cluster.id, postgres_id: roach.id, owner_id: sa.id},
        add_configuration(attrs, name, token.token, oidc, user)
      ))
      |> Repo.update()
    end)
    |> execute(extract: :instance)
    |> notify(:create, user)
  end

  @doc """
  Updates base attributes of a console instance
  """
  @spec update_instance(map, binary, User.t) :: console_resp
  def update_instance(attrs, id, %User{} = user) do
    start_transaction()
    |> add_operation(:inst, fn _ -> authorize(id, user) end)
    |> add_operation(:updated, fn %{inst: inst} ->
      ConsoleInstance.changeset(inst, attrs)
      |> Repo.update()
    end)
    |> execute(extract: :updated)
    |> notify(:update, user)
  end

  @doc """
  Schedules a console instance to be cleaned up
  """
  @spec delete_instance(binary, User.t) :: console_resp
  def delete_instance(id, %User{} = user) do
    start_transaction()
    |> add_operation(:inst, fn _ -> authorize(id, user) end)
    |> add_operation(:deleted, fn %{inst: inst} ->
      Ecto.Changeset.change(inst, %{deleted_at: Timex.now()})
      |> Repo.update()
    end)
    |> execute(extract: :deleted)
    |> notify(:delete, user)
  end

  @doc """
  Adds an email directly to a cloud console's oidc provider's bindings
  """
  @spec add_oidc_binding(binary, binary) :: OAuth.oidc_resp
  def add_oidc_binding(name, email) do
    repo = Repositories.get_repository_by_name!("console")
    with {:user, %User{} = user} <- {:user, Repo.get_by(User, email: email)},
         {:console, %ConsoleInstance{} = inst} <- {:console, get_instance_by_name(name)},
         %ConsoleInstance{owner: %User{id: oid} = sa} <- Repo.preload(inst, [:owner]),
         %Installation{} = inst <- Repositories.get_installation(oid, repo.id) do
      inst = Core.Repo.preload(inst, [oidc_provider: :bindings])
      Repositories.upsert_oidc_provider(%{
        auth_method: :post,
        bindings: Shell.oidc_bindings(inst.oidc_provider, user),
      }, inst.id, sa)
    else
      {:user, _} -> {:error, "could not find user with email #{email}"}
      {:console, _} -> {:error, "could not find console with name #{name}"}
      err -> err
    end
  end

  @doc """
  Proceeds to attempt to reap a cloud cluster, we'll give two notifications, then
  """
  @spec reap(ConsoleInstance.t) :: console_resp
  def reap(%ConsoleInstance{first_notif_at: nil} = inst),
    do: notify_reaping(inst, :first_notif_at)
  def reap(%ConsoleInstance{second_notif_at: nil} = inst),
    do: notify_reaping(inst, :second_notif_at)
  def reap(%ConsoleInstance{} = inst) do
    %{owner: owner} = Repo.preload(inst, [:owner])
    delete_instance(inst.id, owner)
  end

  defp notify_reaping(instance, field) do
    Ecto.Changeset.change(instance, %{field => Timex.now()})
    |> Repo.update()
    |> notify(:reap)
  end

  def authorize(id, %User{} = user) do
    inst = get_instance!(id) |> Repo.preload([:owner])
    with {:ok, _} <- Core.Policies.Account.allow(inst.owner, user, :impersonate),
      do: {:ok, inst}
  end

  def visible(id, %User{account_id: aid}) do
    get_instance!(id)
    |> Repo.preload([:owner])
    |> case do
      %ConsoleInstance{owner: %User{account_id: ^aid}} = instance -> {:ok, instance}
      _ -> {:error, :forbidden}
    end
  end

  defp add_configuration(attrs, name, token, %OIDCProvider{} = oidc, %User{} = user) do
    Map.merge(attrs, %{subdomain: "#{name}.#{domain()}", url: "console.#{name}.#{domain()}"})
    |> Map.put(:configuration, %{
      aes_key:        aes_key(),
      encryption_key: encryption_key(),
      database:       "#{name}_cloud",
      dbuser:         "#{name}_user",
      dbpassword:     Core.random_alphanum(32),
      subdomain:      "#{name}.#{domain()}",
      jwt_secret:     Core.random_alphanum(32) |> Base.encode64(),
      owner_name:     user.name,
      owner_email:    user.email,
      admin_password: Core.random_alphanum(32) |> Base.encode64(),
      erlang_secret:  Core.random_alphanum(32) |> Base.encode64(),
      client_id:      oidc.client_id,
      client_secret:  oidc.client_secret,
      plural_token:   token,
      kas_api:        Core.random_alphanum(64) |> Base.encode64(),
      kas_private:    Core.random_alphanum(64) |> Base.encode64(),
      kas_redis:      Core.random_alphanum(64) |> Base.encode64(),
    })
  end

  defp select_cluster(cloud, region) do
    CloudCluster.for_cloud(cloud)
    |> CloudCluster.for_region(region)
    |> CloudCluster.unsaturated()
    |> Repo.all()
    |> random_choice("Could not find cluster for #{cloud} and #{region}")
  end

  defp select_roach(cloud) do
    PostgresCluster.for_cloud(cloud)
    |> PostgresCluster.unsaturated()
    |> Repo.all()
    |> random_choice("Could not place in #{cloud}")
  end

  defp random_choice([], message), do: {:error, message}
  defp random_choice(l, _) do
    Enum.random(l)
    |> inc()
  end

  def inc(%schema{id: id}) do
    schema.selected()
    |> schema.for_id(id)
    |> Core.Repo.update_all(inc: [count: 1])
    |> case do
      {1, [res]} -> {:ok, res}
      _ -> {:error, "could not increment #{schema} [id=#{id}]"}
    end
  end

  def dec(%schema{id: id}) do
    schema.selected()
    |> schema.for_id(id)
    |> Core.Repo.update_all(inc: [count: -1])
    |> case do
      {1, [res]} -> {:ok, res}
      _ -> {:error, "could not increment #{schema} [id=#{id}]"}
    end
  end

  defp aes_key() do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64()
  end

  defp encryption_key() do
    :crypto.strong_rand_bytes(32)
    |> Base.encode64()
  end

  defp domain(), do: Core.conf(:cloud_domain)

  defp notify({:ok, %ConsoleInstance{} = inst}, :create, user),
    do: handle_notify(PubSub.ConsoleInstanceCreated, inst, actor: user)
  defp notify({:ok, %ConsoleInstance{} = inst}, :update, user),
    do: handle_notify(PubSub.ConsoleInstanceUpdated, inst, actor: user)
  defp notify({:ok, %ConsoleInstance{} = inst}, :delete, user),
    do: handle_notify(PubSub.ConsoleInstanceDeleted, inst, actor: user)
  defp notify(pass, _, _), do: pass

  defp notify({:ok, %ConsoleInstance{} = inst}, :reap),
    do: handle_notify(PubSub.ConsoleInstanceReaped, inst)
  defp notify(pass, _), do: pass
end
