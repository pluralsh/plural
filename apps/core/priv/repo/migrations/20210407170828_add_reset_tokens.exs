defmodule Core.Repo.Migrations.AddResetTokens do
  use Ecto.Migration

  def change do
    create table(:reset_tokens, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :external_id, :binary
      add :email,       :string
      add :type,        :integer

      timestamps()
    end

    create unique_index(:reset_tokens, [:external_id])
  end
end
