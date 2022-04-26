defmodule Core.WorkOS.Resources do
  alias Core.Services.Accounts
  alias Core.Schema.{
    Account,
    Group,
    User,
    AccountDirectory,
    AccountOrganization,
    DomainMapping
  }

  def account(id) do
    %{root_user: user} = account =
        Accounts.get_account!(id)
        |> Core.Repo.preload([:root_user])
    {account, user}
  end

  def get_group(ext_id), do: Core.Repo.get_by(Group, external_id: ext_id)

  def get_user(ext_id), do: Core.Repo.get_by(User, external_id: ext_id)

  def get_organization(id), do: Core.Repo.get_by(AccountOrganization, organization_id: id)

  def get_directory(id), do: Core.Repo.get_by(AccountDirectory, directory_id: id)

  def domain(conn_id), do: Core.Repo.get_by(DomainMapping, workos_connection_id: conn_id)

  def toggle_sso(domains, enabled, conn_id \\ nil) do
    DomainMapping.for_domains(domains)
    |> Core.Repo.update_all(set: [enable_sso: enabled, workos_connection_id: conn_id])
  end

  def create_directory(id, domains) do
    with %Account{id: aid} <- find_account(domains) do
      case get_directory(id) do
        nil -> %AccountDirectory{account_id: aid, directory_id: id}
        %AccountDirectory{} = org -> org
      end
      |> AccountDirectory.changeset()
      |> Core.Repo.insert_or_update()
    end
  end

  def delete_directory(id) do
    case get_directory(id) do
      nil -> :ok
      dir -> Core.Repo.delete(dir)
    end
  end

  def create_org(id, domains) do
    with %Account{id: aid} <- find_account(domains) do
      case get_organization(id) do
        nil -> %AccountOrganization{account_id: aid, organization_id: id}
        %AccountOrganization{} = org -> org
      end
      |> AccountOrganization.changeset()
      |> Core.Repo.insert_or_update()
    end
  end

  def delete_org(id) do
    case get_organization(id) do
      nil -> :ok
      org -> Core.Repo.delete(org)
    end
  end

  def find_account(domains) do
    with dms <- DomainMapping.for_domains(domains) |> Core.Repo.all(),
         [%{account_id: aid}] <- Enum.uniq_by(dms, & &1.account_id) do
      Accounts.get_account!(aid)
    else
      _ -> nil
    end
  end
end
