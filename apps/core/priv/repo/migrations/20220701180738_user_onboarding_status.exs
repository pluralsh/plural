defmodule Core.Repo.Migrations.UserOnboardingStatus do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :onboarding, :integer, default: 0
    end
  end
end
