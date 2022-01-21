defmodule Core.Services.Shell do
  use Core.Services.Base
  alias Core.Schema.{CloudShell, User}
  alias Core.Services.{Shell.Pods, Dns}
  alias Core.Shell.Scm

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
        |> Core.Repo.insert()
      %{fetch: %CloudShell{} = s} -> {:ok, s}
    end)
    |> add_operation(:dns, fn %{create: %CloudShell{workspace: %CloudShell.Workspace{subdomain: sub}}} ->
      Dns.provision_domain(sub, user)
    end)
    |> add_operation(:git, fn
      %{fetch: nil, create: shell} ->
        %{provider: p, token: t, name: n} = args = attrs[:scm]
        with {:ok, url, pub, priv} <- Scm.setup_repository(p, user.email, t, args[:org], n) do
          shell
          |> CloudShell.changeset(%{git_url: url, ssh_public_key: pub, ssh_private_key: priv})
          |> Core.Repo.update()
        end
      %{create: shell} -> {:ok, shell}
    end)
    |> add_operation(:init, fn %{create: %CloudShell{} = shell} -> reboot(shell) end)
    |> execute(extract: :git)
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
  def reboot(%CloudShell{pod_name: name} = shell) do
    with {:ok, _} <- do_reboot(name),
      do: {:ok, shell}
  end

  def reboot(user_id) when is_binary(user_id) do
    get_shell(user_id)
    |> reboot()
  end

  def reboot(nil), do: {:error, "no shell available"}

  defp do_reboot(name) do
    case Pods.fetch(name) do
      {:ok, pod} -> {:ok, pod}
      _ -> Pods.create(name)
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
end
