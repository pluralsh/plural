defmodule Core.Repo.Migrations.BucketUniq do
  use Ecto.Migration

  def change do
    alter table(:cloud_shells) do
      add :bucket_prefix, :string
    end

    create unique_index(:cloud_shells, [:bucket_prefix])
  end
end
