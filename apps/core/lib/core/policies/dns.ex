defmodule Core.Policies.Dns do
  use Piazza.Policy
  alias Core.Schema.{User, DnsDomain, DnsRecord}

  def can?(%User{account_id: aid}, %DnsDomain{account_id: aid}, _),
    do: :pass

  def can?(%User{id: id}, %DnsRecord{creator_id: id}, :delete), do: :pass
  def can?(%User{account_id: id}, %DnsRecord{} = record, action) when action != :delete do
    case Core.Repo.preload(record, [:domain]) do
      %{domain: %DnsDomain{account_id: ^id}} -> :pass
      _ -> {:error, :forbidden}
    end
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)
  def can?(_, _, _), do: {:error, :forbidden}
end
