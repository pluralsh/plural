defmodule Core.Services.Shell do
  use Core.Services.Base
  import Core.Policies.Shell

  alias Core.Schema.{CloudShell, User, Recipe, Installation, OIDCProvider}
  alias Core.Services.{Shell.Pods, Dns, Recipes, Repositories, Encryption}
  alias Core.Shell.{Scm, Client}

  @type error :: {:error, term}
  @type shell_resp :: {:ok, CloudShell.t} | error

  @doc """
  Gets a cloud shell for a given user id
  """
  @spec get_shell(binary) :: CloudShell.t | nil
  def get_shell(user_id) do
    Core.Repo.get_by(CloudShell, user_id: user_id)
    |> Core.Repo.preload([:user])
  end

  @doc """
  Gets a cloud shell for a given user id
  """
  @spec get_shell(binary) :: CloudShell.t | nil
  def get_shell!(user_id) do
    Core.Repo.get_by!(CloudShell, user_id: user_id)
    |> Core.Repo.preload([:user])
  end

  @doc """
  Creates a cloud shell record, initializes the shell pod and provisions the subdomain
  specified by the shell
  """
  @spec create_shell(map, User.t) :: shell_resp
  def create_shell(attrs, %User{id: user_id} = user) do
    start_transaction()
    |> add_operation(:fetch, fn _ -> {:ok, get_shell(user_id)} end)
    |> add_operation(:create, fn
      %{fetch: nil} ->
        %CloudShell{user_id: user_id}
        |> CloudShell.changeset(attrs)
        |> allow(user, :create)
        |> when_ok(:insert)
      %{fetch: %CloudShell{} = s} -> {:ok, s}
    end)
    |> add_operation(:dns, fn %{create: %CloudShell{workspace: %CloudShell.Workspace{subdomain: sub}}} ->
      Dns.provision_domain(sub, user)
    end)
    |> add_operation(:git, fn
      %{fetch: nil, create: shell} ->
        %{provider: p, token: t, name: n} = args = attrs[:scm]
        with {:ok, url, pub, priv, user} <- Scm.setup_repository(p, user.email, t, args[:org], n) do
          shell
          |> CloudShell.changeset(%{git_url: url, ssh_public_key: pub, ssh_private_key: priv, git_info: user})
          |> Core.Repo.update()
        end
      %{create: shell} -> {:ok, shell}
    end)
    |> add_operation(:backup, fn %{git: %{git_url: url, aes_key: key, workspace: %{cluster: cluster}}} ->
      Encryption.create_backup(%{name: "shell:#{cluster}:#{Core.random_phrase(2)}", key: key, repositories: [url]}, user)
    end)
    |> add_operation(:init, fn %{create: %CloudShell{} = shell} -> reboot(shell) end)
    |> execute(extract: :git)
  end

  @doc """
  updates your cloud shell instance and restarts it
  """
  @spec update_shell(map, User.t) :: shell_resp
  def update_shell(attributes, %User{id: user_id}) do
    start_transaction()
    |> add_operation(:shell, fn _ ->
      get_shell!(user_id)
      |> CloudShell.update_changeset(attributes)
      |> Core.Repo.update()
    end)
    |> add_operation(:reboot, fn %{shell: s} -> reboot(s) end)
    |> execute(extract: :shell)
  end

  @doc """
  calls the shell setup api and returns the shell back
  """
  @spec setup_shell(User.t) :: shell_resp
  def setup_shell(%User{id: user_id}) do
    shell = get_shell!(user_id)
    case Client.setup(shell) do
      {:ok, _} -> {:ok, shell}
      error -> error
    end
  end

  @doc """
  Deletes the shell record from the db and destroys its associated pod if it exists
  """
  @spec delete(CloudShell.t | binary) :: shell_resp
  def delete(%CloudShell{} = shell) do
    start_transaction()
    |> add_operation(:shell, fn _ -> Core.Repo.delete(shell) end)
    |> add_operation(:pod, fn _ -> stop(shell) end)
    |> execute(extract: :shell)
  end

  def delete(user_id) when is_binary(user_id) do
    get_shell(user_id)
    |> delete()
  end

  def delete(nil), do: {:error, "no shell available for this user"}

  @doc """
  gets the workspace configuration for a user's cloud shell
  """
  @spec shell_configuration(User.t) :: {:ok, %Core.Shell.Models.Configuration{}} | error
  def shell_configuration(%User{id: id}) do
    get_shell!(id)
    |> Client.configuration()
  end

  @doc """
  Api reimplementation of the cli's bundle install command, this will:
  * call the shell api for updating the context.yaml
  * install the recipe
  * optionally configure oidc
  """
  @spec install_bundle(Recipe.t, map, binary, User.t) :: {:ok, [Installation.t]} | error
  def install_bundle(%Recipe{} = recipe, ctx, oidc, %User{} = user) do
    recipe = Core.Repo.preload(recipe, [:repository])
    start_transaction()
    |> add_operation(:shell, fn _ ->
      update_shell_configuration(ctx, user)
    end)
    |> add_operation(:install, fn _ ->
      Recipes.install(recipe, %{}, user)
    end)
    |> maybe_enable_oidc(oidc, recipe, ctx[recipe.repository.name] || %{}, user)
    |> execute(extract: :install)
  end

  defp maybe_enable_oidc(tx, false, _, _, _), do: tx
  defp maybe_enable_oidc(tx, _, %Recipe{oidc_settings: %Recipe.OIDCSettings{} = settings, repository_id: repo_id}, ctx, %User{id: uid} = user) do
    add_operation(tx, :oidc, fn _ ->
      shell = get_shell!(user.id)
      uris  = redirect_uris(settings, ctx, shell)
      inst  = Repositories.get_installation(uid, repo_id)
              |> Core.Repo.preload([oidc_provider: :bindings])

      Repositories.upsert_oidc_provider(%{
        auth_method: settings.auth_method,
        bindings: oidc_bindings(inst.oidc_provider, user),
        redirect_uris: merge_uris(uris, inst.oidc_provider)
      }, inst.id, user)
    end)
  end
  defp maybe_enable_oidc(tx, _, _, _, _), do: tx

  defp oidc_bindings(nil, %User{id: uid}), do: [%{user_id: uid}]
  defp oidc_bindings(%OIDCProvider{bindings: bindings}, %User{id: uid}) do
    bindings = Enum.map(bindings, fn
      %{user_id: uid, id: id} when is_binary(uid) -> %{user_id: uid, id: id}
      %{group_id: gid, id: id} when is_binary(gid) -> %{group_id: gid, id: id}
    end)

    case Enum.any?(bindings, & &1[:user_id] == uid) do
      true -> bindings
      _ -> [%{user_id: uid} | bindings]
    end
  end

  defp redirect_uris(%Recipe.OIDCSettings{uri_formats: [_ | _] = formats, domain_key: key}, ctx, shell),
    do: Enum.map(formats, &redirect_uri(&1, ctx, key, shell))
  defp redirect_uris(%Recipe.OIDCSettings{uri_format: format, domain_key: key}, ctx, shell) when is_binary(format),
    do: [redirect_uri(format, ctx, key, shell)]

  defp redirect_uri(format, ctx, key, %CloudShell{workspace: %{subdomain: domain}}) do
    format
    |> String.replace("{domain}", ctx[key])
    |> String.replace("{subdomain}", domain)
  end

  defp merge_uris(uris, nil), do: uris
  defp merge_uris(new, %OIDCProvider{redirect_uris: old}), do: Enum.uniq(new ++ old)

  @doc """
  updates a user's shell workspace context (eg for configuring bundles)
  """
  @spec update_shell_configuration(map, User.t) :: {:ok, boolean} | error
  def update_shell_configuration(ctx, %User{id: id}) do
    get_shell!(id)
    |> Client.set_configuration(ctx)
    |> case do
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  @doc """
  Determines if a shell's pod is currently alive
  """
  @spec alive?(CloudShell.t) :: boolean
  def alive?(%CloudShell{pod_name: name}) do
    case Pods.fetch(name) do
      {:ok, pod} -> Pods.liveness(pod)
      _ -> false
    end
  end

  @doc """
  Gets a descriptive status struct for the status of the shell's pod
  """
  @spec status(CloudShell.t) :: Pods.Status.t | nil
  def status(%CloudShell{pod_name: name}) do
    case Pods.fetch(name) do
      {:ok, pod} -> Pods.status(pod)
      _ -> nil
    end
  end

  @doc """
  Reboots a cloud shell instance
  """
  @spec reboot(CloudShell.t | binary) :: {:ok, CloudShell.t} | error
  def reboot(%CloudShell{} = shell) do
    shell = Core.Repo.preload(shell, [:user])
    with {:ok, _} <- do_reboot(shell),
      do: {:ok, shell}
  end

  def reboot(user_id) when is_binary(user_id) do
    get_shell(user_id)
    |> reboot()
  end

  def reboot(nil), do: {:error, "no shell available"}

  defp do_reboot(%CloudShell{pod_name: name} = shell) do
    case Pods.fetch(name) do
      {:ok, pod} -> {:ok, pod}
      _ -> Pods.create(name, shell.user.email)
    end
  end

  @doc """
  Terminates the pod for a given cloud shell or user
  """
  @spec stop(User.t | CloudShell.t) :: {:ok, true} | error
  def stop(%User{id: user_id}) do
    get_shell(user_id)
    |> stop()
  end

  def stop(%CloudShell{pod_name: name}) do
    with {:pod, {:ok, _}} <- {:pod, Pods.fetch(name)},
         {:ok, _} <- Pods.delete(name) do
      {:ok, true}
    else
      {:pod, _} -> {:ok, true}
      err -> err
    end
  end

  def stop(_), do: {:error, :not_found}

  @doc """
  Restarts the cloud shell pod for a given user
  """
  @spec restart(User.t) :: {:ok, true} | error
  def restart(%User{id: user_id}) do
    get_shell(user_id)
    |> do_restart()
  end

  defp do_restart(%CloudShell{} = shell) do
    with {:ok, _} <- stop(shell),
         {:ok, _} <- reboot(shell) do
      {:ok, true}
    end
  end
end
