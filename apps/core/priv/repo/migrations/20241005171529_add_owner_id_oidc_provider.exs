defmodule Core.Repo.Migrations.AddOwnerIdOidcProvider do
  use Ecto.Migration

  def change do
    alter table(:oidc_providers) do
      add :name,        :string
      add :description, :string
      add :owner_id,    references(:users, type: :uuid, on_delete: :delete_all)
    end
  end
end
