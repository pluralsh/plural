defmodule Core.Services.Encryption do
  use Core.Services.Base
  alias Core.Schema.{User, KeyBackup}
  alias Core.Clients.Vault

  @type error :: {:error, term}
  @type backup_resp :: {:ok, Backup.t} | error

  @spec get_backup(binary, binary) :: KeyBackup.t | nil
  def get_backup(user_id, name), do: Core.Repo.get_by(KeyBackup, user_id: user_id, name: name)

  @spec get_backup!(binary, binary) :: KeyBackup.t
  def get_backup!(user_id, name), do: Core.Repo.get_by!(KeyBackup, user_id: user_id, name: name)

  def get_backups(%User{id: user_id}), do: get_backups(user_id)
  def get_backups(user_id) do
    KeyBackup.for_user(user_id)
    |> Core.Repo.all()
  end

  @doc """
  Upserts a new keybackup entry and syncs the key into vault transactionally
  """
  @spec create_backup(map, User.t) :: backup_resp
  def create_backup(%{name: name, key: key} = attrs, %User{id: user_id}) do
    start_transaction()
    |> add_operation(:db, fn _ ->
      case get_backup(user_id, name) do
        %KeyBackup{} = back -> back
        _ -> %KeyBackup{user_id: user_id, vault_path: "/keybackups/#{user_id}/#{name}", fresh: true}
      end
      |> KeyBackup.changeset(Map.put(attrs, :digest, "SHA256:#{Core.sha(key)}"))
      |> Core.Repo.insert_or_update()
    end)
    |> add_operation(:vault, fn
      %{db: %KeyBackup{fresh: true, vault_path: path}} -> Vault.write(path, %{secret: key})
      _ -> {:ok, %{}}
    end)
    |> execute(extract: :db)
  end

  @doc """
  Deletes a backup for the given user, and transactionally ensure vault is cleaned up as well
  """
  @spec delete_backup(binary, User.t) :: backup_resp
  def delete_backup(name, %User{id: user_id}) do
    start_transaction()
    |> add_operation(:db, fn _ ->
      get_backup!(user_id, name)
      |> Core.Repo.delete()
    end)
    |> add_operation(:vault, fn %{db: %{vault_path: p}} -> Vault.delete(p) end)
    |> execute(extract: :db)
  end

  @doc """
  Fetches the key for this backup from vault
  """
  @spec fetch(KeyBackup.t) :: {:ok, binary} | error
  def fetch(%KeyBackup{vault_path: path}) do
    with {:ok, %{"secret" => key}} <- Vault.read(path),
      do: {:ok, key}
  end
end
